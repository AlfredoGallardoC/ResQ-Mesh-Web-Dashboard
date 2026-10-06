// Centrado inicial en Ensenada, B.C.
const INITIAL_COORDS = [31.8625, -116.6264];
const INITIAL_ZOOM = 14;

// Inicializar el mapa de Leaflet
const map = L.map('map').setView(INITIAL_COORDS, INITIAL_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ResQ-Mesh Dashboard'
}).addTo(map);

const markers = {};

// Criterio 1: Asignación de colores por severidad
function getColor(urgencia) {
  switch (urgencia.toLowerCase()) {
    case 'critico':
      return '#ff3b30'; // Rojo
    case 'atrapado':
      return '#ff9500'; // Naranja
    case 'general':
      return '#ffcc00'; // Amarillo
    default:
      return '#00d2ff';
  }
}

// Criterios 1, 2 y 3: Renderizado y actualización dinámica
function renderAlerts(alerts) {
  alerts.forEach(alert => {
    const { id, lat, lng, urgencia, bateria, timestamp } = alert;
    const color = getColor(urgencia);

    // Criterio 2: Ventana flotante (Popup)
    const popupContent = `
      <div class="popup-container">
        <h3>Nodo: ${id}</h3>
        <p><strong>Urgencia:</strong> <span style="color: ${color}; font-weight: bold;">${urgencia.toUpperCase()}</span></p>
        <p><strong>Batería:</strong> ${bateria}%</p>
        <p><strong>Hora:</strong> ${timestamp}</p>
        <p><strong>Coordenadas:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
      </div>
    `;

    if (markers[id]) {
      // Criterio 3: Actualizar posición/popup dinámicamente sin recargar
      markers[id].setLatLng([lat, lng]);
      markers[id].getPopup().setContent(popupContent);
    } else {
      // Crear marcador por código de color
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      marker.bindPopup(popupContent);
      markers[id] = marker;
    }
  });
}

// Consumo de la trama JSON
async function fetchAlerts() {
  try {
    const response = await fetch('mock_data.json');
    const data = await response.json();
    renderAlerts(data);
  } catch (error) {
    console.error('Error al leer las tramas JSON de prueba:', error);
  }
}

// Carga inicial y actualización automática (Polling)
fetchAlerts();
setInterval(fetchAlerts, 5000);