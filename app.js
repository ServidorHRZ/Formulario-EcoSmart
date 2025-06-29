// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCj0ovRnEnu94mJZRaxnieG6ECkD5skGGw",
    authDomain: "formulario-ecosmart.firebaseapp.com",
    projectId: "formulario-ecosmart",
    storageBucket: "formulario-ecosmart.firebasestorage.app",
    messagingSenderId: "209581446597",
    appId: "1:209581446597:web:445fff5aecc6bb786227ac",
    measurementId: "G-W2775H785F"
};

// Configuración de ImgBB
const IMGBB_API_KEY = '70de1dbb5760b7a747889fe021235371';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Referencias a elementos del DOM
const postulacionForm = document.getElementById('postulacionForm');
const cedulaFrenteInput = document.getElementById('cedulaFrente');
const cedulaTraseraInput = document.getElementById('cedulaTrasera');
const cedulaFrentePreview = document.getElementById('cedula-frente-preview');
const cedulaTraseraPreview = document.getElementById('cedula-trasera-preview');

// Preview de cédula frontal
cedulaFrenteInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2048000) { // 2MB máximo
            alert('La imagen es demasiado grande. El tamaño máximo es 2MB.');
            cedulaFrenteInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            cedulaFrentePreview.innerHTML = `<img src="${e.target.result}" alt="Preview Cédula Frontal">`;
        };
        reader.readAsDataURL(file);
    }
});

// Preview de cédula trasera
cedulaTraseraInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2048000) { // 2MB máximo
            alert('La imagen es demasiado grande. El tamaño máximo es 2MB.');
            cedulaTraseraInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            cedulaTraseraPreview.innerHTML = `<img src="${e.target.result}" alt="Preview Cédula Trasera">`;
        };
        reader.readAsDataURL(file);
    }
});

// Función para subir imagen a ImgBB
async function subirImagen(file) {
    if (!file) return null;
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error al subir la imagen');
        }
        
        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
    }
}

// Función para obtener el siguiente número de postulación
async function obtenerSiguienteNumero() {
    try {
        const contadorRef = doc(db, 'contadores', 'postulaciones');
        const contadorDoc = await getDoc(contadorRef);
        
        if (contadorDoc.exists()) {
            const nuevoNumero = contadorDoc.data().ultimo + 1;
            await updateDoc(contadorRef, { ultimo: nuevoNumero });
            return nuevoNumero;
        } else {
            // Si no existe el contador, créalo empezando en 1
            await setDoc(contadorRef, { ultimo: 1 });
            return 1;
        }
    } catch (error) {
        console.error('Error al obtener siguiente número:', error);
        // Si hay error, usar timestamp como fallback
        return Date.now();
    }
}

// Función para obtener todos los valores del formulario
function obtenerValoresFormulario() {
    const formData = new FormData(postulacionForm);
    const datos = {};
    
    // Obtener todos los campos de texto, select y radio buttons
    for (let [key, value] of formData.entries()) {
        if (value !== '' && key !== 'cedulaFrente' && key !== 'cedulaTrasera') {
            // Si es un checkbox, crear array para múltiples valores
            if (key === 'sectores' || key === 'areas') {
                if (!datos[key]) datos[key] = [];
                datos[key].push(value);
            } else {
                datos[key] = value;
            }
        }
    }
    
    // Convertir valores numéricos específicos
    if (datos.experiencia) datos.experiencia = Number(datos.experiencia);
    if (datos.obligacionesEconomicas) datos.obligacionesEconomicas = Number(datos.obligacionesEconomicas);
    if (datos.aspiracionSalarial) datos.aspiracionSalarial = Number(datos.aspiracionSalarial);
    if (datos.numeroDependientes) datos.numeroDependientes = Number(datos.numeroDependientes);
    if (datos.anoFinalizacion) datos.anoFinalizacion = Number(datos.anoFinalizacion);
    
    // Convertir sueldos de experiencia laboral
    if (datos.empresa1_sueldoInicial) datos.empresa1_sueldoInicial = Number(datos.empresa1_sueldoInicial);
    if (datos.empresa1_sueldoFinal) datos.empresa1_sueldoFinal = Number(datos.empresa1_sueldoFinal);
    if (datos.empresa1_porcentajeTiempo) datos.empresa1_porcentajeTiempo = Number(datos.empresa1_porcentajeTiempo);
    
    return datos;
}

// Manejar envío del formulario
postulacionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Mostrar estado de carga
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        console.log('Iniciando proceso de envío...');
        
        // Obtener el siguiente número de postulación
        const numeroPostulacion = await obtenerSiguienteNumero();
        console.log('Número de postulación asignado:', numeroPostulacion);
        
        // Obtener datos del formulario
        const datos = obtenerValoresFormulario();
        console.log('Datos del formulario:', datos);
        
        // Subir imágenes de cédula a ImgBB
        const cedulaFrenteFile = cedulaFrenteInput.files[0];
        const cedulaTraseraFile = cedulaTraseraInput.files[0];
        
        if (cedulaFrenteFile) {
            console.log('Subiendo cédula frontal...');
            datos.cedulaFrenteUrl = await subirImagen(cedulaFrenteFile);
            console.log('Cédula frontal subida:', datos.cedulaFrenteUrl);
        }
        
        if (cedulaTraseraFile) {
            console.log('Subiendo cédula trasera...');
            datos.cedulaTraseraUrl = await subirImagen(cedulaTraseraFile);
            console.log('Cédula trasera subida:', datos.cedulaTraseraUrl);
        }
        
        // Agregar información adicional
        datos.id = numeroPostulacion;
        datos.fechaPostulacion = serverTimestamp();
        datos.fechaCreacion = new Date().toISOString();
        datos.estado = 'pendiente';
        
        console.log('Datos finales a guardar:', datos);
        
        // Guardar en Firestore usando el número como ID del documento
        const docId = `postulacion_${numeroPostulacion.toString().padStart(6, '0')}`;
        await setDoc(doc(db, 'postulaciones', docId), datos);
        console.log('Postulación guardada con ID:', docId);
        
        // Mostrar modal de éxito
        mostrarModal();
        
        // Limpiar formulario
        postulacionForm.reset();
        cedulaFrentePreview.innerHTML = '';
        cedulaTraseraPreview.innerHTML = '';
        
        console.log('Proceso completado exitosamente');
        
    } catch (error) {
        console.error('Error al enviar la postulación:', error);
        alert('Error al enviar la postulación: ' + error.message);
    } finally {
        // Restaurar botón
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Postulación';
    }
});

// Funciones para el modal
function mostrarModal() {
    const modal = document.getElementById('modalExito');
    modal.classList.add('active');
}

window.cerrarModal = function() {
    const modal = document.getElementById('modalExito');
    modal.classList.remove('active');
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modalExito');
    if (e.target === modal) {
        cerrarModal();
    }
});

// Inicialización del formulario
document.addEventListener('DOMContentLoaded', () => {
    console.log('Formulario de postulación inicializado correctamente');
}); 