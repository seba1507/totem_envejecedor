# Totem de Envejecimiento con IA

Aplicación de cabina de fotos interactiva que permite a los usuarios tomar fotos y visualizar cómo se verán en el futuro usando inteligencia artificial.

## 🚀 Características

- **Captura de Fotos**: Interfaz de cámara web con cuenta regresiva
- **Procesamiento con IA**: Envejecimiento realista usando GPT-Image-1 de OpenAI
- **Descarga Automática**: La imagen procesada se descarga automáticamente
- **Timer de Reset**: Auto-reset después de 30 segundos en pantalla de resultado
- **Sin almacenamiento externo**: Las imágenes se procesan y descargan directamente

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15.3, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Procesamiento**: OpenAI API (gpt-image-1)
- **Navegador**: Microsoft Edge (recomendado)

## 📋 Requisitos Previos

- Node.js 18+
- NPM o Yarn
- Cuenta en OpenAI con acceso a gpt-image-1

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone [tu-repositorio]
cd totem-envejecimiento
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env.local` con:
```env
OPENAI_API_KEY="tu_api_key_de_openai"
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## 📱 Flujo de Usuario

1. **Bienvenida**: "¿Estás listo para verte en el futuro?"
2. **Cámara**: Captura de foto con cuenta regresiva
3. **Revisión**: Aceptar o retomar la foto
4. **Procesamiento**: IA aplica envejecimiento
5. **Resultado**: Muestra imagen procesada y descarga automática
6. **Auto-reset**: 30 segundos o botón "Finalizar"

## 🎨 Configuración del Totem

- **Pantalla**: Vertical 9:16
- **Navegador**: Microsoft Edge (descarga automática)
- **Plataforma**: Windows

### Configuración de Microsoft Edge
Para evitar notificaciones de descarga:
1. Ve a `edge://settings/downloads`
2. Desactiva "Mostrar descargas cuando se completen"
3. Configura una carpeta de descarga específica
4. Modo kiosko recomendado: `msedge --kiosk http://localhost:3000 --edge-kiosk-type=fullscreen`
5. Ver archivo `CONFIGURACION_EDGE.md` para configuración detallada

## 🤖 Parámetros de IA

La aplicación usa los siguientes parámetros para gpt-image-1:
- **Prompt**: "haz que envejezca, pero que mantenga su identidad claramente"
- **Modelo**: gpt-image-1
- **Tamaño**: 1024x1024 (optimizado para rendimiento)
- **Calidad**: standard
- **Fidelidad**: medium

## 🚀 Despliegue en Vercel

1. Subir a GitHub
2. Importar proyecto en Vercel
3. Configurar variable de entorno:
   - `OPENAI_API_KEY`
4. Desplegar

## 📝 Notas Técnicas

- Las imágenes se procesan en formato JPEG
- Timeout de API configurado en 300 segundos (5 minutos)
- Compresión automática de imágenes grandes en el cliente
- Límite de tamaño de imagen: 5MB
- Prevención de solicitudes duplicadas (5 segundos)
- Context API para manejo de stream de cámara
- Las imágenes se devuelven como data URLs (base64)
- No se requiere almacenamiento externo

### Optimizaciones de rendimiento:
- Compresión automática de imágenes antes de enviar
- Tamaño de salida reducido a 1024x1024
- Calidad optimizada para balance entre velocidad y resultado
- Timeout extendido para conexiones lentas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir cambios mayores.

## 📄 Licencia

[Tu licencia]
