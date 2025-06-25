# Sistema de Gestión de Depreciación de Activos - Pollería

Este proyecto es una aplicación web diseñada para facilitar la administración, el cálculo y el seguimiento de la depreciación de los activos fijos de una pollería. La herramienta permite a los administradores y contadores llevar un control preciso del valor de los bienes de la empresa a lo largo del tiempo.

La aplicación está construida con tecnologías modernas, ofreciendo una interfaz de usuario intuitiva y reactiva para una gestión eficiente.

---

## 🚀 Características Principales

- **Dashboard Principal:** Una vista general y centralizada del estado de los activos y la depreciación.
- **Gestión de Activos:** Permite registrar, editar y dar de baja (lógicamente) todos los activos fijos de la pollería, como hornos, freidoras, vehículos, mobiliario, etc.
- **Gestión de Categorías:** Organiza los activos en categorías personalizables (ej. Maquinaria de Cocina, Equipo de Cómputo, Vehículos), asignando propiedades contables como vida útil predeterminada y tasas de depreciación.
- **Gestión de Usuarios:** Administra el acceso al sistema, permitiendo crear usuarios, asignarles roles y controlar su estado (activo/inactivo).
- **Cálculo y Reportes:** Ofrece una herramienta para calcular la depreciación de un activo en una fecha específica y mantiene un historial detallado de todos los cálculos realizados.

---

## 🛠️ Módulos del Sistema

El sistema está organizado en varios módulos accesibles desde la barra de navegación lateral:

### 1. Dashboard
Es la pantalla de bienvenida que ofrece un resumen visual y accesos directos a las funcionalidades más importantes del sistema.

### 2. Gestión de Activos
El núcleo del sistema. En esta sección puedes:
- **Crear nuevos activos:** Ingresando información detallada como descripción, marca, modelo, costo de adquisición, fecha de compra, vida útil en años y valor residual.
- **Listar y filtrar activos:** Visualiza todos los activos en una tabla. Puedes filtrar para ver solo los activos, los inactivos o todos.
- **Editar activos:** Modifica la información de un activo existente.
- **Activar/Desactivar activos:** En lugar de eliminar permanentemente, los activos se marcan como "inactivos" (borrado lógico), manteniendo la integridad del historial.

### 3. Gestión de Categorías
Permite una organización contable adecuada de los activos. Aquí puedes:
- **Crear nuevas categorías:** Define grupos como "Mobiliario y Enseres" o "Equipos de Cocina".
- **Asignar propiedades:** Establece la vida útil predeterminada, la tasa de depreciación anual y un código contable para cada categoría.
- **Editar y eliminar categorías.**

### 4. Gestión de Usuarios
Controla quién tiene acceso al sistema. Las funciones incluyen:
- **Crear nuevos usuarios:** Registra empleados con su nombre, DNI, correo, y asígnales una sede y un rol.
- **Listar y filtrar usuarios:** Visualiza a todos los usuarios y fíltralos por estado (activo/inactivo) o por ID de sede.
- **Editar usuarios:** Actualiza la información de un usuario.
- **Activar/Desactivar usuarios:** Gestiona el acceso al sistema de cada empleado.

### 5. Reportes de Depreciación
Este módulo es clave para el seguimiento contable:
- **Calcular Depreciación:** Selecciona un activo y una fecha para que el sistema calcule y registre automáticamente una nueva entrada de depreciación.
- **Ver Historial:** Consulta una tabla con todos los registros de depreciación, incluyendo el valor depreciado y el valor en libros en esa fecha.
- **Editar y Eliminar Registros:** Permite modificar las observaciones de un cálculo o eliminar un registro de depreciación si fue un error.

### 6. Ayuda
Una sección con guías y descripciones sobre el uso de cada módulo del sistema.

---

## ⚙️ Flujo de Trabajo Recomendado

Para empezar a utilizar el sistema de forma efectiva, se recomienda seguir estos pasos:

1.  **Configurar Categorías:** Dirígete al módulo de **Categorías** y crea los grupos que se ajusten a los activos de tu negocio.
2.  **Registrar Activos:** Ve al módulo de **Activos** y comienza a registrar cada uno de tus activos fijos, asignándolos a la categoría correspondiente.
3.  **Calcular Depreciación:** Utiliza la herramienta en la sección de **Reportes** para generar los registros de depreciación periódicos para tus activos.

---

## 💻 Tecnologías Utilizadas

- **Frontend:**
  - **Next.js:** Framework de React para aplicaciones web modernas.
  - **React:** Biblioteca para construir interfaces de usuario.
  - **TypeScript:** Para un código más robusto y mantenible.
  - **Tailwind CSS:** Framework de CSS para un diseño rápido y personalizable.
  - **ShadCN UI:** Colección de componentes de UI reutilizables.
- **Backend (API):**
  - **Java:** Lenguaje de programación.
  - **Spring Boot:** Framework para crear servicios RESTful.
