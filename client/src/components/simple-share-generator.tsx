import { useState } from 'react';
import { format as formatDate } from "date-fns";
import { de } from "date-fns/locale";

interface SimpleEvent {
  title?: string;
  subtitle?: string | null;
  date?: string | Date;
  location?: string | null;
  organizer?: string | null;
  category?: string;
  price?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  time?: string | null;
  notionId?: string;
}

interface SimpleShareGeneratorProps {
  event: SimpleEvent;
  format: "post" | "story";
  onImageGenerated: (imageUrl: string) => void;
}

const backgroundGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
];

export function SimpleShareGenerator({ event, format, onImageGenerated }: SimpleShareGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getEventEmoji = (event: SimpleEvent): string => {
    const title = (event.title || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    
    if (category.includes('dating') || category.includes('❤️')) return '❤️';
    if (category.includes('festivals') || category.includes('🃏')) return '🎉';
    if (category.includes('musik') || title.includes('konzert') || title.includes('musik')) return '🎵';
    if (category.includes('sport') || title.includes('sport')) return '⚽';
    if (category.includes('kunst') || title.includes('kunst') || title.includes('galerie')) return '🎨';
    if (category.includes('theater') || title.includes('theater')) return '🎭';
    if (category.includes('kino') || title.includes('film')) return '🎬';
    if (category.includes('essen') || title.includes('restaurant') || title.includes('food')) return '🍽️';
    if (category.includes('nacht') || title.includes('party') || title.includes('club')) return '🌙';
    if (category.includes('markt') || title.includes('markt')) return '🛍️';
    if (category.includes('workshop') || title.includes('workshop')) return '🛠️';
    if (category.includes('konferenz') || title.includes('meeting')) return '👥';
    if (title.includes('weihnacht') || title.includes('christmas')) return '🎄';
    if (title.includes('silvester') || title.includes('new year')) return '🎆';
    if (title.includes('outdoor') || title.includes('wandern')) return '🏞️';
    
    return '📅';
  };

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      console.log('🎨 Generating share image for:', event.title);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      canvas.width = 1080;
      canvas.height = format === "post" ? 1350 : 1920;
      
      // Create gradient background
      const randomBg = backgroundGradients[Math.floor(Math.random() * backgroundGradients.length)];
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      if (randomBg.includes('#667eea')) {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      } else if (randomBg.includes('#f093fb')) {
        gradient.addColorStop(0, '#f093fb');
        gradient.addColorStop(1, '#f5576c');
      } else if (randomBg.includes('#4facfe')) {
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');
      } else if (randomBg.includes('#43e97b')) {
        gradient.addColorStop(0, '#43e97b');
        gradient.addColorStop(1, '#38f9d7');
      } else if (randomBg.includes('#fa709a')) {
        gradient.addColorStop(0, '#fa709a');
        gradient.addColorStop(1, '#fee140');
      } else if (randomBg.includes('#a8edea')) {
        gradient.addColorStop(0, '#a8edea');
        gradient.addColorStop(1, '#fed6e3');
      } else {
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fecfef');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Card dimensions
      const cardPadding = 40;
      const cardWidth = canvas.width - (cardPadding * 2);
      const cardHeight = format === "post" ? 900 : 1200;
      const cardX = cardPadding;
      const cardY = format === "post" ? 225 : (canvas.height - cardHeight) / 2;
      
      // Draw glass card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 32);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 32);
      ctx.stroke();
      
      // Event emoji
      ctx.font = '120px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(getEventEmoji(event), canvas.width / 2, cardY + 200);
      
      // Event title
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = 'white';
      const titleLines = wrapText(ctx, event.title || 'Event', cardWidth - 80);
      let yPos = cardY + 320;
      titleLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, yPos);
        yPos += 80;
      });
      
      // Event date
      if (event.date) {
        const eventDate = new Date(event.date);
        const dateStr = formatDate(eventDate, "EEEE, dd.MM.yyyy", { locale: de });
        ctx.font = '36px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(dateStr, canvas.width / 2, yPos + 60);
        yPos += 80;
      }
      
      // Event time and location
      if (event.time || event.location) {
        const timeLocation = [event.time, event.location].filter(Boolean).join(' • ');
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(timeLocation, canvas.width / 2, yPos + 40);
        yPos += 60;
      }
      
      // Organizer
      if (event.organizer) {
        ctx.font = '28px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(event.organizer, canvas.width / 2, yPos + 40);
      }
      
      // Branding
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('momentmillionär', canvas.width / 2, cardY + cardHeight - 60);
      
      const dataUrl = canvas.toDataURL('image/png');
      onImageGenerated(dataUrl);
      console.log('✅ Share image generated successfully');
      
    } catch (error) {
      console.error('❌ Failed to generate share image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isGenerating ? 'Generiere...' : `${format === 'post' ? 'Post' : 'Story'} Bild erstellen`}
    </button>
  );
}