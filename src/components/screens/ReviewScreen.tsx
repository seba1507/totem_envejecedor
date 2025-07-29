"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface ReviewScreenProps {
  imageUrl: string | null;
  onAccept: () => void;
  onRetake: () => void;
}

export default function ReviewScreen({ imageUrl, onAccept, onRetake }: ReviewScreenProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  
  if (!imageUrl) return null;

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
        <h1 className="text-title-sm font-bold text-center mb-12" style={{ color: '#ef4e4c' }}>¿TE GUSTA TU FOTO?</h1>

        <div className="w-[600px] max-w-[90vw] aspect-[9/16] max-h-[1000px] bg-white rounded-2xl overflow-hidden shadow-xl relative">
          <Image
            src={imageUrl}
            alt="Foto capturada"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="flex gap-8 mt-8">
          <Button
            onClick={onRetake}
            className="bg-gray-600 hover:bg-gray-700"
            disabled={isAccepting}
          >
            Repetir
          </Button>
          <Button 
            onClick={() => {
              if (!isAccepting) {
                setIsAccepting(true);
                onAccept();
              }
            }}
            disabled={isAccepting}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}