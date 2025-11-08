// Harita oluşturma
let map = L.map("map").setView([39.0, 35.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;
let userMarker = null;

// KMZ yerine gömülü GeoJSON verisi
const rotaData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Örnek Nokta 1" },
      "geometry": { "type": "Point", "coordinates": [35.0, 39.0] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Örnek Nokta 2" },
      "geometry": { "type": "Point", "coordinates": [35.2, 39.1] }
    }
    // Buraya tüm KMZ noktalarını GeoJSON formatında ekleyebilirsin
  ]
};

// GeoJSON verisini haritaya ekle
L.geoJSON(rotaData, {
  onEachFeature: (feature, layer) => {
    if (feature.properties.name) {
      layer.bindPopup(`
        <b>${feature.properties.name}</b><br>
        <button onclick="startRoute(${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]})">Yol Tarifi</button>
      `);
      markers.push({
        name: feature.properties.name,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        marker: layer
      });
    }
  }
}).addTo(map);

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
  // Google Maps yönlendirmesi
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`);
}
