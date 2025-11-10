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

// GEOJSON VERİLERİ YÜKLE
fetch('assets/rota.json')
  .then(res => res.json())
  .then(data => {
    const markers = [];

    // MARKER OLUŞTUR
    data.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        <b>${feature.properties.Sıte_Name}</b><br>
        <button onclick="openRoute(${lat}, ${lng})">Yol Tarifi</button>
      `);

      markers.push({
        name: feature.properties.Sıte_Name,
        lowerName: feature.properties.Sıte_Name.toLowerCase(),
        marker
      });
    });

    // ARAMA ELEMANLARI
    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestions');
    const searchBtn = document.getElementById('searchBtn');

    // YAZARKEN ÖNERİ
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      suggestions.innerHTML = '';

      if (!query) return;

      const matches = markers.filter(m => m.lowerName.includes(query));

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

      // TEK EŞLEŞME VARSA OTOMATİK ODakLAN
      if (matches.length === 1) {
        map.setView(matches[0].marker.getLatLng(), 16);
        matches[0].marker.openPopup();
      }
    });

    // ARA BUTONUNA TIKLANDIĞINDA
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.toLowerCase();
      const found = markers.find(m => m.lowerName.includes(query));
      if(found) {
        map.setView(found.marker.getLatLng(), 16);
        found.marker.openPopup();
        suggestions.innerHTML = '';
      } else {
        alert('Saha bulunamadı.');
      }
    });

  });
