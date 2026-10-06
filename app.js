// Centrado inicial en Ensenada, B.C.
const INITIAL_COORDS = [31.8625, -116.6264];
const INITIAL_ZOOM = 14;

// Inicializar el mapa de Leaflet
const map = L.map('map').setView(INITIAL_COORDS, INITIAL_ZOOM);

// Servidor de Mapas Esri (Gratuito y sin API Key)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors',
  maxZoom: 18
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
      // Criterio 3: Actualización reactiva sin recargar la página
      markers[id].setLatLng([lat, lng]);
      markers[id].getPopup().setContent(popupContent);
    } else {
      // Crear marcador inicial
      const marker = L.circleMarker([lat, lng], {
        radius: 11,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(popupContent);
      markers[id] = marker;
    }
  });
}

// SIMULACIÓN EN TIEMPO REAL CONTINUA
function updateRealtimeData() {
  const simData = [
    {
      "id": "NODE-001",
      "lat": 31.8625 + (Math.random() - 0.5) * 0.0015,
      "lng": -116.6264 + (Math.random() - 0.5) * 0.0015,
      "urgencia": "critico",
      "bateria": Math.floor(15 + Math.random() * 10),
      "timestamp": new Date().toLocaleTimeString()
    },
    {
      "id": "NODE-002",
      "lat": 31.8655 + (Math.random() - 0.5) * 0.0015,
      "lng": -116.6210 + (Math.random() - 0.5) * 0.0015,
      "urgencia": "atrapado",
      "bateria": 65,
      "timestamp": new Date().toLocaleTimeString()
    },
    {
      "id": "NODE-003",
      "lat": 31.8590 + (Math.random() - 0.5) * 0.0015,
      "lng": -116.6300 + (Math.random() - 0.5) * 0.0015,
      "urgencia": "general",
      "bateria": 90,
      "timestamp": new Date().toLocaleTimeString()
    }
  ];

  renderAlerts(simData);
}

// Carga inicial
updateRealtimeData();

// Actualiza las posiciones y datos automáticamente cada 3 segundos
setInterval(updateRealtimeData, 3000);