// Harita oluşturma
let map = L.map("map").setView([39.0, 35.0], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let routeLine = null;
let userMarker = null;

// Rota verisi doğrudan JS değişkeni
const rotaData = {
  "type": "FeatureCollection",
  "features": [
    // Buraya KMZ’den dönüştürdüğün gerçek noktaları ekle
    {
      "type": "Feature",
      "properties": { "name": "Gerçek Nokta 1" },
      "geometry": { "type": "Point", "coordinates": [35.123, 39.456] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Gerçek Nokta 2" },
      "geometry": { "type": "Point", "coordinates": [35.789, 39.654] }
    }
    // diğer noktaları buraya ekle
  ]
};

// Markerları ekle
function addMarkers() {
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

// Markerları ekle
addMarkers();

// Arama, kullanıcı konumu ve rota çizimi kodları aynı şekilde kalabilir
