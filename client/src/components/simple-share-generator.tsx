import { useState } from 'react';

interface SimpleEvent {
  title?: string;
  date?: string | Date;
  location?: string | null;
  notionId?: string;
}

interface SimpleShareGeneratorProps {
  event: SimpleEvent;
  format: "post" | "story";
  onImageGenerated: (imageUrl: string) => void;
}

export function SimpleShareGenerator({ event, format, onImageGenerated }: SimpleShareGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      console.log('🎨 Starting simple image generation for:', event.title);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      // Set dimensions based on format
      canvas.width = 1080;
      canvas.height = format === "post" ? 1350 : 1920;
      
      console.log('✅ Canvas ready:', canvas.width, 'x', canvas.height, 'for format:', format);
      
      // Create vibrant gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#9333ea'); // Purple
      gradient.addColorStop(0.6, '#3b82f6'); // Blue
      gradient.addColorStop(1, '#1d4ed8'); // Darker blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle overlay for better text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      console.log('✅ Background and overlay created');
      
      // Text styling with better readability
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Main title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 56px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      
      const title = event.title || 'Event Title';
      ctx.strokeText(title, centerX, centerY - 60);
      ctx.fillText(title, centerX, centerY - 60);
      
      // Date
      const eventDate = event.date ? new Date(event.date) : new Date();
      const dateStr = eventDate.toLocaleDateString('de-AT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeText(dateStr, centerX, centerY + 20);
      ctx.fillText(dateStr, centerX, centerY + 20);
      
      // Location (if available)
      if (event.location && event.location.trim()) {
        ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const locationText = `📍 ${event.location}`;
        ctx.strokeText(locationText, centerX, centerY + 80);
        ctx.fillText(locationText, centerX, centerY + 80);
      }
      
      // Add brand text at bottom
      ctx.font = '24px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const brandText = 'momentmillionär.at';
      ctx.fillText(brandText, centerX, canvas.height - 60);
      
      console.log('✅ All text elements added');
      
      // Convert to high-quality data URL
      const imageUrl = canvas.toDataURL('image/png', 0.95);
      console.log('✅ Image generated successfully! Size:', Math.round(imageUrl.length / 1024), 'KB');
      
      onImageGenerated(imageUrl);
      
    } catch (error) {
      console.error('❌ Error generating image:', error);
      alert('Fehler beim Erstellen des Bildes. Bitte versuchen Sie es erneut.');
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