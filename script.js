// Configuración de Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-A7URvkN1odiHv09EENhQmYyO45EG-CeteHUsIyvkDoidkD6WlY_Q2odP6yhVFssGLQ/exec'; // Reemplazar con la URL de tu Google Apps Script
const ADMIN_PIN = '202601'; // PIN de acceso para el administrador

// Countdown Timer
function updateCountdown() {
    const weddingDate = new Date('2026-02-28T14:00:00');
    const now = new Date();
    const difference = weddingDate - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days. toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    } else {
        document. getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
    }
}

// Iniciar countdown
setInterval(updateCountdown, 1000);
updateCountdown();

// Modal de RSVP
let currentGuest = null;

function showRSVP() {
    document.getElementById('rsvpModal').style.display = 'block';
    document.getElementById('rsvpStep1').style.display = 'block';
    document.getElementById('rsvpStep2').style.display = 'none';
    document.getElementById('rsvpMessage').style.display = 'none';
    document.getElementById('phoneNumber').value = '';
}

function closeRSVP() {
    document.getElementById('rsvpModal').style.display = 'none';
    currentGuest = null;
}

// Verificar invitado por teléfono
async function verifyGuest() {
    const phone = document.getElementById('phoneNumber').value. trim();
    
    if (!phone) {
        alert('Por favor ingrese su número de teléfono');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=verifyGuest&phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (data.success) {
            currentGuest = data.guest;
            document.getElementById('guestName').textContent = data.guest.nombre;
            document.getElementById('guestSeats').textContent = data.guest. asientos;
            
            // Preseleccionar estado actual si existe
            if (data.guest. estatus === 'Confirmado') {
                document.querySelector('input[name="attendance"][value="Confirmado"]').checked = true;
            } else if (data.guest.estatus === 'No asistirá') {
                document.querySelector('input[name="attendance"][value="No asistirá"]').checked = true;
            }
            
            document.getElementById('rsvpStep1').style.display = 'none';
            document.getElementById('rsvpStep2').style.display = 'block';
        } else {
            alert('No encontramos su número de teléfono en la lista de invitados. Por favor contacte a los novios.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al verificar su información.  Por favor intente nuevamente.');
    }
}

// Enviar confirmación de asistencia
async function submitRSVP() {
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    
    if (!currentGuest) {
        alert('Error: No se encontró información del invitado');
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=updateRSVP`, {
            method: 'POST',
            body: JSON.stringify({
                phone: currentGuest.telefono,
                status: attendance
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('rsvpStep2').style.display = 'none';
            document.getElementById('rsvpMessage').style.display = 'block';
            
            if (attendance === 'Confirmado') {
                document.getElementById('messageText').textContent = '¡Gracias por confirmar tu asistencia!  Nos vemos el 28 de febrero.  💚';
            } else {
                document.getElementById('messageText').textContent = 'Gracias por informarnos. Lamentamos que no puedas acompañarnos. ';
            }
            
            setTimeout(() => {
                closeRSVP();
            }, 3000);
        } else {
            alert('Ocurrió un error al guardar su confirmación. Por favor intente nuevamente.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al enviar su confirmación. Por favor intente nuevamente.');
    }
}

// Modal de Admin
function showAdminLogin() {
    document.getElementById('adminModal').style.display = 'block';
    document.getElementById('adminPin').value = '';
    document.getElementById('adminError').textContent = '';
}

function closeAdminLogin() {
    document.getElementById('adminModal').style.display = 'none';
}

function verifyAdmin() {
    const pin = document.getElementById('adminPin').value;
    
    if (pin === ADMIN_PIN) {
        window.location.href = 'admin.html';
    } else {
        document.getElementById('adminError').textContent = 'PIN incorrecto. Intente nuevamente.';
    }
}

// Cerrar modales al hacer click fuera de ellos
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
