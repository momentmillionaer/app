import { useState } from 'react';
import { format as formatDate } from "date-fns";
import { de } from "date-fns/locale";

interface AdvancedEvent {
  title?: string;
  subtitle?: string | null;
  date?: string | Date;
  location?: string | null;
  organizer?: string | null;
  category?: string;
  price?: string | null;
  notionId?: string;
}

interface AdvancedShareGeneratorProps {
  event: AdvancedEvent;
  format: "post" | "story";
  onImageGenerated: (imageUrl: string) => void;
}

// Array of available background images
const backgroundImages = [
  '/attached_assets/222401fgsdl_1753093711965.jpg',
  '/attached_assets/226718fgsdl_1753093711965.jpg', 
  '/attached_assets/228439fgsdl_1753093711965.jpg',
  '/attached_assets/244783fgsdl_1753093711966.jpg',
  '/attached_assets/245018fgsdl_1753093711966.jpg',
  '/attached_assets/509932ldsdl_1753093711966.jpg',
  '/attached_assets/540710ldsdl_1753093711966.jpg'
];

export function AdvancedShareGenerator({ event, format, onImageGenerated }: AdvancedShareGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to get event emoji like in EventCard
  const getEventEmoji = (event: AdvancedEvent): string => {
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

  const loadImageWithCORS = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback without CORS
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = reject;
        fallbackImg.src = src;
      };
      img.src = src;
    });
  };

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      console.log('🎨 Starting advanced EventCard-style image generation for:', event.title);
      
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
      
      // Select random background image
      const randomBg = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
      console.log('🖼️ Selected background:', randomBg);
      
      let bgImg: HTMLImageElement | null = null;
      
      try {
        // Load and draw background image
        bgImg = await loadImageWithCORS(randomBg);
        
        // Calculate aspect ratio and cover the canvas
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = bgImg.width / bgImg.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          // Image is wider, fit height
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller, fit width
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
        console.log('✅ Background image loaded and drawn');
        
      } catch (error) {
        console.warn('⚠️ Background image failed to load, using gradient fallback:', error);
        bgImg = null;
        
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#9333ea');
        gradient.addColorStop(0.6, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Add dark overlay for text readability (like EventCard)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create EventCard-style layout matching the screenshot
      const cardPadding = 32;
      const cardWidth = canvas.width - (cardPadding * 2);
      const cardHeight = format === "post" ? 1000 : 1200;
      let cardX = cardPadding;
      let cardY = format === "post" ? 175 : (canvas.height - cardHeight) / 2;
      
      const cardRadius = 32; // rounded-[2rem] like EventCard
      
      // Liquid glass background (matching EventCard styling)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
      ctx.fill();
      
      // Border (matching EventCard)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
      ctx.stroke();
      
      console.log('✅ EventCard-style glass morphism card created');
      
      // Top image section (like in screenshot)
      const imageHeight = 300;
      const imageY = cardY + 24;
      const imageRadius = 24;
      
      // Create clipping path for image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX + 24, imageY, cardWidth - 48, imageHeight, imageRadius);
      ctx.clip();
      
      // If background image was loaded, draw a portion as the event image
      if (bgImg) {
        // Draw the background image cropped to fit the image area
        const imgAspect = bgImg.width / bgImg.height;
        const areaAspect = (cardWidth - 48) / imageHeight;
        
        let drawW, drawH, drawX, drawY;
        if (imgAspect > areaAspect) {
          drawH = imageHeight;
          drawW = drawH * imgAspect;
          drawX = cardX + 24 - (drawW - (cardWidth - 48)) / 2;
          drawY = imageY;
        } else {
          drawW = cardWidth - 48;
          drawH = drawW / imgAspect;
          drawX = cardX + 24;
          drawY = imageY - (drawH - imageHeight) / 2;
        }
        
        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
      } else {
        // Fallback gradient for image area
        const imgGradient = ctx.createLinearGradient(cardX + 24, imageY, cardX + cardWidth - 24, imageY + imageHeight);
        imgGradient.addColorStop(0, '#6366f1');
        imgGradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = imgGradient;
        ctx.fillRect(cardX + 24, imageY, cardWidth - 48, imageHeight);
      }
      
      ctx.restore();
      
      // Content positioning (below image, like in screenshot)
      let currentY = imageY + imageHeight + 40;
      const contentLeftX = cardX + 40;
      const contentWidth = cardWidth - 80;
      
      // Category badge (top left, like in screenshot)
      if (event.category && event.category.trim()) {
        ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
        const categoryText = event.category;
        const textMetrics = ctx.measureText(categoryText);
        const badgeWidth = textMetrics.width + 24;
        const badgeHeight = 32;
        
        // Badge background (like in screenshot - dark with transparency)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(contentLeftX, currentY - 24, badgeWidth, badgeHeight, 16);
        ctx.fill();
        
        // Badge text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(categoryText, contentLeftX + 12, currentY - 4);
        currentY += 20;
      }
      
      // Date (top right, like in screenshot)
      if (event.date) {
        const eventDate = new Date(event.date);
        const dayName = formatDate(eventDate, 'EE', { locale: de });
        const dateStr = formatDate(eventDate, 'dd. MMM', { locale: de });
        
        ctx.textAlign = 'right';
        ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(dayName + '.', cardX + cardWidth - 40, currentY - 20);
        
        ctx.font = 'bold 32px "Helvetica Neue", Arial, sans-serif';
        ctx.fillText(dateStr + '.', cardX + cardWidth - 40, currentY + 8);
      }
      
      currentY += 40;
      
      // Event title (large, bold, lime green like in screenshot)
      ctx.fillStyle = '#D0FE1D'; // Brand lime color
      ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      
      const title = event.title || 'Event Title';
      // Text wrapping for long titles
      const words = title.split(' ');
      let line = '';
      const maxWidth = contentWidth - 40;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.strokeText(line.trim(), contentLeftX, currentY);
          ctx.fillText(line.trim(), contentLeftX, currentY);
          line = word + ' ';
          currentY += 60;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.strokeText(line.trim(), contentLeftX, currentY);
        ctx.fillText(line.trim(), contentLeftX, currentY);
        currentY += 70;
      }
      
      // Subtitle (italic, smaller, like in screenshot)
      if (event.subtitle && event.subtitle.trim()) {
        ctx.font = 'italic 28px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeText(event.subtitle, contentLeftX, currentY);
        ctx.fillText(event.subtitle, contentLeftX, currentY);
        currentY += 60;
      }
      
      // Location (if available)
      if (event.location && event.location.trim()) {
        ctx.font = '24px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`📍 ${event.location}`, contentLeftX, currentY);
        currentY += 50;
      }
      
      // Organizer (if available)
      if (event.organizer && event.organizer.trim()) {
        ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`👥 ${event.organizer}`, contentLeftX, currentY);
        currentY += 45;
      }
      
      // FREE badge (bottom right, like in screenshot)
      if (event.price === "0") {
        const freeText = 'FREE';
        ctx.font = 'bold 24px "Helvetica Neue", Arial, sans-serif';
        const freeMetrics = ctx.measureText(freeText);
        const freeBadgeWidth = freeMetrics.width + 20;
        const freeBadgeHeight = 40;
        const freeBadgeX = cardX + cardWidth - freeBadgeWidth - 40;
        const freeBadgeY = cardY + cardHeight - freeBadgeHeight - 40;
        
        // FREE badge background (blue like in screenshot)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.beginPath();
        ctx.roundRect(freeBadgeX, freeBadgeY, freeBadgeWidth, freeBadgeHeight, 8);
        ctx.fill();
        
        // FREE badge text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(freeText, freeBadgeX + freeBadgeWidth / 2, freeBadgeY + 28);
      }
      
      // Price (if not free)
      if (event.price && event.price.trim() && event.price !== "0") {
        ctx.font = 'bold 28px "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#D0FE1D';
        ctx.textAlign = 'right';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeText(`€ ${event.price}`, cardX + cardWidth - 40, cardY + cardHeight - 60);
        ctx.fillText(`€ ${event.price}`, cardX + cardWidth - 40, cardY + cardHeight - 60);
      }
      
      // Brand text at bottom
      ctx.font = '28px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      const brandText = 'momentmillionär.at';
      ctx.fillText(brandText, canvas.width / 2, canvas.height - 40);
      
      console.log('✅ All EventCard-style content added');
      
      // Convert to high-quality data URL
      const imageUrl = canvas.toDataURL('image/png', 0.95);
      console.log('✅ Advanced EventCard-style image generated! Size:', Math.round(imageUrl.length / 1024), 'KB');
      
      onImageGenerated(imageUrl);
      
    } catch (error) {
      console.error('❌ Error generating advanced image:', error);
      alert('Fehler beim Erstellen des EventCard-style Bildes. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating}
      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
      style={{
        backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
      }}
    >
      {isGenerating ? 'Erstelle EventCard-Style Bild...' : '🎨 EventCard-Style Bild erstellen'}
    </button>
  );
}