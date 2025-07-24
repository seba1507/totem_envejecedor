"use client";

import { useState, useEffect } from 'react';
import BienvenidaScreen from '@/components/screens/BienvenidaScreen';
import CameraScreen from '@/components/screens/CameraScreen';
import CountdownScreen from '@/components/screens/CountdownScreen';
import ReviewScreen from '@/components/screens/ReviewScreen';
import ProcessingScreen from '@/components/screens/ProcessingScreen';
import ResultScreen from '@/components/screens/ResultScreen';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { CameraProvider } from '@/contexts/CameraContext';

// Define los estados posibles
type AppState =
  | 'bienvenida'     // Pantalla inicial
  | 'camera'         // Pantalla de cámara
  | 'countdown'      // Cuenta regresiva
  | 'review'         // Revisión de foto
  | 'processing'     // Procesando con IA
  | 'result'         // Resultado final con imagen
  | 'error';         // Pantalla de error

export default function Home() {
  // Estado principal de la aplicación
  const [currentState, setCurrentState] = useState<AppState>('bienvenida');

  // Estados para guardar datos de la aplicación
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado para prevenir múltiples transiciones
  const [isNavigating, setIsNavigating] = useState(false);

  // Registro para depuración
  useEffect(() => {
    console.log("Estado actual:", currentState);
  }, [currentState]);

  // Función para navegar entre estados con protección - versión mejorada
  const navigateTo = (state: AppState, force = false) => {
    console.log(`Intentando navegar a: ${state} (Forzado: ${force})`);

    if (isNavigating && !force) {
      console.log("Navegación bloqueada por isNavigating");
      return;
    }

    console.log(`Navegando de ${currentState} a ${state}`);
    setIsNavigating(true);
    setCurrentState(state);

    // Desbloquear después de un breve periodo
    setTimeout(() => {
      setIsNavigating(false);
      console.log("Navegación desbloqueada");
    }, 500);
  };

  // Función para capturar imagen - versión mejorada
  const handleImageCapture = (imageData: string) => {
    console.log("handleImageCapture llamado con datos de imagen",
                imageData.substring(0, 50) + "...");

    // Guardar la imagen primero
    setCapturedImage(imageData);

    // Forzar la navegación, incluso si está bloqueada
    setTimeout(() => {
      navigateTo('review', true);
    }, 100);
  };

  // Función para procesar imagen cuando el usuario acepta en review
  const handleAcceptImage = () => {
    console.log("Imagen aceptada, navegando a la pantalla de procesamiento");
    
    // Limpiar la imagen procesada anterior
    setProcessedImageUrl(null);
    
    navigateTo('processing', true);
  };

  // Función para manejar el resultado del procesamiento
  const handleProcessingComplete = (imageUrl: string) => {
    console.log("Procesamiento completado, URL de imagen procesada:", imageUrl);
    
    // Actualizar primero el estado de la imagen procesada
    setProcessedImageUrl(imageUrl);
    
    // Esperar brevemente para que React actualice el estado
    setTimeout(() => {
      navigateTo('result', true);
    }, 100);
  };

  // Función para manejar errores de procesamiento
  const handleProcessingError = (error: string) => {
    console.error("Error durante el procesamiento:", error);
    setErrorMessage(error);
    navigateTo('error', true);
  };

  // Función para reiniciar la aplicación
  const handleReset = () => {
    console.log("Reiniciando aplicación");
    setCapturedImage(null);
    setProcessedImageUrl(null);
    setErrorMessage(null);
    navigateTo('bienvenida', true);
  };

  // Renderizado condicional basado en el estado actual
  return (
    <CameraProvider>
      <main className="relative w-full h-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/background.jpg"
          alt="Fondo"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        
        {/* Semi-transparent overlay if needed, or just rely on content z-index */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">

          {currentState === 'bienvenida' && (
            <BienvenidaScreen onNavigate={() => navigateTo('camera')} />
          )}

          {currentState === 'camera' && (
            <CameraScreen
              onStartCountdown={() => navigateTo('countdown')}
            />
          )}

          {currentState === 'countdown' && (
            <CountdownScreen
              onCapture={handleImageCapture}
            />
          )}

          {currentState === 'review' && (
            <ReviewScreen
              imageUrl={capturedImage}
              onAccept={handleAcceptImage}
              onRetake={() => navigateTo('camera')}
            />
          )}

          {currentState === 'processing' && (
            <ProcessingScreen
              imageUrl={capturedImage}
              onProcessingComplete={handleProcessingComplete}
              onProcessingError={handleProcessingError}
            />
          )}

          {currentState === 'result' && (
            <ResultScreen
              processedImageUrl={processedImageUrl}
              onReset={handleReset}
            />
          )}

          {currentState === 'error' && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
               <h1 className="text-title-sm font-bold text-center mb-8 text-white drop-shadow">¡UPS! ALGO SALIÓ MAL</h1>

               <div className="bg-red-500/80 p-4 rounded-xl mb-8 max-w-md">
                 <p className="text-subtitle text-white text-center">
                   {errorMessage || "Error desconocido al procesar la imagen"}
                 </p>
               </div>

               <Button onClick={handleReset}>
                 Volver a intentar
               </Button>
             </div>
          )}

        </div>
      </main>
    </CameraProvider>
  );
}