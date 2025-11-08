// Harita oluşturma
let map = L.map("map").setView([39.0, 35.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;
let userMarker = null;

// Rota verisi (rota.json içeriğini buraya kopyala)
const rotaData = {
  "type": "FeatureCollection",
  "features": [
    // Örnek: KMZ’den dönüştürdüğün tüm noktaları buraya ekle
    {
      "type": "Feature",
      "properties": { "name": "Nokta 1" },
      "geometry": { "type": "Point", "coordinates": [35.0, 39.0] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Nokta 2" },
      "geometry": { "type": "Point", "coordinates": [35.2, 39.1] }
    }
  ]
};

// Markerları ekle ve fitBounds uygula
function addMarkers(rotaData) {
  markers.forEach(m => map.removeLayer(m.marker));
  markers = [];

  const markerLayers = [];

  L.geoJSON(rotaData, {
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.name || "İsimsiz";
      const [lon, lat] = feature.geometry.coordinates;

      layer.bindPopup(`
        <b>${name}</b><br>
        <button onclick="startRoute(${lat}, ${lon})">Yol Tarifi</button>
      `);

      markers.push({ name, lat, lon, marker: layer });
      markerLayers.push(layer);
    }
  }).addTo(map);

  if (markerLayers.length > 0) {
    const group = L.featureGroup(markerLayers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
}

// Başlangıçta markerları ekle
addMarkers(rotaData);

// Arama kutusu
document.getElementById("searchBox").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const found = markers.find(m => m.name.toLowerCase().includes(q));
  if (found) {
    map.setView([found.lat, found.lon], 15);
    found.marker.openPopup();
  }
});

// Canlı kullanıcı konumu optimizasyonu
let lastUpdate = 0;
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((pos) => {
    const now = Date.now();
    if (now - lastUpdate < 500) return; // 0.5 saniyeden kısa aralıkları yoksay
    lastUpdate = now;

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
