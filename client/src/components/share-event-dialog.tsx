import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Event {
  notionId: string
  title: string
  subtitle?: string
  description: string
  category: string
  location: string
  date: string
  time?: string
  price?: string
  website?: string
  organizer?: string
  imageUrl?: string
}

interface ShareEventDialogProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export function ShareEventDialog({ event, isOpen, onClose }: ShareEventDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const eventUrl = `${window.location.origin}/?event=${event.notionId}`

  const generateShareImage = async () => {
    if (!canvasRef.current) {
      console.log('Canvas ref not available')
      return
    }

    setIsGenerating(true)
    console.log('Starting image generation for:', event.title)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Canvas context not available')
      setIsGenerating(false)
      return
    }

    // Set canvas size for social media (4:5 ratio - 1080x1350 for Instagram)
    canvas.width = 1080
    canvas.height = 1350
    console.log('Canvas size set to:', canvas.width, 'x', canvas.height, '(4:5 ratio)')

    try {
      // Load and draw background image (blurred)
      if (event.imageUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = () => {
              console.log('Failed to load original image, trying without parameters')
              // Try without URL parameters
              const cleanUrl = event.imageUrl!.split('?')[0]
              const fallbackImg = new Image()
              fallbackImg.crossOrigin = 'anonymous'
              fallbackImg.onload = resolve
              fallbackImg.onerror = () => {
                console.log('Fallback also failed, using gradient background')
                resolve(null)
              }
              fallbackImg.src = cleanUrl
            }
            img.src = event.imageUrl
          })

          // Draw blurred background if image loaded with proper scaling
          if (img.complete && img.naturalHeight !== 0) {
            // Calculate scale to fill canvas without distortion (cover behavior)
            const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
            const scaledWidth = img.naturalWidth * scale
            const scaledHeight = img.naturalHeight * scale
            const offsetX = (canvas.width - scaledWidth) / 2
            const offsetY = (canvas.height - scaledHeight) / 2
            
            ctx.filter = 'blur(40px) saturate(140%) brightness(0.3)'
            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
            ctx.filter = 'none'
          } else {
            throw new Error('Image failed to load')
          }
        } catch (error) {
          console.log('Using gradient background due to image error:', error)
          // Fallback gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
          gradient.addColorStop(0, '#6366f1')
          gradient.addColorStop(1, '#f59e0b')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      } else {
        // Fallback gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#f59e0b')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Liquid glass container (adjusted for 4:5 ratio)
      const containerX = 80
      const containerY = 250
      const containerWidth = canvas.width - 160
      const containerHeight = 780

      // Glass morphism effect - minimal transparency with strong blur
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1

      // Rounded rectangle for glass container
      const radius = 40
      ctx.beginPath()
      ctx.roundRect(containerX, containerY, containerWidth, containerHeight, radius)
      ctx.fill()
      ctx.stroke()

      // Text styling matching EventCard modal
      ctx.fillStyle = 'white'
      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2

      let currentY = containerY + 80

      // Event title matching EventCard modal styling
      ctx.font = 'bold 56px Helvetica, Arial, sans-serif'
      // No stroke needed - shadow provides enough contrast
      const titleLines = wrapText(ctx, event.title, containerWidth - 80)
      titleLines.forEach(line => {
        ctx.fillText(line, containerX + 40, currentY)
        currentY += 70
      })

      currentY += 20

      // Subtitle
      if (event.subtitle) {
        ctx.font = 'italic 36px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const subtitleLines = wrapText(ctx, event.subtitle, containerWidth - 80)
        subtitleLines.forEach(line => {
          ctx.fillText(line, containerX + 40, currentY)
          currentY += 45
        })
        currentY += 20
      }

      // Category badge
      const categoryY = currentY
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.roundRect(containerX + 40, categoryY - 30, 200, 50, 25)
      ctx.fill()

      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Helvetica, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(event.category, containerX + 140, categoryY)
      
      currentY += 80
      ctx.textAlign = 'left'

      // Date and time matching EventCard modal
      ctx.font = 'bold 32px Helvetica, Arial, sans-serif'
      ctx.fillStyle = 'white'
      const eventDate = format(new Date(event.date), 'EEEE, dd. MMMM yyyy', { locale: de })
      ctx.fillText(`📅 ${eventDate}`, containerX + 40, currentY)
      currentY += 50

      if (event.time) {
        ctx.fillText(`🕐 ${event.time}`, containerX + 40, currentY)
        currentY += 50
      }

      // Location
      ctx.fillText(`📍 ${event.location}`, containerX + 40, currentY)
      currentY += 50

      // Organizer
      if (event.organizer) {
        ctx.fillText(`👤 ${event.organizer}`, containerX + 40, currentY)
        currentY += 50
      }

      // Price
      if (event.price) {
        const priceText = event.price === '0' ? '🆓 GRATIS' : `💰 ${event.price}€`
        ctx.fillText(priceText, containerX + 40, currentY)
        currentY += 50
      }

      // momentmillionär branding (positioned for 4:5 ratio)
      ctx.font = 'bold 28px Helvetica, Arial, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('momentmillionär', canvas.width / 2, containerY + containerHeight + 80)

      // Convert to blob and create URL
      console.log('Converting canvas to blob...')
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png', 0.9)
      })
      
      console.log('Blob created, size:', blob.size, 'bytes')
      const url = URL.createObjectURL(blob)
      setGeneratedImage(url)
      console.log('Share image generated successfully, URL:', url)
      
    } catch (error) {
      console.error('Error generating share image:', error)
      // Create fallback gradient image
      try {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#f59e0b')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add event text on fallback
        ctx.fillStyle = 'white'
        ctx.font = 'bold 48px Helvetica, Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.fillText(event.title, canvas.width / 2, canvas.height / 2)
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9)
        })
        
        const url = URL.createObjectURL(blob)
        setGeneratedImage(url)
        console.log('Fallback share image generated')
      } catch (fallbackError) {
        console.error('Fallback image generation failed:', fallbackError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + ' ' + word).width
      if (width < maxWidth) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  const downloadImage = () => {
    if (!generatedImage) return
    
    try {
      const link = document.createElement('a')
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}-share.png`
      link.href = generatedImage
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }
  }

  const shareImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const file = new File([blob], `${event.title.replace(/[^a-z0-9]/gi, '-')}-share.png`, { type: 'image/png' })

      // Check if native sharing is available
      if (navigator.share) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: event.title,
            text: `Schau dir dieses Event an: ${event.title}`,
            files: [file]
          })
          return
        } else {
          // Try sharing without files
          await navigator.share({
            title: event.title,
            text: `Schau dir dieses Event an: ${event.title}`,
            url: eventUrl
          })
          return
        }
      }

      // Fallback: try clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          alert('Bild in Zwischenablage kopiert!')
          return
        } catch (clipboardError) {
          console.log('Clipboard failed, trying download:', clipboardError)
        }
      }

      // Final fallback: download
      downloadImage()
      alert('Bild wird heruntergeladen, da Sharing nicht unterstützt wird.')
      
    } catch (error) {
      console.error('Error sharing image:', error)
      alert('Sharing fehlgeschlagen. Bild wird heruntergeladen.')
      downloadImage()
    }
  }

  const copyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  useEffect(() => {
    if (isOpen && !generatedImage && !isGenerating) {
      // Start generation with small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        console.log('Dialog opened, starting image generation...')
        generateShareImage()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, generatedImage, isGenerating])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/40 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/20 rounded-[2rem] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold drop-shadow-lg">
            Event teilen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Canvas for image generation (hidden) */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Preview */}
          {isGenerating ? (
            <div className="flex items-center justify-center h-64 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-white/20">
              <div className="text-white drop-shadow-lg">Bild wird generiert...</div>
            </div>
          ) : generatedImage ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-[2rem] p-4 border border-white/20">
              <img
                src={generatedImage}
                alt="Share preview"
                className="w-full max-w-md mx-auto rounded-[1.5rem] shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-white/20 space-y-2">
              <div className="text-white/70 drop-shadow-lg">Vorschau wird geladen...</div>
              <button 
                onClick={generateShareImage}
                className="text-sm text-white/50 hover:text-white/80 underline"
              >
                Erneut versuchen
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={downloadImage}
              disabled={!generatedImage || isGenerating}
              className="flex items-center justify-center px-6 py-3 bg-purple-500/80 hover:bg-purple-600/80 disabled:bg-white/20 disabled:text-white/50 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </button>

            <button
              onClick={shareImage}
              disabled={!generatedImage || isGenerating}
              className="flex items-center justify-center px-6 py-3 bg-orange-500/80 hover:bg-orange-600/80 disabled:bg-white/20 disabled:text-white/50 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </button>

            <button
              onClick={copyEventLink}
              className="flex items-center justify-center px-6 py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </button>
          </div>

          <div className="text-xs text-white/60 text-center drop-shadow-lg">
            Das generierte Bild kann auf Instagram, Facebook, WhatsApp und anderen Plattformen geteilt werden
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}