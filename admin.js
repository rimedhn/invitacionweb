// Configuración
const SCRIPT_URL = 'TU_URL_DE_WEB_APP_AQUI'; // Reemplazar con la URL de tu Google Apps Script

let allGuests = [];
let currentFilter = 'all';

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadGuestsData();
});

// Cargar datos de invitados
async function loadGuestsData() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllGuests`);
        const data = await response.json();
        
        if (data.success) {
            allGuests = data.guests;
            updateSummary();
            displayGuests(allGuests);
        } else {
            document.getElementById('guestsTableBody').innerHTML = '<tr><td colspan="4" class="loading">Error al cargar datos</td></tr>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('guestsTableBody').innerHTML = '<tr><td colspan="4" class="loading">Error de conexión</td></tr>';
    }
}

// Actualizar resumen
function updateSummary() {
    const confirmed = allGuests.filter(g => g.estatus === 'Confirmado');
    const pending = allGuests.filter(g => g.estatus === 'Pendiente');
    const declined = allGuests.filter(g => g.estatus === 'No asistirá');
    
    const confirmedSeats = confirmed.reduce((sum, g) => sum + parseInt(g.asientos || 0), 0);
    const pendingSeats = pending. reduce((sum, g) => sum + parseInt(g.asientos || 0), 0);
    const declinedSeats = declined.reduce((sum, g) => sum + parseInt(g.asientos || 0), 0);
    const totalSeats = allGuests.reduce((sum, g) => sum + parseInt(g.asientos || 0), 0);
    
    document.getElementById('confirmedCount').textContent = confirmedSeats;
    document.getElementById('pendingCount').textContent = pendingSeats;
    document.getElementById('declinedCount').textContent = declinedSeats;
    document.getElementById('totalSeats').textContent = totalSeats;
}

// Mostrar invitados en la tabla
function displayGuests(guests) {
    const tbody = document.getElementById('guestsTableBody');
    
    if (guests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay invitados para mostrar</td></tr>';
        return;
    }
    
    tbody.innerHTML = guests.map(guest => `
        <tr>
            <td>${guest.nombre}</td>
            <td>${guest.telefono}</td>
            <td>${guest.asientos}</td>
            <td><span class="status-badge status-${getStatusClass(guest.estatus)}">${guest.estatus}</span></td>
        </tr>
    `).join('');
}

// Obtener clase de estado
function getStatusClass(status) {
    switch(status) {
        case 'Confirmado': return 'confirmed';
        case 'Pendiente': return 'pending';
        case 'No asistirá': return 'declined';
        default: return 'pending';
    }
}

// Filtrar invitados
function filterGuests(filter) {
    currentFilter = filter;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar datos
    let filtered = allGuests;
    if (filter !== 'all') {
        filtered = allGuests.filter(g => g.estatus === filter);
    }
    
    displayGuests(filtered);
}

// Buscar invitados
function searchGuests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = allGuests;
    if (currentFilter !== 'all') {
        filtered = allGuests.filter(g => g.estatus === currentFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(g => 
            g.nombre.toLowerCase().includes(searchTerm) ||
            g.telefono.includes(searchTerm)
        );
    }
    
    displayGuests(filtered);
}

// Refrescar datos
function refreshData() {
    document.getElementById('guestsTableBody').innerHTML = '<tr><td colspan="4" class="loading">Actualizando datos...</td></tr>';
    loadGuestsData();
}
