// HARİTAYI OLUŞTUR
const map = L.map('map').setView([36.9784, 35.5813], 13);

// HARİTA KATMANI
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// GOOGLE MAPS YÖNLENDİRME
function openRoute(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}

// ARAMA ELEMENTLERİNİ TANIMLA
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const searchBtn = document.getElementById('searchBtn');

// MARKERS ARRAY'İ
let markers = [];

// GEOJSON VERİLERİ YÜKLE
fetch('assets/rota.json')
  .then(res => res.json())
  .then(data => {
    markers = data.features
      .filter(feature => {
        const coords = feature.geometry?.coordinates;
        const name = feature.properties?.name?.trim(); // <-- Burada name kullanıyoruz
        return coords &&
               Array.isArray(coords) &&
               coords.length >= 2 &&
               !isNaN(coords[0]) &&
               !isNaN(coords[1]) &&
               name && name.length > 0;
      })
      .map(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const siteName = feature.properties.name.trim(); // <-- Burada da name

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
          <b>${siteName}</b><br>
          <button onclick="openRoute(${lat}, ${lng})">Yol Tarifi</button>
        `);

        return {
          name: siteName,
          lowerName: siteName.toLowerCase(),
          marker
        };
      });

    // Arama listener fetch tamamlandıktan sonra
    searchInput.addEventListener('input', () => {
      searchAndFocus(searchInput.value);
    });
  });

// ARAMA FONKSİYONU
function searchAndFocus(query) {
  if (!markers.length) return;
  const q = query.trim().toLowerCase();
  const matches = markers.filter(m => m.lowerName.includes(q));

  suggestions.innerHTML = '';
  matches.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m.name;
    li.addEventListener('click', () => {
      map.setView(m.marker.getLatLng(), 16);
      m.marker.openPopup();
      suggestions.innerHTML = '';
      searchInput.value = m.name;
    });
    suggestions.appendChild(li);
  });

  if (matches.length === 1) {
    map.setView(matches[0].marker.getLatLng(), 16);
    matches[0].marker.openPopup();
  }
}

// ARA BUTONU
searchBtn.addEventListener('click', () => {
  const query = searchInput.value;
  if (!query) return;
  const found = markers.find(m => m.lowerName.includes(query));
  if (found) {
    map.setView(found.marker.getLatLng(), 16);
    found.marker.openPopup();
    suggestions.innerHTML = '';
  } else {
    alert('Saha bulunamadı.');
  }
});
