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
    if (!canvasRef.current) return

    setIsGenerating(true)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for social media (1080x1080 for Instagram)
    canvas.width = 1080
    canvas.height = 1080

    try {
      // Load and draw background image (blurred)
      if (event.imageUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = event.imageUrl
        })

        // Draw blurred background
        ctx.filter = 'blur(20px) brightness(0.4)'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.filter = 'none'
      } else {
        // Fallback gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#f59e0b')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Liquid glass container
      const containerX = 80
      const containerY = 200
      const containerWidth = canvas.width - 160
      const containerHeight = 680

      // Glass morphism effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2

      // Rounded rectangle for glass container
      const radius = 40
      ctx.beginPath()
      ctx.roundRect(containerX, containerY, containerWidth, containerHeight, radius)
      ctx.fill()
      ctx.stroke()

      // Text styling
      ctx.fillStyle = 'white'
      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
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

      // Date and time
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

      // momentmillionär branding
      ctx.font = 'bold 28px Helvetica, Arial, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('momentmillionär', canvas.width / 2, containerY + containerHeight + 60)

      // Convert to blob and create URL
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0)
      })
      
      const url = URL.createObjectURL(blob)
      setGeneratedImage(url)
      
    } catch (error) {
      console.error('Error generating share image:', error)
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
    
    const link = document.createElement('a')
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}-share.png`
    link.href = generatedImage
    link.click()
  }

  const shareImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const file = new File([blob], `${event.title}-share.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: event.title,
          text: `Schau dir dieses Event an: ${event.title}`,
          files: [file]
        })
      } else {
        // Fallback: copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('Bild in Zwischenablage kopiert!')
      }
    } catch (error) {
      console.error('Error sharing image:', error)
      alert('Sharing nicht verfügbar. Bild wurde heruntergeladen.')
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
    if (isOpen && !generatedImage) {
      generateShareImage()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">
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
            <div className="flex items-center justify-center h-64 bg-white/5 rounded-2xl">
              <div className="text-white">Bild wird generiert...</div>
            </div>
          ) : generatedImage ? (
            <div className="bg-white/5 rounded-2xl p-4">
              <img
                src={generatedImage}
                alt="Share preview"
                className="w-full max-w-md mx-auto rounded-xl shadow-lg"
              />
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={downloadImage}
              disabled={!generatedImage}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </Button>

            <Button
              onClick={shareImage}
              disabled={!generatedImage}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </Button>

            <Button
              onClick={copyEventLink}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </Button>
          </div>

          <div className="text-xs text-white/60 text-center">
            Das generierte Bild kann auf Instagram, Facebook, WhatsApp und anderen Plattformen geteilt werden
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}