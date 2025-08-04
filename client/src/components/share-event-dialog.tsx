import React, { useState } from "react";
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
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"post" | "story">("post");

  // Reset state when dialog opens or format changes
  React.useEffect(() => {
    if (isOpen) {
      setShareImageUrl(null);
    }
  }, [isOpen, format]);

  const handleDownload = () => {
    if (!shareImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `${event.title || 'event'}-share-${format}.png`;
    link.href = shareImageUrl;
    link.click();
  };

  const handleShare = async () => {
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
        console.log('Bild in Zwischenablage kopiert');
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}?event=${event.notionId}`;
    try {
      await navigator.clipboard.writeText(url);
      console.log('Link kopiert');
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-black/90 text-white border border-white/20 rounded-3xl overflow-hidden">
        <div className="p-6">
          <DialogTitle className="text-xl font-bold text-center mb-2">
            Event teilen
          </DialogTitle>
          <DialogDescription className="text-white/70 text-center mb-6">
            {event.title}
          </DialogDescription>

          {/* Format Selection */}
          <div className="flex gap-2 mb-6">
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
                  className="flex-1 flex items-center justify-center gap-2 h-12 px-4 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                  style={{
                    backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
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
                  className="flex items-center justify-center gap-2 h-12 px-4 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                  style={{
                    backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)'
                  }}
                >
                  <Link className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}