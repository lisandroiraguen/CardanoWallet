# Cardano Wallet

<img width="620" height="822" alt="image" src="https://github.com/user-attachments/assets/3f727f98-1e48-45e0-bf7a-f23cf567b24c" />


https://thankful-field-06bc7fa0f.3.azurestaticapps.net/

Una aplicación React de wallet de Cardano estilo fintech que se conecta con Eternl wallet para mostrar tu balance de ADA en testnet.

## 🚀 Características

- ⚡ Vite para desarrollo rápido
- ⚛️ React 18
- 🎨 Tailwind CSS para estilos modernos
- 🔗 Integración con Eternl wallet (CIP-30)
- 💰 Visualización de balance de ADA en tiempo real
- 📱 Diseño responsive y moderno
- 🔐 Visualización de balance con opción de ocultar/mostrar
- 🌐 Soporte para Testnet y Mainnet
- 📦 Lista para desplegar en la nube

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- **Eternl Wallet** instalado en Chrome ([Descargar aquí](https://chromewebstore.google.com/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka))
- Wallet configurada en Testnet o Preprod (para desarrollo)

## 🛠️ Instalación

1. Instala las dependencias:
```bash
npm install
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Construir para Producción

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## 👀 Previsualizar Build de Producción

```bash
npm run preview
```

## ☁️ Desplegar en la Nube

Esta aplicación está lista para desplegarse en plataformas como:

- **Vercel**: Conecta tu repositorio y despliega automáticamente
- **Netlify**: Arrastra la carpeta `dist/` o conecta tu repositorio
- **AWS Amplify**: Conecta tu repositorio y configura el build
- **Azure Static Web Apps**: Conecta tu repositorio
- **Cloudflare Pages**: Conecta tu repositorio

### Configuración de Build para la Nube

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 16 o superior

## 📝 Estructura del Proyecto

```
.
├── src/
│   ├── App.jsx          # Componente principal (Wallet UI)
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales (Tailwind)
├── index.html           # HTML principal
├── vite.config.js       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind CSS
├── postcss.config.js    # Configuración de PostCSS
└── package.json         # Dependencias del proyecto
```

## 🎯 Funcionalidades

- **Conexión con Eternl**: Conecta tu wallet Eternl usando el estándar CIP-30
- **Balance de ADA**: Muestra tu balance de ADA en tiempo real (se actualiza cada 10 segundos)
- **Información de Red**: Detecta automáticamente si estás en Testnet o Mainnet
- **Dirección de Wallet**: Muestra y permite copiar tu dirección de Cardano
- **Ocultar/Mostrar Balance**: Protege tu privacidad ocultando el balance
- **Acciones Rápidas**: Botones para Enviar, Recibir, Intercambiar y Actualizar
- **Tema Oscuro**: Diseño moderno estilo fintech con gradientes
- **Interfaz Responsive**: Optimizada para móviles y desktop

## 🔌 Cómo Usar con Eternl

1. **Instala Eternl Wallet**:
   - Descarga la extensión desde [Chrome Web Store](https://chromewebstore.google.com/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka)
   - Crea o importa tu wallet

2. **Configura Testnet**:
   - Abre Eternl wallet
   - Cambia a "Pre-production Testnet" o "Preprod" en la configuración
   - Asegúrate de tener ADA de prueba en tu wallet

3. **Conecta tu Wallet**:
   - Abre la aplicación en el navegador
   - Haz clic en "Conectar" en la parte superior
   - Acepta la conexión en la ventana de Eternl
   - ¡Listo! Verás tu balance de ADA

## 📄 Licencia

MIT
