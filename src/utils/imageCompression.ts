// Utilidad para comprimir imágenes en el cliente
export async function compressImage(
  imageDataUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto del canvas'));
        return;
      }

      // Calcular nuevo tamaño manteniendo aspecto
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a JPEG con compresión
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      console.log(`Imagen comprimida: ${img.width}x${img.height} → ${width}x${height}`);
      
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Error al cargar imagen para comprimir'));
    img.src = imageDataUrl;
  });
}
