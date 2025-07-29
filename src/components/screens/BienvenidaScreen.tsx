'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface BienvenidaScreenProps {
  onNavigate: () => void;
}

const BienvenidaScreen: React.FC<BienvenidaScreenProps> = ({ onNavigate }) => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  
  const messages = [
    {
      lines: ["¿SABES QUE", "ES EL", "INFLAMMAGING?"],
      emphasis: [true, true, false]
    },
    {
      lines: ["Y ¿QUÉ HACE EN", "TU PIEL?"],
      emphasis: [true, true]
    },
    {
      lines: ["TOCA LA", "PANTALLA Y", "DESCÚBRELO"],
      emphasis: [true, true, false]
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex];
  
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Fondo */}
      <Image
        src="/images/background.jpg"
        alt="Fondo de bienvenida"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* Título principal - en posición absoluta centrada */}
      <div className="absolute top-2/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-10">
        <h1 
          className="font-bold tracking-tight leading-none transition-opacity duration-500" 
          style={{ 
            fontFamily: 'Futura Std', 
            fontWeight: 'bold',
            opacity: 1,
            color: '#ef4e4c'
          }}
        >
          {currentMessage.lines.map((line, index) => (
            <div key={index} className={index === 0 ? "text-title-lg" : "text-title-lg mt-8"}>
              {currentMessage.emphasis[index] ? <strong>{line}</strong> : line}
            </div>
          ))}
        </h1>
      </div>
      
      {/* Botón - posición absoluta ajustada hacia arriba */}
      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 z-10">
        <Button onClick={onNavigate}>
          Iniciar
        </Button>
      </div>
    </div>
  );
};

export default BienvenidaScreen;