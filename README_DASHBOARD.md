# 📊 Sistema de Gestión de Postulaciones - EcoSmart Construcciones

## 🚀 Descripción

Sistema completo de gestión de postulaciones laborales que incluye:
- **Formulario de postulación** para candidatos
- **Panel de administración** para gestionar postulaciones
- **Sistema de login** con autenticación
- **Base de datos** en Firebase Firestore

## 📁 Archivos del Sistema

### Archivos Principales
- `index.html` - Formulario de postulación para candidatos
- `Gestor_Postulaciones.html` - Panel de administración
- `gestor.js` - Lógica del dashboard
- `app.js` - Lógica del formulario
- `styles.css` - Estilos CSS

### Archivos de Inicialización
- `inicializar_admin.html` - Página para crear usuario administrador
- `crear_admin.js` - Script de inicialización

## 🔧 Instalación y Configuración

### 1. Configuración Inicial

1. **Subir archivos** a tu servidor web
2. **Crear usuario administrador** (solo la primera vez):
   - Abrir `inicializar_admin.html` en el navegador
   - Esperar a que se cree el usuario administrador
   - Anotar las credenciales mostradas

3. **Credenciales predeterminadas**:
   - Usuario: `admin`
   - Contraseña: `admin123`

### 2. Acceso al Sistema

#### Para Candidatos:
- Abrir `index.html`
- Completar el formulario de postulación
- Enviar la postulación

#### Para Administradores:
- Abrir `Gestor_Postulaciones.html`
- Iniciar sesión con las credenciales
- Gestionar postulaciones

## 📋 Funcionalidades del Dashboard

### 🔐 Sistema de Login
- Autenticación con usuario y contraseña
- Sesión persistente
- Logout seguro

### 📊 Panel de Estadísticas
- Total de postulaciones
- Postulaciones pendientes
- Postulaciones aprobadas
- Postulaciones rechazadas

### 🔍 Filtros y Búsqueda
- Filtro por estado (Pendiente, En Revisión, Aprobada, Rechazada)
- Filtro por fecha (desde/hasta)
- Búsqueda por nombre, cédula, cargo o email
- Búsqueda en tiempo real

### 📋 Gestión de Postulaciones
- **Ver detalles**: Información completa del candidato
- **Editar estado**: Cambiar estado y agregar comentarios
- **Eliminar**: Eliminar postulación (con confirmación)
- **Paginación**: Navegación por páginas

### 📄 Visualización de Detalles
- Información personal completa
- Experiencia laboral
- Documentos de identidad (cédula)
- Historial de cambios

### 📊 Exportación
- **Exportar a Excel/CSV**: Todos los datos filtrados
- Formato compatible con Excel
- Nombre de archivo con fecha

## 🛠️ Gestión de Usuarios

### Crear Usuarios Adicionales

Para crear más usuarios administradores, puedes:

1. **Usar la consola de Firebase**:
   - Ir a Firebase Console
   - Navegar a Firestore Database
   - Crear documento en colección `usuarios`

2. **Estructura del usuario**:
```json
{
  "usuario": "nombre_usuario",
  "password": "contraseña",
  "nombre": "Nombre Completo",
  "rol": "administrador",
  "activo": true,
  "fechaCreacion": "timestamp"
}
```

### Cambiar Contraseña

Para cambiar la contraseña del administrador:

1. Ir a Firebase Console
2. Navegar a Firestore Database
3. Encontrar el documento del usuario
4. Editar el campo `password`

## 🎨 Estados de Postulaciones

- **Pendiente**: Postulación recién recibida
- **En Revisión**: Postulación en proceso de evaluación
- **Aprobada**: Candidato aprobado
- **Rechazada**: Candidato no seleccionado

## 🔒 Seguridad

### Recomendaciones de Seguridad:

1. **Cambiar credenciales predeterminadas** inmediatamente
2. **Eliminar archivos de inicialización** después del primer uso:
   - `inicializar_admin.html`
   - `crear_admin.js`
3. **Usar contraseñas seguras**
4. **Limitar acceso** al panel de administración

## 📱 Responsive Design

El sistema es completamente responsive y funciona en:
- 💻 Computadoras de escritorio
- 📱 Tablets
- 📱 Teléfonos móviles

## 🗄️ Estructura de la Base de Datos

### Colección `postulaciones`
- Información completa del candidato
- Documentos de identidad
- Estados y comentarios
- Fechas de creación y actualización

### Colección `usuarios`
- Usuarios administradores
- Credenciales de acceso
- Roles y permisos

## 🔄 Flujo de Trabajo

1. **Candidato** completa formulario → Postulación guardada
2. **Administrador** revisa postulaciones → Cambia estado
3. **Administrador** puede ver detalles → Toma decisión
4. **Administrador** exporta datos → Análisis externo

## 🆘 Solución de Problemas

### Error de Conexión
- Verificar conexión a Internet
- Verificar configuración de Firebase

### Usuario No Encontrado
- Verificar que el usuario existe en Firebase
- Verificar credenciales

### No Cargan Postulaciones
- Verificar permisos de Firebase
- Revisar consola del navegador

## 📞 Soporte

Para soporte técnico:
1. Revisar consola del navegador (F12)
2. Verificar configuración de Firebase
3. Revisar logs en Firebase Console

## 🔧 Mantenimiento

### Limpieza Periódica
- Eliminar postulaciones muy antiguas
- Revisar usuarios inactivos
- Verificar integridad de datos

### Copias de Seguridad
- Firebase hace copias automáticas
- Exportar datos periódicamente
- Mantener configuración actualizada

---

## 📋 Lista de Verificación Post-Instalación

- [ ] Archivos subidos al servidor
- [ ] Usuario administrador creado
- [ ] Credenciales predeterminadas cambiadas
- [ ] Archivos de inicialización eliminados
- [ ] Formulario de postulación funcionando
- [ ] Panel de administración accesible
- [ ] Prueba de todas las funcionalidades
- [ ] Exportación de datos probada

---

*Sistema desarrollado para EcoSmart Construcciones - Panel de Gestión de Postulaciones* 