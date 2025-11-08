let map = L.map("map").setView([39.0, 35.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;
let userMarker = null;

// KMZ dosyası seçildiğinde
document.getElementById("kmzInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const zip = await JSZip.loadAsync(file);
  const kmlFile = Object.keys(zip.files).find(name => name.endsWith(".kml"));
  const kmlText = await zip.files[kmlFile].async("text");

  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, "text/xml");
  const placemarks = xml.getElementsByTagName("Placemark");

  markers = [];
  map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });

  for (let p of placemarks) {
    const name = p.getElementsByTagName("name")[0]?.textContent || "İsimsiz";
    const coords = p.getElementsByTagName("coordinates")[0]?.textContent.trim();
    if (!coords) continue;

    const [lon, lat] = coords.split(",").map(Number);

    const marker = L.marker([lat, lon]).addTo(map).bindPopup(`
      <b>${name}</b><br>
      <button onclick="startRoute(${lat}, ${lon})">Yol Tarifi</button>
    `);
    markers.push({ name, lat, lon, marker });
  }

  if (markers.length > 0) {
    const group = L.featureGroup(markers.map(m => m.marker));
    map.fitBounds(group.getBounds());
  }
});

// Arama kutusu
document.getElementById("searchBox").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const found = markers.find(m => m.name.toLowerCase().includes(q));
  if (found) {
    map.setView([found.lat, found.lon], 15);
    found.marker.openPopup();
  }
});

// Canlı kullanıcı konumu
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    if (!userMarker) {
      const carIcon = L.icon({ iconUrl: 'car.png', iconSize: [32, 32] });
      userMarker = L.marker([lat, lon], { icon: carIcon }).addTo(map).bindPopup("Senin Konumun");
    } else {
      userMarker.setLatLng([lat, lon]);
    }

    // Rotayı güncelle
    if (routeLine) {
      routeLine.setLatLngs([[lat, lon], routeLine.getLatLngs()[1]]);
    }

    map.setView([lat, lon], map.getZoom());
  }, (err) => console.error(err), { enableHighAccuracy: true, maximumAge: 1000 });
}

// Yol tarifi başlat
function startRoute(destLat, destLon) {
  if (userMarker) {
    const startLatLng = userMarker.getLatLng();
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline([startLatLng, [destLat, destLon]], { color: 'blue', dashArray: '5,10' }).addTo(map);
  }
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`);
}
