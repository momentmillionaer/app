import React, { useState, useRef } from "react";
import { format as formatDate } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share2, Download, Copy, Link } from "lucide-react";
import { Event } from "@shared/schema";
import { SimpleShareGenerator } from './simple-share-generator';

interface ShareEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareEventDialog({ event, isOpen, onClose }: ShareEventDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"post" | "story">("post");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset state when dialog opens or format changes
  React.useEffect(() => {
    if (isOpen) {
      setShareImageUrl(null);
      setIsGenerating(false);
    }
  }, [isOpen, format]);

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const generateShareImage = async () => {
    console.log('🎨 Starting share image generation...');
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ Canvas not found');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Canvas context not found');
        return;
      }
      
      console.log('✅ Canvas and context ready');
      
      // Set canvas size based on selected format
      if (format === "post") {
        // Instagram Post format (4:5 ratio - 1080x1350)
        canvas.width = 1080;
        canvas.height = 1350;
      } else {
        // Instagram Story format (9:16 ratio - 1080x1920)
        canvas.width = 1080;
        canvas.height = 1920;
      }
      
      // Classical paintings from attached assets - using latest versions
      const paintings = [
        '/attached_assets/208195fgsdl_1753093711962.jpg', // Woman knitting by the coast
        '/attached_assets/222401fgsdl_1753093711965.jpg', // Evening dinner scene with candles
        '/attached_assets/226718fgsdl_1753093711965.jpg', // Oriental marketplace scene
        '/attached_assets/228439fgsdl_1753093711965.jpg', // Classical feast in colonnade
        '/attached_assets/244783fgsdl_1753093711966.jpg', // Garden scene with classical figures
        '/attached_assets/245018fgsdl_1753093711966.jpg', // Rococo garden party
        '/attached_assets/509932ldsdl_1753093711966.jpg', // River landscape
        '/attached_assets/540710ldsdl_1753093711966.jpg'  // Norwegian fjord scene
      ];
      const randomPainting = paintings[Math.floor(Math.random() * paintings.length)];
      
      // Glow colors from brand palette
      const glowColors = [
        { name: 'Purple', color: '#9333ea', rgba: '147, 51, 234' },
        { name: 'Orange', color: '#f59e0b', rgba: '245, 158, 11' },
        { name: 'Blue', color: '#3b82f6', rgba: '59, 130, 246' },
        { name: 'Lime', color: '#d0fe1d', rgba: '208, 254, 29' },
        { name: 'Pink', color: '#f3dcfa', rgba: '243, 220, 250' },
        { name: 'Cream', color: '#fee4c3', rgba: '254, 228, 195' }
      ];
      const randomGlow = glowColors[Math.floor(Math.random() * glowColors.length)];
      
      // Create beautiful gradient background
      console.log('🎨 Creating gradient background...');
      const gradientColors = [
        ['#9333ea', '#3b82f6'], // Purple to Blue
        ['#f59e0b', '#ef4444'], // Orange to Red  
        ['#3b82f6', '#06b6d4'], // Blue to Cyan
        ['#d0fe1d', '#84cc16'], // Lime to Green
        ['#f3dcfa', '#e879f9'], // Pink to Magenta
        ['#fee4c3', '#f59e0b']  // Cream to Orange
      ];
      
      const randomGradientColors = gradientColors[Math.floor(Math.random() * gradientColors.length)];
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, randomGradientColors[0]);
      gradient.addColorStop(1, randomGradientColors[1]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle overlay for text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      console.log('✅ Gradient background created');

      // Card layout - same size for both formats, centered for story
      const cardPadding = 48;
      const cardWidth = canvas.width - (cardPadding * 2);
      
      // Use same card height for both formats (post format dimensions)
      const postFormatHeight = 1350;
      const baseCardHeight = postFormatHeight - 100 - 160; // Same as post format
      
      let cardX = cardPadding;
      let cardY = 100;
      let cardHeight = baseCardHeight;
      
      // For story format, center the card vertically
      if (format === "story") {
        cardHeight = baseCardHeight; // Keep same height as post
        cardY = (canvas.height - cardHeight) / 2; // Center vertically
      }
      
      const cardRadius = 32;

      // Liquid glass background - darker and more blurry effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
      ctx.fill();

      // Dynamic colored border
      ctx.strokeStyle = `rgba(${randomGlow.rgba}, 0.4)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = randomGlow.color;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = `rgba(${randomGlow.rgba}, 0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX - 2, cardY - 2, cardWidth + 4, cardHeight + 4, cardRadius + 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Skip image loading for now - just use text layout
      const imageHeight = 0;
      let contentStartY = cardY + 48;
      
      console.log('📝 Skipping image loading, proceeding with text rendering...');

      // Add event title text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 42px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(event.title || 'Event Title', canvas.width / 2, cardY + 120);
      
      // Add date
      ctx.font = '32px Helvetica, Arial, sans-serif';
      ctx.fillText(
        new Date(event.date || '').toLocaleDateString('de-AT'),
        canvas.width / 2, 
        cardY + 180
      );
      
      // Add location if available
      if (event.location) {
        ctx.font = '28px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(event.location, canvas.width / 2, cardY + 220);
      }
      
      console.log('✅ Text content added');

      // Content
      let currentY = cardY + 280;

      // Category badge
      if (event.category) {
        ctx.font = 'bold 28px Helvetica, Arial, sans-serif';
        const categoryText = event.category;
        const textWidth = ctx.measureText(categoryText).width;
        const badgeWidth = textWidth + 40;
        const badgeHeight = 44;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(cardX + 48, currentY - 32, badgeWidth, badgeHeight, 22);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(categoryText, cardX + 48 + badgeWidth / 2, currentY);
        ctx.textAlign = 'left';
        
        currentY += 80;
      }

      // Event title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 52px Helvetica, Arial, sans-serif';
      const titleLines = wrapText(ctx, event.title, cardWidth - 96);
      titleLines.forEach(line => {
        ctx.fillText(line, cardX + 48, currentY);
        currentY += 60;
      });

      currentY += 15;

      // Organizer (below title)
      if (event.organizer) {
        ctx.font = '36px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(event.organizer, cardX + 48, currentY);
        currentY += 50;
      }

      // Subtitle
      if (event.subtitle) {
        ctx.font = 'italic 32px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const subtitleLines = wrapText(ctx, event.subtitle, cardWidth - 96);
        subtitleLines.forEach(line => {
          ctx.fillText(line, cardX + 48, currentY);
          currentY += 38;
        });
        currentY += 15;
      }

      // Event details
      ctx.font = '32px Helvetica, Arial, sans-serif';
      const leftColumnX = cardX + 48;

      // Date
      if (event.date) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const eventDate = new Date(event.date + 'T12:00:00+02:00');
        const dateText = `📅 ${formatDate(eventDate, "EEEE, dd. MMMM yyyy", { locale: de })}`;
        ctx.fillText(dateText, leftColumnX, currentY);
        currentY += 44;
      }
      
      // Time
      if (event.time) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`🕐 ${event.time}`, leftColumnX, currentY);
        currentY += 44;
      }

      // Location
      if (event.location) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`📍 ${event.location}`, leftColumnX, currentY);
        currentY += 44;
      }

      // Free event emoji (positioned top right)
      if (event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0) {
        ctx.font = '48px Arial, sans-serif';
        ctx.fillText('🆓', cardX + cardWidth - 100, cardY + 80);
      }

      currentY += 20;

      // Description
      if (event.description && event.description.trim() && !event.description.startsWith('Termine:')) {
        ctx.font = '28px Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const descLines = wrapText(ctx, event.description, cardWidth - 96);
        descLines.slice(0, 3).forEach(line => { // Limit to 3 lines
          ctx.fillText(line, leftColumnX, currentY);
          currentY += 34;
        });
        currentY += 20;
      }

      // Check for multi-date events and show additional dates only if there are multiple dates
      const futureDates: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let hasMultipleDates = false;
      
      // Parse Termine: format for additional dates from description
      if (event.description && event.description.includes('Termine:')) {
        const dateMatches = event.description.match(/(\d{2}\.\d{2}\.\d{4})/g);
        if (dateMatches && dateMatches.length > 1) { // Only if more than one date
          hasMultipleDates = true;
          dateMatches.forEach((dateStr, index) => {
            if (index === 0) return; // Skip first date (already shown with calendar emoji)
            const [day, month, year] = dateStr.split('.');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (date > today) {
              futureDates.push(formatDate(date, "dd.MM", { locale: de }));
            }
          });
        }
      }
      
      // Also check if we have endDate indicating a date range
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        const startDate = new Date(event.date);
        if (endDate > startDate && endDate > today) {
          hasMultipleDates = true;
          futureDates.push(formatDate(endDate, "dd.MM", { locale: de }));
        }
      }

      // Additional dates as badges (only for multi-date events)
      if (hasMultipleDates && futureDates.length > 0) {
        currentY += 10;
        const badgeStartY = currentY;
        let badgeX = leftColumnX;
        let badgeY = badgeStartY;
        const maxBadgesPerRow = 4;
        let badgeCount = 0;
        const maxBadges = 6;
        
        futureDates.slice(0, maxBadges).forEach((dateStr, index) => {
          if (index >= maxBadges) return;
          
          if (badgeCount >= maxBadgesPerRow) {
            badgeX = leftColumnX;
            badgeY += 55;
            badgeCount = 0;
          }
          
          const badgeText = dateStr;
          ctx.font = 'bold 24px Helvetica, Arial, sans-serif';
          const textWidth = ctx.measureText(badgeText).width;
          const badgeWidth = textWidth + 24;
          const badgeHeight = 36;
          
          // Badge background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 26, badgeWidth, badgeHeight, 18);
          ctx.fill();
          
          // Badge border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 26, badgeWidth, badgeHeight, 18);
          ctx.stroke();
          
          // Badge text
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY - 2);
          ctx.textAlign = 'left';
          
          badgeX += badgeWidth + 12;
          badgeCount++;
        });
        
        // "weitere Termine" badge if more dates exist
        if (futureDates.length > maxBadges) {
          if (badgeCount >= maxBadgesPerRow) {
            badgeX = leftColumnX;
            badgeY += 55;
          }
          
          const moreText = "weitere Termine";
          ctx.font = 'bold 24px Helvetica, Arial, sans-serif';
          const textWidth = ctx.measureText(moreText).width;
          const badgeWidth = textWidth + 24;
          const badgeHeight = 36;
          
          ctx.fillStyle = `rgba(${randomGlow.rgba}, 0.3)`;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 26, badgeWidth, badgeHeight, 18);
          ctx.fill();
          
          ctx.strokeStyle = `rgba(${randomGlow.rgba}, 0.6)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY - 26, badgeWidth, badgeHeight, 18);
          ctx.stroke();
          
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(moreText, badgeX + badgeWidth / 2, badgeY - 2);
          ctx.textAlign = 'left';
        }
        
        currentY = badgeY + 40;
      }

      // Copyright outside container at very bottom
      const copyrightY = canvas.height - 80;
      ctx.font = 'bold 36px Helvetica, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.fillText('momentmillionär', canvas.width / 2, copyrightY);
      
      ctx.font = '26px Helvetica, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('© Dein Weg zu unvergesslichen Momenten in Graz', canvas.width / 2, copyrightY + 40);
      ctx.textAlign = 'left';

      // Generate image URL
      console.log('🖼️ Converting canvas to image URL...');
      const imageUrl = canvas.toDataURL('image/png', 0.9);
      console.log('✅ Image generated successfully, size:', imageUrl.length, 'bytes');
      setShareImageUrl(imageUrl);
      
    } catch (error) {
      console.error('❌ Error generating share image:', error);
    } finally {
      setIsGenerating(false);
      console.log('🏁 Image generation process finished');
    }
  };

  const handleShare = async () => {
    if (!shareImageUrl) return;
    
    try {
      if (navigator.share && navigator.canShare) {
        // Convert data URL to blob
        const response = await fetch(shareImageUrl);
        const blob = await response.blob();
        
        if (navigator.canShare({ files: [new File([blob], 'event-share.png', { type: 'image/png' })] })) {
          await navigator.share({
            title: event.title,
            text: `${event.title} - ${event.date}`,
            files: [new File([blob], 'event-share.png', { type: 'image/png' })]
          });
          return;
        }
      }
      
      // Fallback: copy to clipboard
      await handleCopyLink();
    } catch (error) {
      console.log('Share failed, trying copy link:', error);
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    if (!shareImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${event.title.toLowerCase().replace(/\s+/g, '-')}-${format}.png`;
    link.href = shareImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    try {
      const eventUrl = `${window.location.origin}?event=${event.notionId}`;
      await navigator.clipboard.writeText(eventUrl);
      alert('Link kopiert!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md liquid-glass-strong border border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-bold text-white text-center">Event teilen</DialogTitle>
        <DialogDescription className="text-white/70 text-sm text-center mb-4">
          Erstelle ein schönes Bild für Social Media
        </DialogDescription>
        
        {/* Format Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFormat("post")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              format === "post" 
                ? "bg-purple-500/80 text-white border border-purple-400/40" 
                : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
            }`}
            style={{
              backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
            }}
          >
            📱 Post (4:5)
          </button>
          <button
            onClick={() => setFormat("story")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              format === "story" 
                ? "bg-orange-500/80 text-white border border-orange-400/40" 
                : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
            }`}
            style={{
              backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
            }}
          >
            📲 Story (9:16)
          </button>
        </div>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Simple Generate Button */}
          {!shareImageUrl && !isGenerating && (
            <div className="text-center py-4">
              <SimpleShareGenerator 
                event={event}
                format={format}
                onImageGenerated={setShareImageUrl}
              />
            </div>
          )}
          
          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="mt-4 text-white/80">Bild wird erstellt...</p>
            </div>
          )}
          
          {/* Share Image and Actions */}
          {shareImageUrl && (
            <div className="space-y-4">
              <img 
                src={shareImageUrl} 
                alt="Share preview" 
                className="w-full rounded-xl shadow-lg border border-white/20"
                style={{ aspectRatio: format === "post" ? '4/5' : '9/16' }}
              />
            </div>
          )}
        </div>
        
        {/* Fixed Action Buttons at Bottom */}
        {shareImageUrl && (
          <div className="sticky bottom-0 bg-transparent pt-4 mt-4 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 h-12 px-4 liquid-glass-button rounded-full text-white font-medium transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Herunterladen
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 h-12 px-4 bg-gradient-to-r from-purple-500/80 to-orange-500/80 hover:from-purple-600/90 hover:to-orange-600/90 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                style={{
                  backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                }}
              >
                <Share2 className="h-4 w-4" />
                Teilen
              </button>
              
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center h-12 w-12 liquid-glass-button rounded-full text-white transition-all duration-300 hover:scale-105"
              >
                <Link className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Hidden Canvas for Image Generation */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
          width={1080}
          height={1350}
        />
        
        {/* Debug info in development */}
        <div className="text-xs text-white/60 mt-2 p-2 bg-black/20 rounded">
          <div>Canvas: {canvasRef.current ? 'Ready' : 'Not ready'}</div>
          <div>Image: {shareImageUrl ? `Generated (${Math.round(shareImageUrl.length / 1024)}KB)` : 'None'}</div>
          <div>Loading: {isGenerating ? 'Yes' : 'No'}</div>
          <div>Format: {format}</div>
          <div>Event: {event.title}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}