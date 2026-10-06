// Centrado inicial en Ensenada, B.C.
const INITIAL_COORDS = [31.8625, -116.6264];
const INITIAL_ZOOM = 14;

// Inicializar el mapa de Leaflet
const map = L.map('map').setView(INITIAL_COORDS, INITIAL_ZOOM);

// Servidor de Mapas Gratis y Sin API Key (Esri World Topo Map)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, MapmyIndia, &copy; OpenStreetMap contributors',
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
      // Criterio 3: Actualizar posición/popup dinámicamente sin recargar
      markers[id].setLatLng([lat, lng]);
      markers[id].getPopup().setContent(popupContent);
    } else {
      // Crear marcador por código de color
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

// Tramas de prueba locales para evitar bloqueos de CORS al abrir directamente index.html
const defaultAlerts = [
  {
    "id": "NODE-001",
    "lat": 31.8625,
    "lng": -116.6264,
    "urgencia": "critico",
    "bateria": 20,
    "timestamp": "2026-10-06 23:30:00"
  },
  {
    "id": "NODE-002",
    "lat": 31.8655,
    "lng": -116.6210,
    "urgencia": "atrapado",
    "bateria": 65,
    "timestamp": "2026-10-06 23:28:15"
  },
  {
    "id": "NODE-003",
    "lat": 31.8590,
    "lng": -116.6300,
    "urgencia": "general",
    "bateria": 90,
    "timestamp": "2026-10-06 23:25:00"
  }
];

// Cargar tramas JSON de prueba (con fallback local)
async function fetchAlerts() {
  try {
    const response = await fetch('mock_data.json');
    if (!response.ok) throw new Error('CORS o archivo no encontrado');
    const data = await response.json();
    renderAlerts(data);
  } catch (error) {
    // Si se abre directo con file:///, usa las tramas predeterminadas
    renderAlerts(defaultAlerts);
  }
}

// Carga inicial y refresco dinámico
fetchAlerts();
setInterval(fetchAlerts, 5000);