# Sistema de Gestión de Postulaciones - EcoSmart Construcciones

Este sistema permite la gestión completa de postulaciones de empleo para EcoSmart Construcciones, incluyendo el envío de formularios y la administración de candidatos.

## 📋 Funcionalidades

### Formulario de Postulación (`index.html`)
- ✅ Formulario completo de postulación con 7 secciones principales
- ✅ Subida de imágenes de cédula (frontal y trasera)
- ✅ Validación de campos obligatorios
- ✅ Estado automático "pendiente" al enviar
- ✅ Almacenamiento en Firebase Firestore
- ✅ Numeración automática de postulaciones
- ✅ Interfaz moderna con bordes verdes

### Sistema de Gestión (`gestionar.html`)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Filtrado por estado (pendiente, aceptado, rechazado)
- ✅ Búsqueda por nombre, apellidos, cédula o cargo
- ✅ Vista detallada de cada postulación
- ✅ Cambio de estado (aceptar/rechazar)
- ✅ Visualización de documentos de identidad
- ✅ Actualizaciones en tiempo real

## 🚀 Cómo usar el sistema

### Para candidatos:
1. Acceder a `index.html`
2. Completar todas las secciones del formulario
3. Subir las imágenes de la cédula (frontal y trasera)
4. Hacer clic en "Enviar Postulación"
5. El sistema asignará automáticamente el estado "pendiente"

### Para administradores:
1. Acceder a `gestionar.html`
2. Ver el dashboard con estadísticas generales
3. Usar los filtros para encontrar postulaciones específicas
4. Hacer clic en "Ver Detalles" para revisar información completa
5. Usar "Aceptar" o "Rechazar" para cambiar el estado

## 📁 Estructura de archivos

```
├── index.html          # Formulario principal de postulación
├── gestionar.html      # Panel de administración
├── app.js             # Lógica del formulario principal
├── gestionar.js       # Lógica del sistema de gestión
├── styles.css         # Estilos CSS completos
├── Key.json           # Configuración de Firebase
├── firestore.rules    # Reglas de seguridad de Firestore
└── img/               # Recursos de imagen
    └── Logo_Color_Fondo_Negro_500x500.png
```

## ⚙️ Configuración técnica

### Firebase Firestore
- **Colección**: `postulaciones`
- **Estructura de documento**:
```javascript
{
  id: "número_secuencial",
  estado: "pendiente|aceptado|rechazado",
  fechaPostulacion: timestamp,
  fechaCreacion: string,
  fechaActualizacion: string,
  // ... todos los campos del formulario
  cedulaFrenteUrl: "url_imagen",
  cedulaTraseraUrl: "url_imagen"
}
```

### Estados de postulación
- **Pendiente**: Estado inicial al enviar el formulario
- **Aceptado**: Candidato aprobado por el administrador
- **Rechazado**: Candidato no seleccionado

## 🔧 Características técnicas

### Responsivo
- ✅ Adaptable a dispositivos móviles
- ✅ Grids flexibles para diferentes tamaños de pantalla
- ✅ Navegación optimizada para touch

### Tiempo real
- ✅ Actualizaciones automáticas sin refresh
- ✅ Estadísticas en vivo
- ✅ Sincronización entre múltiples usuarios

### Seguridad
- ✅ Validación de archivos (tamaño máximo 2MB)
- ✅ Reglas de seguridad en Firebase
- ✅ Sanitización de datos

### UX/UI
- ✅ Interfaz moderna con tema verde corporativo
- ✅ Iconos Font Awesome
- ✅ Animaciones y transiciones suaves
- ✅ Feedback visual para todas las acciones

## 📊 Filtros y búsqueda disponibles

### En el panel de gestión:
- **Por estado**: Todos, Pendiente, Aceptado, Rechazado
- **Por texto**: Búsqueda en nombre, apellidos, cédula y cargo
- **Orden**: Por fecha de postulación (más recientes primero)

## 🎨 Personalización

El sistema utiliza variables CSS para fácil personalización:
```css
:root {
    --color-primary: #4CAF50;    /* Verde principal */
    --color-secondary: #FFA726;  /* Naranja secundario */
    --color-text: #333333;       /* Texto principal */
    --color-background: #c2c2c2; /* Fondo general */
}
```

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge (últimas versiones)
- ✅ Dispositivos móviles y tablets
- ✅ Resoluciones desde 320px hasta 2560px

## 🔄 Flujo de trabajo

1. **Candidato** completa y envía formulario → Estado: "Pendiente"
2. **Administrador** revisa la postulación en el panel de gestión
3. **Administrador** acepta o rechaza → Estado: "Aceptado" o "Rechazado"
4. **Sistema** actualiza automáticamente las estadísticas y vista

## 🛠️ Mantenimiento

- Las imágenes se almacenan en ImgBB (servicio externo)
- Los datos se guardan en Firebase Firestore
- Backup automático de Firebase
- Logs de actividad en la consola del navegador

---

**Desarrollado para EcoSmart Construcciones** 🏗️ 