// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables globales
let todasLasPostulaciones = [];
let postulacionesFiltradas = [];
let usuarioAutenticado = false;
let filtroEstadoActivo = 'pendiente'; // Filtro por defecto

// Referencias a elementos del DOM
const totalPostulaciones = document.getElementById('totalPostulaciones');
const pendientesCount = document.getElementById('pendientesCount');
const aceptadosCount = document.getElementById('aceptadosCount');
const rechazadosCount = document.getElementById('rechazadosCount');
const filtroEstado = document.getElementById('filtroEstado');
const filtroBusqueda = document.getElementById('filtroBusqueda');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
const postulacionesContainer = document.getElementById('postulacionesContainer');
const modalDetalles = document.getElementById('modalDetalles');
const modalTitulo = document.getElementById('modalTitulo');
const modalBody = document.getElementById('modalBody');

// Referencias a elementos del login
const modalLogin = document.getElementById('modalLogin');
const formLogin = document.getElementById('formLogin');
const loginUser = document.getElementById('loginUser');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const mainContent = document.getElementById('mainContent');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Función para cargar todas las postulaciones
async function cargarPostulaciones() {
    try {
        console.log('Cargando postulaciones...');
        
        // Mostrar loading
        postulacionesContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Cargando postulaciones...
            </div>
        `;
        
        // Crear query para obtener postulaciones ordenadas por fecha
        const q = query(collection(db, 'postulaciones'), orderBy('fechaCreacion', 'desc'));
        
        // Escuchar cambios en tiempo real
        onSnapshot(q, (snapshot) => {
            todasLasPostulaciones = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                todasLasPostulaciones.push({
                    docId: doc.id, // ID del documento de Firestore
                    dataId: data.id, // ID que viene en los datos
                    ...data
                });
            });
            
            console.log(`Cargadas ${todasLasPostulaciones.length} postulaciones`);
            
            // Actualizar estadísticas
            actualizarEstadisticas();
            
            // Aplicar filtros y mostrar postulaciones
            aplicarFiltros();
        });
        
    } catch (error) {
        console.error('Error al cargar postulaciones:', error);
        postulacionesContainer.innerHTML = `
            <div class="no-results">
                Error al cargar postulaciones: ${error.message}
            </div>
        `;
    }
}

// Función para actualizar estadísticas
function actualizarEstadisticas() {
    const total = todasLasPostulaciones.length;
    let pendientes = 0;
    let aceptados = 0;
    let rechazados = 0;
    
    todasLasPostulaciones.forEach(postulacion => {
        switch (postulacion.estado) {
            case 'pendiente':
                pendientes++;
                break;
            case 'aceptado':
                aceptados++;
                break;
            case 'rechazado':
                rechazados++;
                break;
        }
    });
    
    totalPostulaciones.textContent = total;
    pendientesCount.textContent = pendientes;
    aceptadosCount.textContent = aceptados;
    rechazadosCount.textContent = rechazados;
}

// Función para aplicar filtros
function aplicarFiltros() {
    // Usar el filtro de estado activo si no hay uno específico seleccionado
    const estadoSeleccionado = filtroEstado.value || filtroEstadoActivo;
    const ciudadSeleccionada = document.getElementById('filtroCiudad').value;
    const cedulaBusqueda = document.getElementById('filtroCedula').value.trim();
    const textoBusqueda = filtroBusqueda.value.toLowerCase().trim();
    
    postulacionesFiltradas = todasLasPostulaciones.filter(postulacion => {
        // Filtro por estado
        const cumpleEstado = !estadoSeleccionado || postulacion.estado === estadoSeleccionado;
        
        // Filtro por ciudad
        let cumpleCiudad = true;
        if (ciudadSeleccionada) {
            if (ciudadSeleccionada === 'otra') {
                // Para "otra ciudad", verificar que no sea ninguna de las ciudades principales
                const ciudadesPrincipales = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Manizales'];
                cumpleCiudad = postulacion.ciudad && !ciudadesPrincipales.includes(postulacion.ciudad);
            } else {
                cumpleCiudad = postulacion.ciudad && postulacion.ciudad.toLowerCase().includes(ciudadSeleccionada.toLowerCase());
            }
        }
        
        // Filtro por cédula específica
        const cumpleCedula = !cedulaBusqueda || 
            (postulacion.cedula && postulacion.cedula.includes(cedulaBusqueda));
        
        // Filtro por búsqueda general (nombre, apellidos, cargo, email, profesión)
        const cumpleBusqueda = !textoBusqueda || 
            (postulacion.nombres && postulacion.nombres.toLowerCase().includes(textoBusqueda)) ||
            (postulacion.apellidos && postulacion.apellidos.toLowerCase().includes(textoBusqueda)) ||
            (postulacion.cedula && postulacion.cedula.includes(textoBusqueda)) ||
            (postulacion.cargo && postulacion.cargo.toLowerCase().includes(textoBusqueda)) ||
            (postulacion.email && postulacion.email.toLowerCase().includes(textoBusqueda)) ||
            (postulacion.profesion && postulacion.profesion.toLowerCase().includes(textoBusqueda));
        
        return cumpleEstado && cumpleCiudad && cumpleCedula && cumpleBusqueda;
    });
    
    mostrarPostulaciones();
}

// Función para mostrar postulaciones
function mostrarPostulaciones() {
    if (postulacionesFiltradas.length === 0) {
        postulacionesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron postulaciones que coincidan con los filtros aplicados.</p>
            </div>
        `;
        return;
    }
    
    const html = postulacionesFiltradas.map((postulacion, index) => crearTarjetaPostulacion(postulacion, index + 1)).join('');
    postulacionesContainer.innerHTML = html;
}

// Función para crear tarjeta de postulación
function crearTarjetaPostulacion(postulacion, numeroOrden) {
    const fecha = postulacion.fechaCreacion ? 
        new Date(postulacion.fechaCreacion).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';
    
    const estadoClass = `status-${postulacion.estado}`;
    const displayId = numeroOrden || postulacion.dataId || postulacion.docId || 'N/A';
    
    // Obtener información de contacto prioritaria
    const telefonoPrincipal = postulacion.celular || postulacion.telefono || 'N/A';
    const ciudad = postulacion.ciudad || 'N/A';
    const experiencia = postulacion.experiencia ? `${postulacion.experiencia} años` : 'N/A';
    
    return `
        <div class="postulacion-card">
            <div class="card-header">
                <div class="header-info">
                    <h3>Postulación #${displayId}</h3>
                    <div class="candidate-name">${(postulacion.nombres || '') + ' ' + (postulacion.apellidos || '')}</div>
                </div>
                <span class="status-badge ${estadoClass}">${postulacion.estado || 'N/A'}</span>
            </div>
            <div class="card-body">
                <div class="candidate-summary">
                    <div class="summary-main">
                        <div class="summary-item">
                            <i class="fas fa-id-card"></i>
                            <span>C.C. ${postulacion.cedula || 'N/A'}</span>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${ciudad}</span>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-phone"></i>
                            <span>${telefonoPrincipal}</span>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-briefcase"></i>
                            <span>${experiencia} exp.</span>
                        </div>
                    </div>
                </div>
                
                <div class="postulacion-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">Nombre Completo</span>
                            <span class="detail-value">${(postulacion.nombres || '') + ' ' + (postulacion.apellidos || '')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${postulacion.email || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <span class="detail-label">Cargo de Interés</span>
                            <span class="detail-value">${postulacion.cargo || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de Postulación</span>
                            <span class="detail-value">${fecha}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-action btn-ver" data-action="ver-detalles" data-doc-id="${postulacion.docId}">
                        <i class="fas fa-eye"></i> Ver Detalles Completos
                    </button>
                    ${postulacion.estado === 'pendiente' ? `
                        <button class="btn-action btn-aceptar" data-action="cambiar-estado" data-doc-id="${postulacion.docId}" data-estado="aceptado">
                            <i class="fas fa-check-circle"></i> Aceptar Candidato
                        </button>
                        <button class="btn-action btn-rechazar" data-action="cambiar-estado" data-doc-id="${postulacion.docId}" data-estado="rechazado">
                            <i class="fas fa-times-circle"></i> Rechazar
                        </button>
                    ` : postulacion.estado === 'aceptado' ? `
                        <div class="status-info">
                            <i class="fas fa-check-circle"></i> Candidato Aceptado
                        </div>
                    ` : `
                        <div class="status-info rejected">
                            <i class="fas fa-times-circle"></i> Candidato Rechazado
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Función para ver detalles de una postulación
function verDetalles(docId) {
    console.log('Ver detalles para docId:', docId);
    const postulacion = todasLasPostulaciones.find(p => p.docId === docId);
    if (!postulacion) {
        console.error('No se encontró la postulación con docId:', docId);
        alert('No se encontró la postulación');
        return;
    }
    
    const displayId = postulacion.dataId || postulacion.docId;
    modalTitulo.textContent = `Postulación #${displayId} - ${postulacion.apellidos} ${postulacion.nombres}`;
    
    const html = crearHTMLDetallesCompleto(postulacion);
    modalBody.innerHTML = html;
    modalDetalles.classList.add('active');
}

// Función para crear HTML completo de detalles
function crearHTMLDetallesCompleto(postulacion) {
    return `
        <!-- Encabezado -->
        <div class="detail-section">
            <h3><i class="fas fa-calendar-alt"></i> Encabezado</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Cargo de Interés</span>
                    <span class="info-value">${postulacion.cargo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Código Cargo</span>
                    <span class="info-value">${postulacion.codigoCargo || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- I. Información General -->
        <div class="detail-section">
            <h3><i class="fas fa-user"></i> I. Información General</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Apellidos</span>
                    <span class="info-value">${postulacion.apellidos || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nombres</span>
                    <span class="info-value">${postulacion.nombres || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección/Barrio</span>
                    <span class="info-value">${postulacion.direccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ciudad</span>
                    <span class="info-value">${postulacion.ciudad || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="contact">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.telefono || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="contact">
                    <span class="info-label">Celular</span>
                    <span class="info-value">${postulacion.celular || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="contact">
                    <span class="info-label">Email</span>
                    <span class="info-value">${postulacion.email || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nacionalidad</span>
                    <span class="info-value">${postulacion.nacionalidad || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profesión/Ocupación/Oficio</span>
                    <span class="info-value">${postulacion.profesion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado Civil</span>
                    <span class="info-value">${postulacion.estadoCivil || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Años de Experiencia Laboral</span>
                    <span class="info-value">${postulacion.experiencia || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Documentación -->
        <div class="detail-section">
            <h3><i class="fas fa-file-alt"></i> Documentación</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Cédula de Ciudadanía N°</span>
                    <span class="info-value">${postulacion.cedula || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cédula Extranjera N°</span>
                    <span class="info-value">${postulacion.cedulaExtranjera || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expedida en</span>
                    <span class="info-value">${postulacion.lugarExpedicion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Libreta Militar N°</span>
                    <span class="info-value">${postulacion.libretaMilitar || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Distrito N°</span>
                    <span class="info-value">${postulacion.distritoMilitar || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Clase</span>
                    <span class="info-value">${postulacion.clase || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tarjeta Profesional N°</span>
                    <span class="info-value">${postulacion.tarjetaProfesional || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Tiene Vehículo?</span>
                    <span class="info-value" data-value="${postulacion.tieneVehiculo === 'si' ? 'Sí' : postulacion.tieneVehiculo === 'no' ? 'No' : 'N/A'}">${postulacion.tieneVehiculo === 'si' ? 'Sí' : postulacion.tieneVehiculo === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Licencia de Conducción N°</span>
                    <span class="info-value">${postulacion.licenciaConduccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Categoría Licencia</span>
                    <span class="info-value">${postulacion.categoriaLicencia || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- II. Información Personal -->
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> II. Información Personal</h3>
            <div class="detail-grid">
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Está trabajando actualmente?</span>
                    <span class="info-value" data-value="${postulacion.trabajandoActualmente === 'si' ? 'Sí' : postulacion.trabajandoActualmente === 'no' ? 'No' : 'N/A'}">${postulacion.trabajandoActualmente === 'si' ? 'Sí' : postulacion.trabajandoActualmente === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿En qué empresa?</span>
                    <span class="info-value">${postulacion.empresaActual || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo de trabajo</span>
                    <span class="info-value">${postulacion.tipoTrabajo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo de contrato</span>
                    <span class="info-value">${postulacion.tipoContrato || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Trabajó antes en esta empresa?</span>
                    <span class="info-value" data-value="${postulacion.trabajoAntes === 'si' ? 'Sí' : postulacion.trabajoAntes === 'no' ? 'No' : 'N/A'}">${postulacion.trabajoAntes === 'si' ? 'Sí' : postulacion.trabajoAntes === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Solicitó empleo antes en esta empresa?</span>
                    <span class="info-value" data-value="${postulacion.solicitudAntes === 'si' ? 'Sí' : postulacion.solicitudAntes === 'no' ? 'No' : 'N/A'}">${postulacion.solicitudAntes === 'si' ? 'Sí' : postulacion.solicitudAntes === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="date">
                    <span class="info-label">Fecha solicitud anterior</span>
                    <span class="info-value">${postulacion.fechaSolicitudAnterior ? new Date(postulacion.fechaSolicitudAnterior).toLocaleDateString('es-CO') : 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Información sobre vivienda -->
        <div class="detail-section">
            <h3><i class="fas fa-home"></i> Información sobre vivienda</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Tipo de vivienda</span>
                    <span class="info-value">${postulacion.tipoVivienda || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nombre del arrendador</span>
                    <span class="info-value">${postulacion.nombreArrendador || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono arrendador</span>
                    <span class="info-value">${postulacion.telefonoArrendador || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Información económica -->
        <div class="detail-section">
            <h3><i class="fas fa-dollar-sign"></i> Información económica</h3>
            <div class="detail-grid">
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Comparte gastos con alguien?</span>
                    <span class="info-value" data-value="${postulacion.comparteGastos === 'si' ? 'Sí' : postulacion.comparteGastos === 'no' ? 'No' : 'N/A'}">${postulacion.comparteGastos === 'si' ? 'Sí' : postulacion.comparteGastos === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Tiene ingreso adicional?</span>
                    <span class="info-value" data-value="${postulacion.ingresoAdicional === 'si' ? 'Sí' : postulacion.ingresoAdicional === 'no' ? 'No' : 'N/A'}">${postulacion.ingresoAdicional === 'si' ? 'Sí' : postulacion.ingresoAdicional === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Descripción ingreso adicional</span>
                    <span class="info-value">${postulacion.descripcionIngreso || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="currency">
                    <span class="info-label">Obligaciones económicas mensuales</span>
                    <span class="info-value">$${postulacion.obligacionesEconomicas ? postulacion.obligacionesEconomicas.toLocaleString('es-CO') : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="currency">
                    <span class="info-label">Aspiración salarial</span>
                    <span class="info-value">$${postulacion.aspiracionSalarial ? postulacion.aspiracionSalarial.toLocaleString('es-CO') : 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Información complementaria -->
        <div class="detail-section">
            <h3><i class="fas fa-brain"></i> Información complementaria</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Principales aficiones</span>
                    <span class="info-value">${postulacion.aficiones || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Practica algún deporte?</span>
                    <span class="info-value" data-value="${postulacion.practicaDeporte === 'si' ? 'Sí' : postulacion.practicaDeporte === 'no' ? 'No' : 'N/A'}">${postulacion.practicaDeporte === 'si' ? 'Sí' : postulacion.practicaDeporte === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿Cuáles deportes?</span>
                    <span class="info-value">${postulacion.deportes || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- Objetivo -->
        <div class="detail-section">
            <h3><i class="fas fa-bullseye"></i> Objetivo</h3>
            <div class="info-item">
                <span class="info-label">Expectativas laborales, educativas y personales</span>
                <span class="info-value">${postulacion.objetivo || 'N/A'}</span>
            </div>
        </div>

        <!-- III. Información Familiar -->
        <div class="detail-section">
            <h3><i class="fas fa-users"></i> III. Información Familiar</h3>
            <h4>Información del(la) esposo(a) o compañero(a)</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre del(la) esposo(a)</span>
                    <span class="info-value">${postulacion.nombreEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profesión/Ocupación/Oficio</span>
                    <span class="info-value">${postulacion.profesionEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Empresa donde trabaja</span>
                    <span class="info-value">${postulacion.empresaEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cargo actual</span>
                    <span class="info-value">${postulacion.cargoEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">${postulacion.direccionEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.telefonoEsposo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ciudad</span>
                    <span class="info-value">${postulacion.ciudadEsposo || 'N/A'}</span>
                </div>
            </div>
            
            <h4>Dependientes económicos</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Número de dependientes</span>
                    <span class="info-value">${postulacion.numeroDependientes || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Parentesco</span>
                    <span class="info-value">${postulacion.parentesco || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Edades</span>
                    <span class="info-value">${postulacion.edadesDependientes || 'N/A'}</span>
                </div>
            </div>
            
            <h4>Información de Padres</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre del padre</span>
                    <span class="info-value">${postulacion.nombrePadre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profesión del padre</span>
                    <span class="info-value">${postulacion.profesionPadre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono del padre</span>
                    <span class="info-value">${postulacion.telefonoPadre || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Padre vive?</span>
                    <span class="info-value" data-value="${postulacion.padreVive === 'si' ? 'Sí' : postulacion.padreVive === 'no' ? 'No' : 'N/A'}">${postulacion.padreVive === 'si' ? 'Sí' : postulacion.padreVive === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nombre de la madre</span>
                    <span class="info-value">${postulacion.nombreMadre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profesión de la madre</span>
                    <span class="info-value">${postulacion.profesionMadre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono de la madre</span>
                    <span class="info-value">${postulacion.telefonoMadre || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="yes-no">
                    <span class="info-label">¿Madre vive?</span>
                    <span class="info-value" data-value="${postulacion.madreVive === 'si' ? 'Sí' : postulacion.madreVive === 'no' ? 'No' : 'N/A'}">${postulacion.madreVive === 'si' ? 'Sí' : postulacion.madreVive === 'no' ? 'No' : 'N/A'}</span>
                </div>
            </div>
        </div>

        ${crearSeccionEducacion(postulacion)}
        ${crearSeccionTrayectoria(postulacion)}
        ${crearSeccionExperienciaLaboral(postulacion)}
        ${crearSeccionVerificacion(postulacion)}
        ${crearSeccionSeguridadSocial(postulacion)}
        ${crearSeccionReferencias(postulacion)}
        ${crearSeccionDocumentos(postulacion)}
        ${crearSeccionEstado(postulacion)}
    `;
}

// Función para cambiar estado de postulación o eliminarla si es rechazada
async function cambiarEstado(docId, nuevoEstado) {
    if (nuevoEstado === 'rechazado') {
        if (!confirm('¿Estás seguro de que quieres rechazar esta postulación? Se eliminará permanentemente de la base de datos.')) {
            return;
        }
    } else {
        if (!confirm(`¿Estás seguro de aceptar esta postulación?`)) {
            return;
        }
    }
    
    try {
        console.log('Procesando docId:', docId, 'acción:', nuevoEstado);
        
        if (nuevoEstado === 'rechazado') {
            // Eliminar el documento completamente
            const docRef = doc(db, 'postulaciones', docId);
            await deleteDoc(docRef);
            console.log('Postulación eliminada permanentemente');
            alert('Postulación rechazada y eliminada correctamente');
        } else {
            // Actualizar el estado normalmente
            const docRef = doc(db, 'postulaciones', docId);
            await updateDoc(docRef, {
                estado: nuevoEstado,
                fechaActualizacion: new Date().toISOString()
            });
            console.log(`Estado actualizado a: ${nuevoEstado}`);
            alert(`Postulación aceptada correctamente`);
        }
        
    } catch (error) {
        console.error('Error al procesar postulación:', error);
        alert('Error al procesar la postulación: ' + error.message);
    }
}

// Función para cerrar modal
function cerrarModal() {
    modalDetalles.classList.remove('active');
}

// Event delegation para manejar clics en botones
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="ver-detalles"]')) {
        const button = e.target.closest('[data-action="ver-detalles"]');
        const docId = button.getAttribute('data-doc-id');
        verDetalles(docId);
    }
    
    if (e.target.closest('[data-action="cambiar-estado"]')) {
        const button = e.target.closest('[data-action="cambiar-estado"]');
        const docId = button.getAttribute('data-doc-id');
        const estado = button.getAttribute('data-estado');
        cambiarEstado(docId, estado);
    }
});

// Event listeners
filtroEstado.addEventListener('change', aplicarFiltros);
filtroBusqueda.addEventListener('input', aplicarFiltros);

// Nuevos filtros
const filtroCiudad = document.getElementById('filtroCiudad');
const filtroCedula = document.getElementById('filtroCedula');

filtroCiudad.addEventListener('change', aplicarFiltros);
filtroCedula.addEventListener('input', aplicarFiltros);

btnLimpiarFiltros.addEventListener('click', () => {
    filtroEstado.value = '';
    filtroBusqueda.value = '';
    filtroCiudad.value = '';
    filtroCedula.value = '';
    aplicarFiltros();
});

// Cerrar modal al hacer clic fuera
modalDetalles.addEventListener('click', (e) => {
    if (e.target === modalDetalles) {
        cerrarModal();
    }
});

// Cerrar modal con el botón X
window.cerrarModal = cerrarModal;

// Funciones auxiliares para crear secciones del modal de detalles

function crearSeccionEducacion(postulacion) {
    return `
        <!-- IV. Educación y Aptitudes -->
        <div class="detail-section">
            <h3><i class="fas fa-graduation-cap"></i> IV. Educación y Aptitudes</h3>
            
            <h4>Formación Académica</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nivel de estudios</span>
                    <span class="info-value">${postulacion.nivelEstudios || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Año de finalización</span>
                    <span class="info-value">${postulacion.anoFinalizacion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Título obtenido</span>
                    <span class="info-value">${postulacion.tituloObtenido || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Institución académica</span>
                    <span class="info-value">${postulacion.institucionAcademica || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ciudad de la institución</span>
                    <span class="info-value">${postulacion.ciudadInstitucion || 'N/A'}</span>
                </div>
            </div>

            <h4>Otros cursos, diplomados, seminarios</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Institución de cursos</span>
                    <span class="info-value">${postulacion.institucionCursos || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nombre del programa</span>
                    <span class="info-value">${postulacion.nombrePrograma || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿Cursa actualmente?</span>
                    <span class="info-value">${postulacion.cursaActualmente === 'si' ? 'Sí' : postulacion.cursaActualmente === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo de estudio</span>
                    <span class="info-value">${postulacion.tipoEstudio || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Duración</span>
                    <span class="info-value">${postulacion.duracionEstudio || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Año/semestre que cursa</span>
                    <span class="info-value">${postulacion.anoSemestre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Institución actual</span>
                    <span class="info-value">${postulacion.institucionActual || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horario</span>
                    <span class="info-value">${postulacion.horario || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Modalidad</span>
                    <span class="info-value">${postulacion.modalidad || 'N/A'}</span>
                </div>
            </div>

            <h4>Conocimientos en Sistemas</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nivel Word</span>
                    <span class="info-value">${postulacion.nivelWord || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel Excel</span>
                    <span class="info-value">${postulacion.nivelExcel || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel PowerPoint</span>
                    <span class="info-value">${postulacion.nivelPowerPoint || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel Internet</span>
                    <span class="info-value">${postulacion.nivelInternet || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Otros sistemas</span>
                    <span class="info-value">${postulacion.otrosSistemas || 'N/A'}</span>
                </div>
            </div>

            <h4>Idiomas</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Idiomas</span>
                    <span class="info-value">${postulacion.idiomas || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel - Entiende</span>
                    <span class="info-value">${postulacion.nivelEntender || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel - Habla</span>
                    <span class="info-value">${postulacion.nivelHablar || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel - Lee</span>
                    <span class="info-value">${postulacion.nivelLeer || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nivel - Escribe</span>
                    <span class="info-value">${postulacion.nivelEscribir || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function crearSeccionTrayectoria(postulacion) {
    const sectoresArray = postulacion.sectores || [];
    const areasArray = postulacion.areas || [];
    
    return `
        <!-- V. Trayectoria por Empresas -->
        <div class="detail-section">
            <h3><i class="fas fa-briefcase"></i> V. Trayectoria por Empresas</h3>
            
            <h4>Sectores económicos donde ha trabajado</h4>
            ${sectoresArray.length > 0 ? 
                `<div class="sector-list">
                    ${sectoresArray.map(sector => `<span class="sector-item">${sector}</span>`).join('')}
                </div>` : 
                '<div class="text-long">No se han registrado sectores</div>'
            }
            
            <h4>Áreas de empresa donde ha trabajado</h4>
            ${areasArray.length > 0 ? 
                `<div class="sector-list">
                    ${areasArray.map(area => `<span class="sector-item">${area}</span>`).join('')}
                </div>` : 
                '<div class="text-long">No se han registrado áreas</div>'
            }
        </div>
    `;
}

function crearSeccionExperienciaLaboral(postulacion) {
    return `
        <!-- VI. Experiencia Laboral -->
        <div class="detail-section">
            <h3><i class="fas fa-briefcase"></i> VI. Experiencia Laboral</h3>
            
            <h4>Empresa 1 - Actual o más reciente</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre de la empresa</span>
                    <span class="info-value">${postulacion.empresa1_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">${postulacion.empresa1_direccion || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="contact">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.empresa1_telefono || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cargo</span>
                    <span class="info-value">${postulacion.empresa1_cargo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Jefe inmediato</span>
                    <span class="info-value">${postulacion.empresa1_jefe || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="date">
                    <span class="info-label">Fecha de ingreso</span>
                    <span class="info-value">${postulacion.empresa1_fechaIngreso ? new Date(postulacion.empresa1_fechaIngreso).toLocaleDateString('es-CO') : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="date">
                    <span class="info-label">Fecha de retiro</span>
                    <span class="info-value">${postulacion.empresa1_fechaRetiro ? new Date(postulacion.empresa1_fechaRetiro).toLocaleDateString('es-CO') : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tiempo servido</span>
                    <span class="info-value">${postulacion.empresa1_tiempoServido || 'N/A'}</span>
                </div>
                <div class="info-item" data-type="currency">
                    <span class="info-label">Sueldo inicial</span>
                    <span class="info-value">$${postulacion.empresa1_sueldoInicial ? postulacion.empresa1_sueldoInicial.toLocaleString('es-CO') : 'N/A'}</span>
                </div>
                <div class="info-item" data-type="currency">
                    <span class="info-label">Sueldo final</span>
                    <span class="info-value">$${postulacion.empresa1_sueldoFinal ? postulacion.empresa1_sueldoFinal.toLocaleString('es-CO') : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cargos desempeñados</span>
                    <span class="info-value">${postulacion.empresa1_cargosDesempenados || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Funciones realizadas</span>
                    <span class="info-value">${postulacion.empresa1_funciones || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Logros obtenidos</span>
                    <span class="info-value">${postulacion.empresa1_logros || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Motivo del retiro</span>
                    <span class="info-value">${postulacion.empresa1_motivoRetiro || 'N/A'}</span>
                </div>
            </div>

            ${postulacion.empresa2_nombre ? `
                <h4>Empresa 2 - Anterior</h4>
                <div class="detail-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre de la empresa</span>
                        <span class="info-value">${postulacion.empresa2_nombre || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Dirección</span>
                        <span class="info-value">${postulacion.empresa2_direccion || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono</span>
                        <span class="info-value">${postulacion.empresa2_telefono || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cargo</span>
                        <span class="info-value">${postulacion.empresa2_cargo || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Jefe inmediato</span>
                        <span class="info-value">${postulacion.empresa2_jefe || 'N/A'}</span>
                    </div>
                    <div class="info-item" data-type="date">
                        <span class="info-label">Fecha de ingreso</span>
                        <span class="info-value">${postulacion.empresa2_fechaIngreso ? new Date(postulacion.empresa2_fechaIngreso).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </div>
                    <div class="info-item" data-type="date">
                        <span class="info-label">Fecha de retiro</span>
                        <span class="info-value">${postulacion.empresa2_fechaRetiro ? new Date(postulacion.empresa2_fechaRetiro).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tiempo servido</span>
                        <span class="info-value">${postulacion.empresa2_tiempoServido || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Motivo del retiro</span>
                        <span class="info-value">${postulacion.empresa2_motivoRetiro || 'N/A'}</span>
                    </div>
                </div>
            ` : ''}

            ${postulacion.empresa3_nombre ? `
                <h4>Empresa 3 - Anterior</h4>
                <div class="detail-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre de la empresa</span>
                        <span class="info-value">${postulacion.empresa3_nombre || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Dirección</span>
                        <span class="info-value">${postulacion.empresa3_direccion || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono</span>
                        <span class="info-value">${postulacion.empresa3_telefono || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cargo</span>
                        <span class="info-value">${postulacion.empresa3_cargo || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Jefe inmediato</span>
                        <span class="info-value">${postulacion.empresa3_jefe || 'N/A'}</span>
                    </div>
                    <div class="info-item" data-type="date">
                        <span class="info-label">Fecha de ingreso</span>
                        <span class="info-value">${postulacion.empresa3_fechaIngreso ? new Date(postulacion.empresa3_fechaIngreso).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </div>
                    <div class="info-item" data-type="date">
                        <span class="info-label">Fecha de retiro</span>
                        <span class="info-value">${postulacion.empresa3_fechaRetiro ? new Date(postulacion.empresa3_fechaRetiro).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tiempo servido</span>
                        <span class="info-value">${postulacion.empresa3_tiempoServido || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Motivo del retiro</span>
                        <span class="info-value">${postulacion.empresa3_motivoRetiro || 'N/A'}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function crearSeccionVerificacion(postulacion) {
    return `
        <!-- Verificación -->
        <div class="detail-section">
            <h3><i class="fas fa-check-circle"></i> Verificación</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Empresa verificación</span>
                    <span class="info-value">${postulacion.verificacion_empresa || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección verificación</span>
                    <span class="info-value">${postulacion.verificacion_direccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono verificación</span>
                    <span class="info-value">${postulacion.verificacion_telefono || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Observaciones</span>
                    <span class="info-value">${postulacion.verificacion_observaciones || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function crearSeccionSeguridadSocial(postulacion) {
    return `
        <!-- Información de Seguridad Social -->
        <div class="detail-section">
            <h3><i class="fas fa-shield-alt"></i> Información de Seguridad Social</h3>
            
            <h4>EPS (Entidad Promotora de Salud)</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">¿Tiene EPS?</span>
                    <span class="info-value">${postulacion.tieneEps === 'si' ? 'Sí' : postulacion.tieneEps === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿Cuál EPS?</span>
                    <span class="info-value">${postulacion.cualEps || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Afiliación como</span>
                    <span class="info-value">${postulacion.afiliacionEps || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha afiliación EPS</span>
                    <span class="info-value">${postulacion.fechaAfiliacionEps || 'N/A'}</span>
                </div>
            </div>

            <h4>Fondo de Pensiones</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">¿Tiene fondo de pensiones?</span>
                    <span class="info-value">${postulacion.tienePension === 'si' ? 'Sí' : postulacion.tienePension === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿Cuál fondo?</span>
                    <span class="info-value">${postulacion.cualPension || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha afiliación pensión</span>
                    <span class="info-value">${postulacion.fechaAfiliacionPension || 'N/A'}</span>
                </div>
            </div>

            <h4>Fondo de Cesantías</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">¿Tiene fondo de cesantías?</span>
                    <span class="info-value">${postulacion.tieneCesantias === 'si' ? 'Sí' : postulacion.tieneCesantias === 'no' ? 'No' : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">¿Cuál fondo?</span>
                    <span class="info-value">${postulacion.cualCesantias || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha afiliación cesantías</span>
                    <span class="info-value">${postulacion.fechaAfiliacionCesantias || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function crearSeccionReferencias(postulacion) {
    return `
        <!-- VII. Referencias Personales -->
        <div class="detail-section">
            <h3><i class="fas fa-user-friends"></i> VII. Referencias Personales</h3>
            
            <h4>1. Referencia Personal</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${postulacion.refPersonal_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ocupación</span>
                    <span class="info-value">${postulacion.refPersonal_ocupacion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">${postulacion.refPersonal_direccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.refPersonal_telefono || 'N/A'}</span>
                </div>
            </div>

            <h4>2. Referencia Laboral</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${postulacion.refLaboral_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ocupación</span>
                    <span class="info-value">${postulacion.refLaboral_ocupacion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">${postulacion.refLaboral_direccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.refLaboral_telefono || 'N/A'}</span>
                </div>
            </div>

            <h4>3. Referencia Familiar</h4>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${postulacion.refFamiliar_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ocupación</span>
                    <span class="info-value">${postulacion.refFamiliar_ocupacion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">${postulacion.refFamiliar_direccion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">${postulacion.refFamiliar_telefono || 'N/A'}</span>
                </div>
            </div>

            <h4>Firma del Solicitante</h4>
            <div class="info-item">
                <span class="info-label">Firma</span>
                <span class="info-value">${postulacion.firmaSolicitante || 'N/A'}</span>
            </div>
        </div>
    `;
}

function crearSeccionDocumentos(postulacion) {
    return `
        <!-- Documentos de Identidad -->
        ${(postulacion.cedulaFrenteUrl || postulacion.cedulaTraseraUrl) ? `
            <div class="detail-section">
                <h3><i class="fas fa-id-card"></i> Documentos de Identidad</h3>
                <div class="cedula-images">
                    ${postulacion.cedulaFrenteUrl ? `
                        <div class="cedula-image">
                            <h4>Cédula - Frontal</h4>
                            <img src="${postulacion.cedulaFrenteUrl}" alt="Cédula Frontal" />
                        </div>
                    ` : ''}
                    ${postulacion.cedulaTraseraUrl ? `
                        <div class="cedula-image">
                            <h4>Cédula - Trasera</h4>
                            <img src="${postulacion.cedulaTraseraUrl}" alt="Cédula Trasera" />
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}
    `;
}

function crearSeccionEstado(postulacion) {
    return `
        <!-- Estado actual -->
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Estado de la Postulación</h3>
            <div class="detail-grid">
                <div class="info-item">
                    <span class="info-label">Estado actual</span>
                    <span class="status-badge status-${postulacion.estado}">${postulacion.estado}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de postulación</span>
                    <span class="info-value">${postulacion.fechaCreacion ? new Date(postulacion.fechaCreacion).toLocaleString('es-ES') : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Última actualización</span>
                    <span class="info-value">${postulacion.fechaActualizacion ? new Date(postulacion.fechaActualizacion).toLocaleString('es-ES') : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

// Función para verificar autenticación
async function verificarUsuario(usuario, password) {
    try {
        console.log('Verificando usuario:', usuario);
        
        // Obtener todos los usuarios de Firebase
        const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
        
        let usuarioEncontrado = false;
        usuariosSnapshot.forEach((doc) => {
            const userData = doc.data();
            console.log('Usuario en BD:', userData);
            
            if (userData.user === usuario && userData.password === password) {
                usuarioEncontrado = true;
            }
        });
        
        return usuarioEncontrado;
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        return false;
    }
}

// Función para manejar el login
async function manejarLogin(e) {
    e.preventDefault();
    
    const usuario = loginUser.value.trim();
    const password = loginPassword.value.trim();
    
    if (!usuario || !password) {
        mostrarErrorLogin('Por favor, complete todos los campos');
        return;
    }
    
    // Mostrar loading
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    submitBtn.disabled = true;
    
    try {
        const esValido = await verificarUsuario(usuario, password);
        
        if (esValido) {
            // Login exitoso
            usuarioAutenticado = true;
            localStorage.setItem('ecosmart_authenticated', 'true');
            localStorage.setItem('ecosmart_user', usuario);
            
            // Ocultar modal de login y mostrar contenido
            modalLogin.classList.remove('active');
            mainContent.classList.remove('content-hidden');
            
            // Cargar postulaciones
            cargarPostulaciones();
            
        } else {
            mostrarErrorLogin('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error en el login:', error);
        mostrarErrorLogin('Error de conexión. Intente nuevamente.');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Función para mostrar errores de login
function mostrarErrorLogin(mensaje) {
    loginError.textContent = mensaje;
    loginError.style.display = 'block';
    
    // Ocultar error después de 5 segundos
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 5000);
}

// Función para cerrar sesión
function cerrarSesion() {
    usuarioAutenticado = false;
    localStorage.removeItem('ecosmart_authenticated');
    localStorage.removeItem('ecosmart_user');
    
    // Mostrar modal de login y ocultar contenido
    modalLogin.classList.add('active');
    mainContent.classList.add('content-hidden');
    
    // Limpiar formulario
    formLogin.reset();
    loginError.style.display = 'none';
}

// Función para verificar autenticación al cargar la página
function verificarAutenticacion() {
    const estaAutenticado = localStorage.getItem('ecosmart_authenticated');
    const usuario = localStorage.getItem('ecosmart_user');
    
    if (estaAutenticado === 'true' && usuario) {
        usuarioAutenticado = true;
        modalLogin.classList.remove('active');
        mainContent.classList.remove('content-hidden');
        return true;
    } else {
        modalLogin.classList.add('active');
        mainContent.classList.add('content-hidden');
        return false;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando aplicación...');
    
    // Verificar si el usuario ya está autenticado
    if (verificarAutenticacion()) {
        // Establecer filtro por defecto a pendiente
        filtroEstado.value = 'pendiente';
        filtroEstadoActivo = 'pendiente';
        
        // Cargar postulaciones solo si está autenticado
        cargarPostulaciones();
    }
    
    // Event listeners para el login
    formLogin.addEventListener('submit', manejarLogin);
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    
    // Event listeners para tarjetas de estadísticas clickeables
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
        card.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filter');
            
            // Actualizar el filtro activo
            filtroEstadoActivo = filtro;
            
            // Actualizar el select de filtro estado
            filtroEstado.value = filtro;
            
            // Actualizar las clases activas
            document.querySelectorAll('.stat-card.clickable').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Aplicar filtros
            aplicarFiltros();
        });
    });
    
    // Event listeners para filtros
    filtroEstado.addEventListener('change', function() {
        // Actualizar el filtro activo cuando se cambie manualmente
        filtroEstadoActivo = this.value;
        
        // Actualizar las clases activas de las tarjetas
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
            if (card.getAttribute('data-filter') === this.value) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        aplicarFiltros();
    });
    document.getElementById('filtroCiudad').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroCedula').addEventListener('input', aplicarFiltros);
    filtroBusqueda.addEventListener('input', aplicarFiltros);
    
    // Event listener para limpiar filtros
    btnLimpiarFiltros.addEventListener('click', function() {
        // Limpiar todos los filtros excepto el estado (volver a pendiente)
        filtroEstado.value = 'pendiente';
        filtroEstadoActivo = 'pendiente';
        document.getElementById('filtroCiudad').value = '';
        document.getElementById('filtroCedula').value = '';
        filtroBusqueda.value = '';
        
        // Actualizar tarjetas activas
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
            if (card.getAttribute('data-filter') === 'pendiente') {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        aplicarFiltros();
    });
    
    // Event listener para cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
    
    // Event listener para cerrar modal clickeando fuera
    modalDetalles.addEventListener('click', function(e) {
        if (e.target === modalDetalles) {
            cerrarModal();
        }
    });
    
    // Prevenir que se cierre el modal de login accidentalmente
    modalLogin.addEventListener('click', function(e) {
        if (e.target === modalLogin) {
            // No hacer nada - el modal de login no se puede cerrar sin autenticarse
        }
    });
}); 