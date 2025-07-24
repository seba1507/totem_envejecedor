"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface CameraContextType {
  stream: MediaStream | null;
  isReady: boolean;
  error: string | null;
  initializeCamera: () => Promise<void>;
  releaseCamera: () => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeCamera = useCallback(async () => {
    if (stream) {
      console.log("Stream ya existe, reutilizando");
      return;
    }

    try {
      console.log("CameraContext: Solicitando acceso a cámara...");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 }
        }
      });

      console.log("CameraContext: Stream obtenido");
      setStream(newStream);
      setIsReady(true);
    } catch (e) {
      console.error("Error al inicializar cámara:", e);
      setError("No se pudo acceder a la cámara");
      setIsReady(false);
    }
  }, [stream]);

  const releaseCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      releaseCamera();
    };
  }, [releaseCamera]);

  return (
    <CameraContext.Provider value={{
      stream,
      isReady,
      error,
      initializeCamera,
      releaseCamera
    }}>
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera debe ser usado dentro de CameraProvider');
  }
  return context;
};