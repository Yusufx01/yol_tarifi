// 🌍 Haritayı başlat
let map = L.map('map').setView([39.0, 35.0], 6);
let markers = [];
let carMarker;

// 🗺️ OpenStreetMap katmanı
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 🚀 rota.json dosyasını otomatik yükle
fetch('assets/rota.json')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      filter: f => f.geometry.type === 'Point',
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || 'Saha';
        layer.bindPopup(name);
        markers.push({ name, layer });

        // Marker'a tıklanınca Google Maps yönlendirmesi aç
        layer.on('click', () => {
          const { lat, lng } = layer.getLatLng();
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        });
      }
    }).addTo(map);
  })
  .catch(err => console.error('rota.json yüklenemedi:', err));

// 🔍 Saha arama
document.getElementById('searchBtn').addEventListener('click', () => {
  const name = document.getElementById('searchInput').value.trim().toLowerCase();
  const found = markers.find(m => m.name.toLowerCase().includes(name));
  if (found) {
    map.setView(found.layer.getLatLng(), 14);
    found.layer.openPopup();
    const { lat, lng } = found.layer.getLatLng();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  } else {
    alert('Saha bulunamadı!');
  }
});

// 📍 Canlı konum takibi
document.getElementById('locationBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (!carMarker) {
        carMarker = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: 'car.png',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }).addTo(map);
      } else {
        carMarker.setLatLng([lat, lon]);
      }

      map.setView([lat, lon]);
    }, (err) => {
      alert('Konum alınamadı: ' + err.message);
    }, { enableHighAccuracy: true });
  } else {
    alert('Tarayıcı konum erişimini desteklemiyor.');
  }
});
