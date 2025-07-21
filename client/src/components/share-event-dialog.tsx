import React, { useState, useRef } from "react";
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

  // Auto-generate image when dialog opens and reset on close
  React.useEffect(() => {
    if (isOpen) {
      // Reset state and generate new image every time dialog opens
      setShareImageUrl(null);
      setIsGenerating(false);
      setTimeout(() => {
        generateShareImage();
      }, 100); // Small delay to ensure state is reset
    }
  }, [isOpen]);

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
      
      // Classical paintings from attached assets - using correct file names
      const paintings = [
        '/attached_assets/208195fgsdl_1753089340156.jpg', // Woman knitting by the coast
        '/attached_assets/222401fgsdl_1753089340158.jpg', // Evening dinner scene with candles
        '/attached_assets/226718fgsdl_1753089340158.jpg', // Oriental marketplace scene
        '/attached_assets/228439fgsdl_1753089340159.jpg', // Classical feast in colonnade
        '/attached_assets/244783fgsdl_1753089340159.jpg', // Garden scene with classical figures
        '/attached_assets/245018fgsdl_1753089340159.jpg', // Rococo garden party
        '/attached_assets/509932ldsdl_1753089340159.jpg', // River landscape
        '/attached_assets/540710ldsdl_1753089340159.jpg'  // Norwegian fjord scene
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
      
      // Apply app background
      await new Promise<boolean>((resolve) => {
        const backgroundImg = new Image();
        backgroundImg.crossOrigin = 'anonymous';
        
        backgroundImg.onload = () => {
          console.log('Classical painting loaded successfully:', randomPainting);
          
          // Cover behavior: scale to fill entire canvas without distortion
          const scaleX = canvas.width / backgroundImg.naturalWidth;
          const scaleY = canvas.height / backgroundImg.naturalHeight;
          const scale = Math.max(scaleX, scaleY);
          
          const scaledWidth = backgroundImg.naturalWidth * scale;
          const scaledHeight = backgroundImg.naturalHeight * scale;
          
          // Center the image
          const offsetX = (canvas.width - scaledWidth) / 2;
          const offsetY = (canvas.height - scaledHeight) / 2;
          
          // Draw the background image
          ctx.drawImage(backgroundImg, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Add a subtle dark overlay to ensure text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          resolve(true);
        };
        
        backgroundImg.onerror = () => {
          console.log('Background failed for:', randomPainting, 'trying alternative paths...');
          
          // Try alternative paths
          const fileName = randomPainting.split('/').pop();
          const alternativePaths = [
            `/${fileName}`,
            `/assets/${fileName}`,
            `./attached_assets/${fileName}`,
            randomPainting.replace('/attached_assets/', '/'),
            randomPainting.replace('/attached_assets/', '/assets/')
          ];
          
          let pathIndex = 0;
          const tryNextPath = () => {
            if (pathIndex < alternativePaths.length) {
              console.log('Trying path:', alternativePaths[pathIndex]);
              const testImg = new Image();
              testImg.crossOrigin = 'anonymous';
              testImg.onload = () => {
                console.log('Successfully loaded from:', alternativePaths[pathIndex]);
                // Use the same scaling logic
                const scaleX = canvas.width / testImg.naturalWidth;
                const scaleY = canvas.height / testImg.naturalHeight;
                const scale = Math.max(scaleX, scaleY);
                
                const scaledWidth = testImg.naturalWidth * scale;
                const scaledHeight = testImg.naturalHeight * scale;
                const offsetX = (canvas.width - scaledWidth) / 2;
                const offsetY = (canvas.height - scaledHeight) / 2;
                
                ctx.drawImage(testImg, offsetX, offsetY, scaledWidth, scaledHeight);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                resolve(true);
              };
              testImg.onerror = () => {
                pathIndex++;
                tryNextPath();
              };
              testImg.src = alternativePaths[pathIndex];
            } else {
              // All paths failed, use gradient fallback
              console.log('All paths failed, using gradient fallback');
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, '#6366f1');
              gradient.addColorStop(1, '#f59e0b');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              resolve(false);
            }
          };
          
          tryNextPath();
        };
        
        // Load the selected classical painting
        console.log('Attempting to load:', randomPainting);
        backgroundImg.src = randomPainting;
      });

      // Card layout - make room for copyright at bottom
      const cardPadding = 48;
      const cardX = cardPadding;
      const cardY = 100;
      const cardWidth = canvas.width - (cardPadding * 2);
      const cardHeight = canvas.height - cardY - 160; // More space for copyright
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

      // Price (if free)
      if (event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0) {
        ctx.fillStyle = 'rgba(208, 254, 29, 1)';
        ctx.font = 'bold 36px Helvetica, Arial, sans-serif';
        ctx.fillText(`🆓 KOSTENLOS`, leftColumnX, currentY);
        ctx.font = '32px Helvetica, Arial, sans-serif';
        currentY += 50;
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

      // Future dates from multi-date events  
      const futureDates: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parse Termine: format for additional dates from description
      if (event.description && event.description.includes('Termine:')) {
        const dateMatches = event.description.match(/(\d{2}\.\d{2}\.\d{4})/g);
        if (dateMatches) {
          dateMatches.forEach(dateStr => {
            const [day, month, year] = dateStr.split('.');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (date > today) {
              futureDates.push(format(date, "dd.MM", { locale: de }));
            }
          });
        }
      }
      
      // Also check if we have endDate or multiple dates
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        const startDate = new Date(event.date);
        if (endDate > startDate && endDate > today) {
          futureDates.push(format(endDate, "dd.MM", { locale: de }));
        }
      }
      
      // Add some example future dates if this is a recurring event (detect by title)
      const isRecurring = event.title.toLowerCase().includes('rundgang') || 
                         event.title.toLowerCase().includes('tour') ||
                         event.title.toLowerCase().includes('kurs') ||
                         event.description?.toLowerCase().includes('wöchentlich') ||
                         event.description?.toLowerCase().includes('täglich');
                         
      if (isRecurring && futureDates.length === 0) {
        // Add next 3-5 future dates for recurring events
        const eventDate = new Date(event.date);
        for (let i = 1; i <= 4; i++) {
          const nextDate = new Date(eventDate);
          nextDate.setDate(nextDate.getDate() + (i * 7)); // Weekly recurrence
          if (nextDate > today) {
            futureDates.push(format(nextDate, "dd.MM", { locale: de }));
          }
        }
      }

      // Additional dates as badges
      if (futureDates.length > 0) {
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
          
          const moreText = `+${futureDates.length - maxBadges}`;
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
                style={{ aspectRatio: '4/5' }}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20"
                >
                  <Download className="h-4 w-4" />
                  Herunterladen
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  Teilen
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 w-12"
                >
                  <Link className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}