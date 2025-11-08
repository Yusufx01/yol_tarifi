let map = L.map("map").setView([39.0, 35.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;
let userMarker = null;

// rota.json yükleme ve haritaya ekleme
async function loadRoute() {
  try {
    const resp = await fetch('rota.json');
    const rotaData = await resp.json();

    markers.forEach(m => map.removeLayer(m.marker));
    markers = [];

    L.geoJSON(rotaData, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "İsimsiz";
        const [lon, lat] = feature.geometry.coordinates;

        layer.bindPopup(`
          <b>${name}</b><br>
          <button onclick="startRoute(${lat}, ${lon})">Yol Tarifi</button>
        `);

        markers.push({ name, lat, lon, marker: layer });
      }
    }).addTo(map);

    if (markers.length > 0) {
      const group = L.featureGroup(markers.map(m => m.marker));
      map.fitBounds(group.getBounds());
    }
  } catch (err) {
    console.error("Rota yüklenemedi:", err);
  }
}

// Site açıldığında rota yükle
loadRoute();

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

    if (routeLine) {
      const destLatLng = routeLine.getLatLngs()[1];
      routeLine.setLatLngs([[lat, lon], destLatLng]);
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
