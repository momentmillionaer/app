import { useState } from 'react';

interface Event {
  title?: string;
  date?: string;
  location?: string;
  notionId?: string;
}

interface SimpleShareGeneratorProps {
  event: Event;
  format: "post" | "story";
  onImageGenerated: (imageUrl: string) => void;
}

export function SimpleShareGenerator({ event, format, onImageGenerated }: SimpleShareGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      console.log('🎨 Starting simple image generation...');
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      // Set dimensions
      canvas.width = 1080;
      canvas.height = format === "post" ? 1350 : 1920;
      
      console.log('✅ Canvas ready:', canvas.width, 'x', canvas.height);
      
      // Simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#9333ea'); // Purple
      gradient.addColorStop(1, '#3b82f6'); // Blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      console.log('✅ Background created');
      
      // Add overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        event.title || 'Event Title', 
        canvas.width / 2, 
        canvas.height / 2 - 50
      );
      
      ctx.font = '42px Arial, sans-serif';
      ctx.fillText(
        new Date(event.date || '').toLocaleDateString('de-AT'),
        canvas.width / 2, 
        canvas.height / 2 + 50
      );
      
      if (event.location) {
        ctx.font = '36px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(event.location, canvas.width / 2, canvas.height / 2 + 120);
      }
      
      console.log('✅ Text added');
      
      // Convert to data URL
      const imageUrl = canvas.toDataURL('image/png', 0.9);
      console.log('✅ Image generated successfully, size:', imageUrl.length, 'bytes');
      
      onImageGenerated(imageUrl);
      
    } catch (error) {
      console.error('❌ Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating}
      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-full font-medium transition-colors"
    >
      {isGenerating ? 'Generiere Bild...' : 'Bild erstellen'}
    </button>
  );
}