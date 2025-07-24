# Configuración del Totem - Microsoft Edge

## Desactivar notificaciones de descarga

Para una experiencia óptima del totem, configura Microsoft Edge de la siguiente manera:

### 1. Configuración de descargas
1. Abre Microsoft Edge
2. Ve a `edge://settings/downloads` (copia y pega en la barra de direcciones)
3. Configura:
   - **Mostrar descargas cuando se completen**: DESACTIVADO ❌
   - **Preguntar dónde guardar cada archivo**: DESACTIVADO ❌
   - **Ubicación**: Selecciona una carpeta específica para las fotos del totem

### 2. Modo Kiosko (Recomendado)
Para una experiencia de totem completa:

```powershell
# Ejecutar Edge en modo kiosko
start msedge --kiosk http://localhost:3000 --edge-kiosk-type=fullscreen
```

### 3. Políticas de grupo (Para administradores)
Si tienes acceso a políticas de grupo:
1. Abre `gpedit.msc`
2. Navega a: Configuración del equipo > Plantillas administrativas > Microsoft Edge
3. Busca y configura:
   - "Mostrar el administrador de descargas" = Deshabilitado
   - "Descargas automáticas" = Habilitado

### 4. Flags experimentales
1. Ve a `edge://flags`
2. Busca "download"
3. Experimenta con:
   - "Enable download bubble" = Disabled
   - "Enable download notification" = Disabled

### 5. Modo de aplicación web
Instala el sitio como aplicación web:
1. Abre el totem en Edge
2. Click en los tres puntos → Aplicaciones → Instalar este sitio como aplicación
3. Ejecuta desde el acceso directo creado

## Notas adicionales
- Las descargas seguirán funcionando, solo se ocultarán las notificaciones
- Revisa periódicamente la carpeta de descargas para limpiar archivos antiguos
- Considera usar un script de limpieza automática para la carpeta de descargas
