import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Event } from "@shared/schema";
import { AdvancedShareGenerator } from './advanced-share-generator';
import { Download, Share2, Link, Image, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

type ShareMode = 'options' | 'generate-image';

export function ShareEventDialog({ event, isOpen, onClose }: ShareEventDialogProps) {
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"post" | "story">("post");
  const [shareMode, setShareMode] = useState<ShareMode>('options');
  const { toast } = useToast();

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setShareImageUrl(null);
      setShareMode('options');
    }
  }, [isOpen]);

  const handleDownload = () => {
    if (!shareImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${event.title || 'event'}-share-${format}.png`;
    link.href = shareImageUrl;
    link.click();
  };

  const handleShareImage = async () => {
    if (!shareImageUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: event.title || 'Event',
          text: `Schau dir dieses Event an: ${event.title}`,
          files: [new File([blob], 'share.png', { type: 'image/png' })]
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        toast({
          title: "Bild kopiert",
          description: "Das Bild wurde in die Zwischenablage kopiert."
        });
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      toast({
        title: "Fehler",
        description: "Das Bild konnte nicht geteilt werden.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}?event=${event.notionId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert",
        description: "Der Event-Link wurde in die Zwischenablage kopiert."
      });
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
      toast({
        title: "Fehler",
        description: "Der Link konnte nicht kopiert werden.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    const url = `${window.location.origin}?event=${event.notionId}`;
    const shareText = `Schau dir dieses Event an: ${event.title}\n\n${url}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title || 'Event',
          text: shareText
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Text kopiert",
          description: "Der Event-Text wurde in die Zwischenablage kopiert."
        });
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      toast({
        title: "Fehler",
        description: "Der Text konnte nicht geteilt werden.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateImage = () => {
    setShareMode('generate-image');
  };

  const handleBackToOptions = () => {
    setShareMode('options');
    setShareImageUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto text-white border border-white/10 rounded-[2rem] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(60px) saturate(140%) brightness(1.1)',
          WebkitBackdropFilter: 'blur(60px) saturate(140%) brightness(1.1)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        <div className="p-6">
          <DialogTitle className="text-xl font-bold text-center mb-2 text-white drop-shadow-sm">
            Event teilen
          </DialogTitle>
          <DialogDescription className="text-white/80 text-center mb-6 drop-shadow-sm">
            {event.title}
          </DialogDescription>

          {shareMode === 'options' && (
            <div className="space-y-4">
              {/* Share Options */}
              <div className="space-y-3">
                {/* Generate Image Button */}
                <button
                  onClick={handleGenerateImage}
                  className="w-full flex items-center gap-4 p-4 bg-white/08 hover:bg-white/15 rounded-[1.5rem] text-white transition-all duration-300 hover:scale-[1.02] border border-white/10"
                  style={{
                    backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full">
                    <Image className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white drop-shadow-sm">Bild generieren</h3>
                    <p className="text-sm text-white/70 drop-shadow-sm">Erstelle ein schönes Sharebild</p>
                  </div>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-4 p-4 bg-white/08 hover:bg-white/15 rounded-[1.5rem] text-white transition-all duration-300 hover:scale-[1.02] border border-white/10"
                  style={{
                    backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full">
                    <Link className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white drop-shadow-sm">Link kopieren</h3>
                    <p className="text-sm text-white/70 drop-shadow-sm">Direktlink zum Event kopieren</p>
                  </div>
                </button>

                {/* Send Message Button */}
                <button
                  onClick={handleSendMessage}
                  className="w-full flex items-center gap-4 p-4 bg-white/08 hover:bg-white/15 rounded-[1.5rem] text-white transition-all duration-300 hover:scale-[1.02] border border-white/10"
                  style={{
                    backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white drop-shadow-sm">Per Nachricht verschicken</h3>
                    <p className="text-sm text-white/70 drop-shadow-sm">Text-Nachricht mit Event-Details</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {shareMode === 'generate-image' && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToOptions}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                ← Zurück zu den Optionen
              </button>

              {/* Format Selection */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFormat("post")}
                  className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    format === "post" 
                      ? "bg-white/15 text-white border-white/30 shadow-lg" 
                      : "bg-white/05 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
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
                  className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    format === "story" 
                      ? "bg-white/15 text-white border-white/30 shadow-lg" 
                      : "bg-white/05 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
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
                {/* Image Generator */}
                {!shareImageUrl && (
                  <div className="text-center py-4">
                    <SimpleShareGenerator 
                      event={event}
                      format={format}
                      onImageGenerated={setShareImageUrl}
                    />
                  </div>
                )}
                
                {/* Generated Image Preview */}
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
              
              {/* Action Buttons */}
              {shareImageUrl && (
                <div className="sticky bottom-0 bg-transparent pt-4 mt-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 h-12 px-4 bg-white/08 hover:bg-white/15 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/10"
                      style={{
                        backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                        WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    
                    <button
                      onClick={handleShareImage}
                      className="flex-1 flex items-center justify-center gap-2 h-12 px-4 bg-white/08 hover:bg-gradient-to-r hover:from-purple-500/60 hover:to-orange-500/60 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/10"
                      style={{
                        backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                        WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Teilen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple share generator component that doesn't return void
function SimpleShareGenerator({ 
  event, 
  format, 
  onImageGenerated 
}: {
  event: Event;
  format: "post" | "story";
  onImageGenerated: (url: string) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // Create canvas for image generation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions based on format
      if (format === "post") {
        canvas.width = 1080;
        canvas.height = 1350; // 4:5 ratio
      } else {
        canvas.width = 1080;
        canvas.height = 1920; // 9:16 ratio
      }

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#f59e0b');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add glass overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text styles
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      // Add title
      const titleFontSize = format === "post" ? 48 : 64;
      ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      
      // Word wrap for title
      const words = event.title.split(' ');
      const maxWidth = canvas.width - 120;
      let line = '';
      let y = format === "post" ? 300 : 400;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), canvas.width / 2, y);
          line = words[n] + ' ';
          y += titleFontSize + 10;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), canvas.width / 2, y);

      // Add date and location
      const detailsFontSize = format === "post" ? 32 : 40;
      ctx.font = `${detailsFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      
      y += 80;
      
      if (event.date) {
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('de-AT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        ctx.fillText(`📅 ${dateStr}`, canvas.width / 2, y);
        y += detailsFontSize + 20;
      }

      if (event.location) {
        ctx.fillText(`📍 ${event.location}`, canvas.width / 2, y);
        y += detailsFontSize + 20;
      }

      // Add branding
      ctx.font = `bold ${format === "post" ? 28 : 36}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      ctx.fillText('Momentmillionär', canvas.width / 2, canvas.height - 100);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png');
      onImageGenerated(dataURL);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating}
      className="w-full flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-purple-500/60 to-orange-500/60 hover:from-purple-600/60 hover:to-orange-600/60 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
      }}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Generiere Bild...
        </>
      ) : (
        <>
          <Image className="h-4 w-4" />
          Bild generieren
        </>
      )}
    </button>
  );
}