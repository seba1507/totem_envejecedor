"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useCamera } from "@/contexts/CameraContext";

interface CountdownScreenProps {
  onCapture: (data: string) => void;
}

export default function CountdownScreen({ onCapture }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  
  const { stream, isReady } = useCamera();

  // Conectar stream al video cuando se monte el componente
  useEffect(() => {
    if (videoRef.current && stream && isReady) {
      console.log("CountdownScreen: Conectando stream al video");
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .then(() => {
          console.log("CountdownScreen: Video reproduciendo");
          setVideoReady(true);
        })
        .catch(err => console.error("Error al reproducir:", err));
    }
  }, [stream, isReady]);

  /* ----------------------------- Captura ------------------------------ */
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !videoReady) {
      console.error("Refs not available for capture or video not ready");
      return;
    }

    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 1080;
    c.height = 1920;

    const ctx = c.getContext("2d")!;
    const aspectTarget = 9 / 16;
    const aspectVideo = v.videoWidth / v.videoHeight;

    let sx = 0,
      sy = 0,
      sw = v.videoWidth,
      sh = v.videoHeight;

    if (aspectVideo > aspectTarget) {
      // Recortar horizontal
      sh = v.videoHeight;
      sw = sh * aspectTarget;
      sx = (v.videoWidth - sw) / 2;
    } else {
      // Recortar vertical
      sw = v.videoWidth;
      sh = sw / aspectTarget;
      sy = (v.videoHeight - sh) / 2;
    }

    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.restore();

    onCapture(c.toDataURL("image/jpeg", 0.9));
  }, [onCapture, videoReady]);

  /* --------------------- Lógica unificada de temporizador -------------- */
  useEffect(() => {
    // No iniciar la cuenta regresiva hasta que el video esté listo
    if (!videoReady) return;
    
    if (count === 0) {
      // Momento "flash" => capturar y avisar al padre
      setFlash(true);
      capture();
      const off = setTimeout(() => setFlash(false), 120);
      return () => clearTimeout(off);
    }

    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, capture, videoReady]);

  /* -------------------------------- UI -------------------------------- */
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Background Image */}
      <Image
        src="/images/background.jpg"
        alt="Fondo"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-title-sm font-bold text-center mb-8 text-white drop-shadow">¡PREPÁRATE!</h1>

        <div className="w-[600px] max-w-[90vw] aspect-[9/16] max-h-[1000px] bg-black rounded-2xl overflow-hidden shadow-xl relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="-scale-x-100 w-full h-full object-cover"
          />

          {/* Estado de carga de la cámara */}
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Preparando cámara...</p>
              </div>
            </div>
          )}

          {/* Número de cuenta regresiva */}
          {videoReady && count > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-white font-bold z-20 drop-shadow-lg"
                style={{
                  fontFamily: "Futura Std",
                  fontSize: "180px",
                  textShadow: "0 0 15px #000",
                }}
              >
                {count}
              </span>
            </div>
          )}
        </div>
      </div>

      {flash && (
        <div className="absolute inset-0 bg-white z-30 animate-[blink_120ms_ease-out]" />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}