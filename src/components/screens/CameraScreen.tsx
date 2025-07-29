"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useCamera } from "@/contexts/CameraContext";

interface CameraScreenProps {
  onStartCountdown: () => void;
}

export default function CameraScreen({ onStartCountdown }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, isReady, error, initializeCamera } = useCamera();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    initializeCamera();
  }, [initializeCamera]);

  useEffect(() => {
    if (videoRef.current && stream && isReady) {
      console.log("CameraScreen: Conectando stream al video");
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .then(() => {
          console.log("CameraScreen: Video reproduciendo");
          setVideoReady(true);
        })
        .catch(err => console.error("Error al reproducir:", err));
    }
  }, [stream, isReady]);

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

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mt-12 mb-8" style={{ color: '#ef4e4c' }}>
          PONTE EN POSICIÓN
          <p className="text-title-sm font-bold text-center mb-4">
            Y PREPÁRATE
          </p>
        </h1>

        <div className="w-[600px] max-w-[90vw] aspect-[9/16] max-h-[1000px] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="-scale-x-100 w-full h-full object-cover" 
          />
          
          {(!videoReady || !isReady) && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Iniciando cámara...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center p-4">
                <p className="text-white text-lg mb-4">{error}</p>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-subtitle mt-6 mb-6 text-center" style={{ color: '#ef4e4c' }}>
          Cuando estés listo, presiona:
        </p>
        <Button onClick={onStartCountdown} disabled={!videoReady || !!error}>
          Tomar foto
        </Button>
      </div>
    </div>
  );
}