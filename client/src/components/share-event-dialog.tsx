import { useState, useRef } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share2, Download, Copy, Link } from "lucide-react";
import { Event } from "@shared/schema";

interface ShareEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareEventDialog({ event, isOpen, onClose }: ShareEventDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size for Instagram format (4:5 ratio - 1080x1350)
      canvas.width = 1080;
      canvas.height = 1350;
      
      // Random classical paintings
      const paintings = [
        'Unbenannt-1-02_1752488253396.png',
        'Design ohne Titel-5_1752691367029.png'
      ];
      const randomPainting = paintings[Math.floor(Math.random() * paintings.length)];
      
      // Random glow colors
      const glowColors = [
        { name: 'Purple', color: '#9333ea', rgba: '147, 51, 234' },
        { name: 'Orange', color: '#f59e0b', rgba: '245, 158, 11' },
        { name: 'Blue', color: '#3b82f6', rgba: '59, 130, 246' },
        { name: 'Lime', color: '#84cc16', rgba: '132, 204, 22' },
        { name: 'Pink', color: '#ec4899', rgba: '236, 72, 153' },
        { name: 'Teal', color: '#14b8a6', rgba: '20, 184, 166' }
      ];
      const randomGlow = glowColors[Math.floor(Math.random() * glowColors.length)];
      
      // Apply app background
      await new Promise<boolean>((resolve) => {
        const backgroundImg = new Image();
        backgroundImg.crossOrigin = 'anonymous';
        
        backgroundImg.onload = () => {
          console.log('App background loaded successfully');
          const scale = Math.max(canvas.width / backgroundImg.naturalWidth, canvas.height / backgroundImg.naturalHeight);
          const scaledWidth = backgroundImg.naturalWidth * scale;
          const scaledHeight = backgroundImg.naturalHeight * scale;
          const offsetX = (canvas.width - scaledWidth) / 2;
          const offsetY = (canvas.height - scaledHeight) / 2;
          
          ctx.drawImage(backgroundImg, offsetX, offsetY, scaledWidth, scaledHeight);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          resolve(true);
        };
        
        backgroundImg.onerror = () => {
          console.log('Background failed, using gradient');
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#f59e0b');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          resolve(false);
        };
        
        backgroundImg.src = `/attached_assets/${randomPainting}`;
      });

      // Card layout
      const cardPadding = 48;
      const cardX = cardPadding;
      const cardY = 100;
      const cardWidth = canvas.width - (cardPadding * 2);
      const cardHeight = canvas.height - cardY - 100;
      const cardRadius = 32;

      // Liquid glass background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
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

      // Event image
      const imageHeight = event.imageUrl ? 420 : 0;
      let contentStartY = cardY + 48;

      if (event.imageUrl && imageHeight > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX + 24, cardY + 24, cardWidth - 48, imageHeight, 20);
        ctx.clip();
        
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = event.imageUrl || '';
          });
          
          if (img.complete && img.naturalWidth > 0) {
            const scale = Math.max((cardWidth - 48) / img.naturalWidth, imageHeight / img.naturalHeight);
            const scaledWidth = img.naturalWidth * scale;
            const scaledHeight = img.naturalHeight * scale;
            const imgX = cardX + 24 + ((cardWidth - 48) - scaledWidth) / 2;
            const imgY = cardY + 24 + (imageHeight - scaledHeight) / 2;
            
            ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
            
            // Gradient overlay
            const gradient = ctx.createLinearGradient(0, cardY + 24, 0, cardY + 24 + imageHeight);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            ctx.fillStyle = gradient;
            ctx.fillRect(cardX + 24, cardY + 24, cardWidth - 48, imageHeight);
          }
        } catch (error) {
          console.log('Image loading failed:', error);
        }
        
        ctx.restore();
        contentStartY = cardY + imageHeight + 80;
      }

      // Content
      let currentY = contentStartY;

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
        const dateText = `📅 ${format(eventDate, "EEEE, dd. MMMM yyyy", { locale: de })}`;
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

      // Generate image URL
      const imageUrl = canvas.toDataURL('image/png', 0.9);
      setShareImageUrl(imageUrl);
      
    } catch (error) {
      console.error('Error generating share image:', error);
    } finally {
      setIsGenerating(false);
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
    link.download = `${event.title.toLowerCase().replace(/\s+/g, '-')}-share.png`;
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
      <DialogContent className="max-w-md liquid-glass-strong border border-white/20">
        <DialogTitle className="text-xl font-bold text-white text-center">Event teilen</DialogTitle>
        <DialogDescription className="text-white/70 text-sm text-center mb-4">
          Erstelle ein schönes Bild für Social Media
        </DialogDescription>
        <div className="space-y-6">
          
          {!shareImageUrl && !isGenerating && (
            <div className="text-center">
              <Button 
                onClick={generateShareImage} 
                className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white px-8 py-3 rounded-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bild erstellen
              </Button>
            </div>
          )}
          
          {shareImageUrl && (
            <div className="space-y-4">
              <img 
                src={shareImageUrl} 
                alt="Share preview" 
                className="w-full rounded-lg shadow-lg"
                style={{ aspectRatio: '4/5' }}
              />
              
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-brand-purple to-brand-orange">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
                
                <Button onClick={handleCopyLink} variant="outline">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Bild wird erstellt...</p>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}