'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

interface ProcessingScreenProps {
  imageUrl: string | null;
  onProcessingComplete: (imageUrl: string) => void;
  onProcessingError: (error: string) => void;
}

export default function ProcessingScreen({ 
  imageUrl, 
  onProcessingComplete, 
  onProcessingError 
}: ProcessingScreenProps) {
  const [processingStatus, setProcessingStatus] = useState<string>("Preparando imagen...");
  
  // Usamos refs en lugar de estado para evitar re-renders que podrían causar múltiples ejecuciones
  const isProcessingRef = useRef<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Este efecto se ejecuta UNA SOLA VEZ debido al array de dependencias vacío []
  useEffect(() => {
    let isMounted = true;
    
    if (!imageUrl) {
      onProcessingError("No hay imagen para procesar");
      return;
    }
    
    const processImage = async () => {
      // ¡Verificación crítica! Si ya estamos procesando, salir inmediatamente
      if (isProcessingRef.current === true) {
        console.log("⚠️ Ya hay un procesamiento en curso, no iniciando otro");
        return;
      }
      
      // Marcar que estamos procesando
      isProcessingRef.current = true;
      
      try {
        if (!isMounted) return;
        setProcessingStatus("Preparando imagen...");
        
        // Comprimir la imagen antes de enviarla
        let compressedImageUrl = imageUrl;
        try {
          compressedImageUrl = await compressImage(imageUrl, 800, 1200, 0.85);
          console.log('Imagen comprimida exitosamente');
        } catch (compressionError) {
          console.warn('No se pudo comprimir la imagen, usando original:', compressionError);
        }
        
        // Convertir la dataURL a un Blob para enviarla
        const response = await fetch(compressedImageUrl);
        const blob = await response.blob();
        console.log(`Tamaño de imagen a enviar: ${blob.size} bytes`);

        // Crear un FormData y añadir la imagen
        const formData = new FormData();
        formData.append('image', blob, 'captured-image.jpg');
        
        // Añadir un timestamp único para cada solicitud
        formData.append('timestamp', Date.now().toString());

        // Enviar a la API de procesamiento
        if (!isMounted) return;
        setProcessingStatus("Aplicando inteligencia artificial...");
        
        // Crear controlador de timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 290000); // 290 segundos
        
        try {
          const processResponse = await fetch('/api/process-aging', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            // Añadir cache-busting para asegurar que no se usa una respuesta cacheada
            headers: {
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache',
              'X-Request-Time': Date.now().toString()
            }
          });
          
          clearTimeout(timeoutId);

          if (!processResponse.ok) {
            const errorData = await processResponse.json();
            throw new Error(errorData.error || 'Error al procesar la imagen');
          }

          const data = await processResponse.json();
          
          if (!data.success) {
            throw new Error('Error en el procesamiento de la imagen');
          }

          // Verificar si ya completamos este proceso o ya no estamos montados
          if (isCompletedRef.current || !isMounted) {
            console.log("Ignorando resultado porque el componente ya no está montado o el procesamiento ya fue completado");
            return;
          }

          if (!isMounted) return;
          setProcessingStatus("¡Imagen lista!");
          
          // URL de la imagen procesada
          const processedImageUrl = data.imageUrl;
          console.log("URL de imagen procesada:", processedImageUrl);
          
          // Marcar como completado ANTES de la llamada de retorno
          isCompletedRef.current = true;
          
          // Asegurarnos de que solo llamamos a onProcessingComplete UNA VEZ
          if (isMounted) {
            onProcessingComplete(processedImageUrl);
          }
          
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('El procesamiento tardó demasiado tiempo. Por favor intenta nuevamente.');
          }
          
          throw fetchError;
        }
        
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        if (!isMounted) return;
        
        setProcessingStatus("Error al procesar la imagen");
        
        onProcessingError(
          error instanceof Error 
            ? error.message 
            : 'Ocurrió un error inesperado al procesar la imagen'
        );
      } finally {
        // Marcar que terminamos el procesamiento
        isProcessingRef.current = false;
      }
    };
    
    // Iniciar procesamiento con un leve retraso para que se vea la pantalla
    // Guardamos la referencia al timeout para poder limpiarlo si el componente se desmonta
    processingTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.log("⏱️ Iniciando procesamiento después del timeout");
        processImage();
      }
    }, 500);
    
    // Limpieza cuando el componente se desmonta
    return () => {
      console.log("🧹 Desmontando ProcessingScreen, limpiando recursos");
      isMounted = false;
      
      // Limpiar timeout si existe
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar el estado solo cuando cambia la URL de la imagen 
  // (pero NO reiniciar el procesamiento)
  useEffect(() => {
    if (!imageUrl) {
      onProcessingError("No hay imagen para procesar");
    }
  }, [imageUrl, onProcessingError]);

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de procesamiento"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 
          className="text-title-sm font-bold mb-8 text-center px-6"
          style={{ fontFamily: 'Futura Std' }}
        >
          VIAJANDO AL FUTURO
        </h1>
        
        {/* Animación de carga */}
        <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
        
        {/* Estado de procesamiento */}
        <p className="text-subtitle text-center px-8 max-w-md">
          {processingStatus}
        </p>
        <p className="text-sm text-center px-8 max-w-md mt-2 opacity-70">
          Este proceso puede tomar hasta 2 minutos
        </p>
      </div>
    </div>
  );
}