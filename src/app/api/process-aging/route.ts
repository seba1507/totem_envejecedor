// app/api/process-aging/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

// Configuración de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

// Mapa para rastrear solicitudes recientes y evitar duplicados
const recentRequests = new Map();

export async function POST(request: NextRequest) {
  console.log('Recibida solicitud en API process-aging');
  
  try {
    // Crear un ID único para esta solicitud
    const requestTime = Date.now();
    const requestId = `req_${requestTime}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Verificar si tenemos solicitudes muy recientes (últimos 5 segundos)
    const fiveSecondsAgo = requestTime - 5000;
    let duplicateDetected = false;
    
    recentRequests.forEach((timestamp, key) => {
      // Limpiar entradas antiguas
      if (timestamp < fiveSecondsAgo) {
        recentRequests.delete(key);
      }
      // Si encontramos una solicitud muy reciente, marcarla
      else if (timestamp > fiveSecondsAgo) {
        duplicateDetected = true;
      }
    });
    
    // Si detectamos una solicitud duplicada, devolver el error
    if (duplicateDetected) {
      console.log('Solicitud duplicada detectada, se devuelve error');
      return NextResponse.json({ 
        error: 'Solicitud duplicada. Por favor, espera unos segundos antes de intentarlo nuevamente.' 
      }, { status: 429 });
    }
    
    // Registrar esta solicitud
    recentRequests.set(requestId, requestTime);
    
    // Obtener datos de la petición
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen válida' }, { status: 400 });
    }
    
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'API de OpenAI no configurada. Por favor configure OPENAI_API_KEY.' 
      }, { status: 500 });
    }

    console.log(`Tamaño de imagen recibida: ${imageFile.size} bytes`);

    // Si la imagen es muy grande, rechazarla
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: 'La imagen es demasiado grande. Por favor usa una imagen menor a 5MB.' 
      }, { status: 400 });
    }

    // Preparar el FormData para OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('image', imageFile);
    openAIFormData.append('prompt', 'haz que envejezca, pero que mantenga su identidad claramente');
    openAIFormData.append('model', 'gpt-image-1');
    openAIFormData.append('n', '1');
    openAIFormData.append('size', '1024x1024'); // Tamaño reducido para mejor rendimiento
    openAIFormData.append('quality', 'low'); // Cambiado de 'low' a 'standard'
    openAIFormData.append('background', 'auto');
    openAIFormData.append('moderation', 'auto');
    openAIFormData.append('input_fidelity', 'high'); // Reducido de 'high' a 'medium'

    // Llamar a la API de OpenAI con timeout específico
    console.log('Enviando imagen a OpenAI para procesamiento...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 250000); // 250 segundos
    
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: openAIFormData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        console.error('Error de OpenAI:', errorData);
        
        if (openAIResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Error de autenticación con OpenAI. Verifique su API key.' 
          }, { status: 401 });
        }
        
        return NextResponse.json({ 
          error: errorData.error?.message || 'Error al procesar la imagen con OpenAI',
          details: errorData
        }, { status: openAIResponse.status });
      }

      const responseData = await openAIResponse.json();
      console.log('Respuesta recibida de OpenAI');

      // La respuesta puede contener una URL o datos en base64
      if (!responseData.data || !responseData.data[0]) {
        console.error('Respuesta inesperada de OpenAI:', responseData);
        return NextResponse.json({ 
          error: 'No se recibió la imagen procesada de OpenAI' 
        }, { status: 500 });
      }

      let imageBuffer: ArrayBuffer;
      
      // Verificar si la respuesta contiene base64 o URL
      if (responseData.data[0].b64_json) {
        // La imagen viene en formato base64
        console.log('Imagen recibida en formato base64');
        const base64Data = responseData.data[0].b64_json;
        
        // Convertir base64 a buffer
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBuffer = bytes.buffer;
        
      } else if (responseData.data[0].url) {
        // La imagen viene como URL
        console.log('URL de imagen procesada recibida:', responseData.data[0].url);
        
        // Descargar la imagen de la URL
        const imageResponse = await fetch(responseData.data[0].url);
        if (!imageResponse.ok) {
          throw new Error('No se pudo descargar la imagen procesada');
        }
        imageBuffer = await imageResponse.arrayBuffer();
      } else {
        console.error('Formato de respuesta no reconocido:', responseData);
        return NextResponse.json({ 
          error: 'Formato de respuesta no reconocido de OpenAI' 
        }, { status: 500 });
      }

      console.log('Imagen procesada, tamaño:', imageBuffer.byteLength, 'bytes');

      // Limpiar el map de solicitudes recientes para esta solicitud
      recentRequests.delete(requestId);

      // Convertir el buffer a base64 para enviar al frontend
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      
      // Generar información de la imagen
      const timestamp = format(new Date(), 'ddMMyyyyHHmmss');
      const fileName = `tu_futuro_${timestamp}.jpg`;
      
      console.log('Imagen procesada lista para enviar al frontend');
      
      // Devolver la imagen como data URL
      return NextResponse.json({ 
        success: true,
        imageUrl: dataUrl,
        fileName: fileName,
        timestamp: timestamp
      });
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout en la solicitud a OpenAI');
        return NextResponse.json({ 
          error: 'La solicitud tardó demasiado tiempo. Por favor intenta nuevamente.' 
        }, { status: 504 });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error("Error general:", error);
    
    // Manejo seguro del error desconocido
    let errorMessage = 'Error general en el procesamiento';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: 'Ocurrió un error al procesar la imagen'
    }, { status: 500 });
  }
}