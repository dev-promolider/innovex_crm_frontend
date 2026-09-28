# Innovex CRM - Frontend Web Portal

Este repositorio contiene la interfaz de usuario (Frontend) para la plataforma **Innovex CRM**, un sistema SaaS multi-tenant diseñado para la gestión de redes de distribución, ventas directas y administración de comisiones multinivel en cascada.

## Stack Tecnológico

El proyecto está construido sobre las siguientes tecnologías y librerías modernas:
* **Core**: [Vue 3](https://vuejs.org/) (usando `<script setup>` SFCs y TypeScript).
* **Entorno de Desarrollo y Empaquetado**: [Vite 7](https://vite.dev/).
* **Estilado**: [TailwindCSS v4](https://tailwindcss.com/) & [PrimeVue v4](https://primevue.org/) (con sistema de temas unificados `@primeuix/themes`).
* **Enrutamiento**: [Vue Router v4](https://router.vuejs.org/) (incluye guards de autenticación y validación de contexto de Workspace/Empresa).
* **Internacionalización**: [Vue I18n v11](https://vue-i18n.intlify.dev/).
* **Consumo de APIs**: [Axios](https://axios-http.com/).
* **Iconografía**: [Lucide Vue Next](https://lucide.dev/).

---

## Estructura del Directorio `src/`

El proyecto sigue una estructura limpia orientada a componentes y características (`features`):

```bash
src/
├── app/                 # Configuración principal de la aplicación y proveedores
├── assets/              # Archivos estáticos como imágenes, logos y svg
├── components/          # Componentes generales reutilizables (botones, modales, etc.)
├── composables/         # Hooks/Composables reactivos globales (e.g., gestión de sesión)
├── features/            # Módulos de lógica de negocio (Dashboard, Red de Distribución, Inventario, Contratos)
│   ├── aprobaciones/
│   ├── distribuidores/
│   ├── inventario/
│   └── recompensas/     # Manejo de scoring y recompensas del marketplace
├── i18n/                # Traducciones del sistema
├── plugins/             # Plugins de Vue inicializados en main.ts
├── router/              # Configuración y Guards de Vue Router
├── styles/              # Archivos CSS globales y tokens de diseño
├── utils/               # Funciones de utilidad auxiliares
└── views/               # Vistas/Páginas principales vinculadas a las rutas
```

---

## Primeros Pasos y Requisitos

### Requisitos Previos
* **Node.js** v18 o superior.
* **npm** v9 o superior.

### Configuración del Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente variable obligatoria:
```env
VITE_API_URL=https://tu-api-backend.com/api
```

---

## Comandos Disponibles

En la raíz del proyecto, puedes ejecutar los siguientes scripts de npm:

### 1. Instalar Dependencias
Instala los paquetes necesarios de forma limpia utilizando el archivo de bloqueo:
```bash
npm ci
```
O de manera general:
```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo
Levanta la aplicación en modo desarrollo (usualmente en `http://localhost:5173`):
```bash
npm start
```
*También es válido utilizar:* `npm run dev`

### 3. Compilar para Producción
Compila y optimiza el proyecto (ejecuta validación de tipos mediante `vue-tsc` y compila con Vite):
```bash
npm run build
```

### 4. Vista Previa de Producción
Levanta localmente la compilación de producción generada en la carpeta `/dist`:
```bash
npm run preview
```

---

## Control de Acceso y Roles de Vista

El enrutador (`src/router/index.ts`) cuenta con validaciones de sesión para proteger las rutas. Permite distinguir accesos para:
1. **Superadmin**: Acceso exclusivo a `/empresas` y `/usuarios`.
2. **Administradores locales (Empresa / Financiero)**: Acceso al Dashboard de Workspace, Inventario, Gestión de Líderes/Distribuidores, Deudas, Aprobaciones y Configuración.
3. **Restricción de Workspace**: Protege que los usuarios no ingresen a paneles de administración de empresas si no cuentan con un `X-Empresa-Id` válido guardado en su sesión local.
