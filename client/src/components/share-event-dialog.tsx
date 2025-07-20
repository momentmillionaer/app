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
    console.log('🚀 CACHE BUST v2.0 - Starting FAVORITES STYLE image generation for:', event.title)
    console.log('🎨 Using NEW EventCard layout with purple border and liquid glass!')
    
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
    console.log('Container transparency: 4%, Background: no blur, Brightness: 0.5')

    try {
      // Always start with gradient background as fallback
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#6366f1')
      gradient.addColorStop(1, '#f59e0b')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      console.log('Gradient background applied')

      // Try to load and overlay the event image with better error handling
      if (event.imageUrl) {
        try {
          console.log('Loading event image:', event.imageUrl)
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          const imagePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.log('Image load timeout after 5 seconds, continuing with gradient')
              resolve(false)
            }, 5000)
            
            img.onload = () => {
              clearTimeout(timeout)
              console.log('Image loaded successfully, dimensions:', img.naturalWidth, 'x', img.naturalHeight)
              resolve(true)
            }
            
            img.onerror = (error: Event | string) => {
              clearTimeout(timeout)
              console.log('Image load error:', error, 'continuing with gradient')
              resolve(false)
            }
            
            // Set source to trigger loading
            img.src = event.imageUrl || ''
          })

          const imageLoaded = await imagePromise

          // Overlay the event image if loaded successfully
          if (imageLoaded && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            console.log('Overlaying event image on gradient background')
            
            // Calculate scale to fill canvas without distortion (cover behavior)
            const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
            const scaledWidth = img.naturalWidth * scale
            const scaledHeight = img.naturalHeight * scale
            const offsetX = (canvas.width - scaledWidth) / 2
            const offsetY = (canvas.height - scaledHeight) / 2
            
            // Apply image with much stronger blur and darker background
            ctx.save()
            ctx.globalAlpha = 0.5
            ctx.filter = 'brightness(0.2) saturate(120%) blur(8px)'
            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
            ctx.restore()
            console.log('Event image successfully overlaid')
          } else {
            console.log('Image not usable, keeping gradient background')
          }
        } catch (imageError) {
          console.log('Image processing error:', imageError, 'keeping gradient background')
        }
      } else {
        console.log('No event image URL provided, using gradient background')
      }

      // Favorites EventCard-style layout (4:5 ratio - 1080x1350)
      console.log('🎨 Applying NEW Favorites EventCard styling!')
      const cardPadding = 48
      const cardX = cardPadding
      const cardY = 100
      const cardWidth = canvas.width - (cardPadding * 2)
      const cardHeight = canvas.height - cardY - 100
      const cardRadius = 32 // rounded-[2rem] like favorites cards

      // Favorites EventCard liquid glass background - exact match to favorites view
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      ctx.fill()
      console.log('✅ Liquid glass background applied')

      // Favorites EventCard border with purple accent
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)' // Purple border like favorites
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      ctx.stroke()
      console.log('✅ Purple border applied')

      // Inner border for enhanced glass effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4, cardRadius - 2)
      ctx.stroke()

      // Event image area at top like favorites cards
      const imageHeight = event.imageUrl ? 320 : 0
      let contentStartY = cardY + 48

      if (event.imageUrl && imageHeight > 0) {
        // Create clipping path for rounded image exactly like favorites cards
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(cardX + 24, cardY + 24, cardWidth - 48, imageHeight, 20)
        ctx.clip()
        
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = event.imageUrl || ''
          })
          
          if (img.complete && img.naturalWidth > 0) {
            // Scale to cover the image area exactly like favorites cards
            const scale = Math.max((cardWidth - 48) / img.naturalWidth, imageHeight / img.naturalHeight)
            const scaledWidth = img.naturalWidth * scale
            const scaledHeight = img.naturalHeight * scale
            const imgX = cardX + 24 + ((cardWidth - 48) - scaledWidth) / 2
            const imgY = cardY + 24 + (imageHeight - scaledHeight) / 2
            
            ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight)
          }
        } catch (error) {
          console.log('Image loading failed, continuing without image')
        }
        
        ctx.restore()
        contentStartY = cardY + imageHeight + 72
      }

      // Content area with padding like favorites cards
      let currentY = contentStartY

      // Category badge at top like favorites cards
      if (event.category) {
        ctx.font = 'bold 28px Helvetica, Arial, sans-serif'
        const categoryText = event.category
        const textWidth = ctx.measureText(categoryText).width
        const badgeWidth = textWidth + 40
        const badgeHeight = 44
        
        // Badge background with rounded corners
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.beginPath()
        ctx.roundRect(cardX + 48, currentY - 32, badgeWidth, badgeHeight, 22)
        ctx.fill()
        
        // Badge text
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.fillText(categoryText, cardX + 48 + badgeWidth / 2, currentY)
        ctx.textAlign = 'left'
        
        currentY += 60
      }

      // Event title - larger and bold like favorites cards
      ctx.fillStyle = 'white'
      ctx.font = 'bold 56px Helvetica, Arial, sans-serif'
      const titleLines = wrapText(ctx, event.title, cardWidth - 96)
      titleLines.forEach(line => {
        ctx.fillText(line, cardX + 48, currentY)
        currentY += 70
      })

      currentY += 20

      // Subtitle in italic
      if (event.subtitle) {
        ctx.font = 'italic 36px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const subtitleLines = wrapText(ctx, event.subtitle, cardWidth - 96)
        subtitleLines.forEach(line => {
          ctx.fillText(line, cardX + 48, currentY)
          currentY += 45
        })
        currentY += 20
      }

      // Event details with icons - spaced like favorites cards
      ctx.font = 'bold 34px Helvetica, Arial, sans-serif'
      ctx.fillStyle = 'white'

      // Date with calendar icon
      const eventDate = format(new Date(event.date + 'T12:00:00+02:00'), 'dd. MMMM yyyy', { locale: de })
      ctx.fillText(`📅  ${eventDate}`, cardX + 48, currentY)
      currentY += 55

      // Time with clock icon
      if (event.time) {
        ctx.fillText(`🕐  ${event.time} Uhr`, cardX + 48, currentY)
        currentY += 55
      }

      // Location with map pin
      ctx.fillText(`📍  ${event.location}`, cardX + 48, currentY)
      currentY += 55

      // Price in bottom right like favorites cards
      if (event.price) {
        ctx.font = 'bold 48px Helvetica, Arial, sans-serif'
        ctx.textAlign = 'right'
        const priceText = event.price === '0' ? 'GRATIS' : `€${event.price}`
        ctx.fillText(priceText, cardX + cardWidth - 48, cardY + cardHeight - 60)
        ctx.textAlign = 'left'
      }

      // momentmillionär branding (positioned for 4:5 ratio)
      ctx.font = 'bold 28px Connihof, serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('© momentmillionär', canvas.width / 2, cardY + cardHeight + 80)
      console.log('✅ NEW Favorites EventCard styling applied successfully!')

      // Convert to blob and create URL with forced cache break
      const timestamp = Date.now()
      console.log('Converting canvas to blob...')
      console.log('Generated at:', new Date().toLocaleTimeString(), 'EVENT IMAGES with reliable fallback v', timestamp)
      
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
      const url = URL.createObjectURL(blob) + '?v=' + timestamp
      setGeneratedImage(url)
      console.log('🎉 NEW FAVORITES STYLE share image generated successfully! URL:', url)
      
    } catch (error) {
      console.error('Error generating share image:', error)
      // Force fallback with complete event content
      try {
        // Clear canvas and start fresh
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#f59e0b')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Container for fallback
        const containerX = 80
        const containerY = 250
        const containerWidth = canvas.width - 160
        const containerHeight = 780
        const radius = 40
        
        // Prominent liquid glass container (fallback version)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)' // Same as liquid-glass-strong
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)' // Same as liquid-glass-strong border
        ctx.lineWidth = 1 // Normal border thickness
        ctx.beginPath()
        ctx.roundRect(containerX, containerY, containerWidth, containerHeight, radius)
        ctx.fill()
        ctx.stroke()
        
        // Add prominent backdrop filter effect simulation
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath()
          ctx.roundRect(containerX + i, containerY + i, containerWidth - 2*i, containerHeight - 2*i, radius - i)
          ctx.fill()
        }
        
        // Text styling
        ctx.fillStyle = 'white'
        ctx.textAlign = 'left'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        let currentY = containerY + 80
        
        // Event title
        ctx.font = 'bold 56px Helvetica, Arial, sans-serif'
        const titleLines = wrapText(ctx, event.title, containerWidth - 80)
        titleLines.forEach(line => {
          ctx.fillText(line, containerX + 40, currentY)
          currentY += 70
        })
        
        currentY += 20
        
        // Add all event details
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        
        if (event.subtitle) {
          ctx.font = 'italic 36px Helvetica, Arial, sans-serif'
          const subtitleLines = wrapText(ctx, event.subtitle, containerWidth - 80)
          subtitleLines.forEach(line => {
            ctx.fillText(line, containerX + 40, currentY)
            currentY += 45
          })
          currentY += 20
        }
        
        // Date and time
        ctx.font = '32px Helvetica, Arial, sans-serif'
        const eventDate = new Date(event.date).toLocaleDateString('de-AT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        ctx.fillText(`📅 ${eventDate}`, containerX + 40, currentY)
        currentY += 50
        
        if (event.time) {
          ctx.fillText(`🕐 ${event.time}`, containerX + 40, currentY)
          currentY += 50
        }
        
        // Location
        ctx.fillText(`📍 ${event.location}`, containerX + 40, currentY)
        currentY += 50
        
        // Price
        if (event.price) {
          const priceText = event.price === '0' ? '🆓 GRATIS' : `💰 ${event.price}€`
          ctx.fillText(priceText, containerX + 40, currentY)
          currentY += 50
        }
        
        // Branding
        ctx.font = 'bold 28px Connihof, serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.textAlign = 'center'
        ctx.fillText('© momentmillionär', canvas.width / 2, containerY + containerHeight + 80)
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9)
        })
        
        const url = URL.createObjectURL(blob)
        setGeneratedImage(url)
        console.log('Complete fallback share image generated with all content')
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
              className="liquid-glass-button flex items-center justify-center px-6 py-3 disabled:bg-white/10 disabled:text-white/50 text-white rounded-full border border-white/20 transition-all duration-300 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-purple-500 hover:to-orange-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </button>

            <button
              onClick={shareImage}
              disabled={!generatedImage || isGenerating}
              className="liquid-glass-button flex items-center justify-center px-6 py-3 disabled:bg-white/10 disabled:text-white/50 text-white rounded-full border border-white/20 transition-all duration-300 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-purple-500 hover:to-orange-500"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </button>

            <button
              onClick={copyEventLink}
              className="liquid-glass-button flex items-center justify-center px-6 py-3 text-white rounded-full border border-white/20 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-orange-500"
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