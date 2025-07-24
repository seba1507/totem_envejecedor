import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface ResultScreenProps {
  processedImageUrl: string | null;
  onReset: () => void;
}

export default function ResultScreen({ processedImageUrl, onReset }: ResultScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const downloadTriggeredRef = useRef(false);
  
  // Timer de 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  // Descargar imagen automáticamente
  useEffect(() => {
    if (!processedImageUrl || downloadTriggeredRef.current) return;
    
    const triggerDownload = async () => {
      try {
        downloadTriggeredRef.current = true;
        
        // Para data URLs, intentar método silencioso primero
        if (processedImageUrl.startsWith('data:')) {
          // Convertir data URL a blob
          const response = await fetch(processedImageUrl);
          const blob = await response.blob();
          
          // Crear URL temporal del blob
          const blobUrl = URL.createObjectURL(blob);
          
          // Crear link invisible y activarlo
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `tu_futuro_${Date.now()}.jpg`;
          link.style.display = 'none';
          
          // Agregar al DOM, hacer click y remover inmediatamente
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar URL del blob después de un momento
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } else {
          // Para URLs normales, usar método tradicional
          const link = document.createElement('a');
          link.href = processedImageUrl;
          link.download = `tu_futuro_${Date.now()}.jpg`;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        console.log('Descarga iniciada silenciosamente');
      } catch (error) {
        console.error('Error al iniciar descarga:', error);
      }
    };

    // Iniciar descarga más rápido para evitar interacción del usuario
    const downloadTimeout = setTimeout(triggerDownload, 500);
    
    return () => clearTimeout(downloadTimeout);
  }, [processedImageUrl]);

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(null);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError('Error al cargar la imagen procesada');
  };

  if (!processedImageUrl) {
    return (
      <div className="relative flex flex-col h-full w-full">
        <Image
          src="/images/background.jpg"
          alt="Fondo"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <p className="text-white text-xl">No hay imagen para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de resultado"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <h1 
          className="text-title-sm font-bold mb-4"
          style={{ fontFamily: 'Futura Std' }}
        >
          ¡ASÍ TE VERÁS!
        </h1>
        
        {/* Timer */}
        <p className="text-subtitle mb-4">
          La imagen se descargará automáticamente
        </p>
        <p className="text-xl mb-6">
          Tiempo restante: {timeRemaining} segundos
        </p>
        
        {/* Imagen procesada */}
        <div className="w-4/5 max-w-md aspect-[9/16] max-h-[55vh] bg-black rounded-2xl overflow-hidden shadow-xl relative mb-6">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Cargando imagen...
              </div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80">
              <div className="text-center text-white p-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {imageError}
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={processedImageUrl}
              alt="Tu futuro yo"
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        
        {/* Botón para finalizar */}
        <Button onClick={onReset}>
          FINALIZAR
        </Button>
      </div>
    </div>
  );
}