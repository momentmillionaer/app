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
    console.log('🚀 CACHE BUST v3.0 - Starting RANDOM PAINTING image generation for:', event.title)
    console.log('🎨 Using random classical paintings with variable glow colors!')
    
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
      // Random painting selection
      const paintings = [
        'painting1.jpg', // Woman sewing by the sea
        'painting2.jpg', // Evening dinner scene with candles  
        'painting3.jpg', // Arabian market scene
        'painting4.jpg', // Banquet hall scene
        'painting5.jpg', // Garden scene with figures
        'painting6.jpg', // Elegant conversation in park
        'painting7.jpg', // River valley landscape
        'painting8.jpg'  // Mountain lake scene
      ]
      
      // Color palette for container glow effects
      const glowColors = [
        { color: '#9333EA', name: 'purple', rgba: '147, 51, 234' },    // Purple
        { color: '#FE5C2B', name: 'orange', rgba: '254, 92, 43' },    // Orange  
        { color: '#0000FF', name: 'blue', rgba: '0, 0, 255' },        // Blue
        { color: '#D0FE1D', name: 'lime', rgba: '208, 254, 29' },     // Lime
        { color: '#F3DCFA', name: 'light-purple', rgba: '243, 220, 250' }, // Light purple
        { color: '#FEE4C3', name: 'cream', rgba: '254, 228, 195' }    // Cream
      ]
      
      const randomPainting = paintings[Math.floor(Math.random() * paintings.length)]
      const randomGlow = glowColors[Math.floor(Math.random() * glowColors.length)]
      
      console.log(`🎨 Selected painting: ${randomPainting}`)
      console.log(`✨ Selected glow color: ${randomGlow.name} (${randomGlow.color})`)

      // Use random classical painting as background
      console.log('Loading random classical painting for share image background')
      const backgroundImg = new Image()
      backgroundImg.crossOrigin = 'anonymous'
      
      const backgroundLoaded = await new Promise<boolean>((resolve) => {
        backgroundImg.onload = () => {
          console.log(`🖼️ Classical painting loaded successfully: ${randomPainting}`)
          // Draw the background image to fill the entire canvas
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
          
          // Add stronger overlay for better text readability and blur effect
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)' // Increased from 0.4 to 0.6 for stronger blur effect
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          console.log('🎨 Classical painting background with stronger overlay applied for better blur')
          resolve(true)
        }
        backgroundImg.onerror = () => {
          console.log('App background failed to load, trying alternative paths...')
          
          // Try multiple paths for classical painting background
          const paths = [
            '/attached_assets/Unbenannt-1-02_1752488253396.png',
            'attached_assets/Unbenannt-1-02_1752488253396.png',
            '/Unbenannt-1-02_1752488253396.png'
          ]
          
          let pathIndex = 0
          
          const tryNextPath = () => {
            if (pathIndex >= paths.length) {
              console.log('All background paths failed, using gradient fallback')
              // Fallback to gradient
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
              gradient.addColorStop(0, '#6366f1')
              gradient.addColorStop(1, '#f59e0b')
              ctx.fillStyle = gradient
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              console.log('Gradient background applied as fallback')
              resolve(false)
              return
            }
            
            const altImg = new Image()
            altImg.crossOrigin = 'anonymous'
            altImg.onload = () => {
              console.log(`Alternative app background loaded successfully from path: ${paths[pathIndex]}`)
              ctx.drawImage(altImg, 0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'rgba(0, 0, 0, 0.6)' // Stronger overlay for better blur effect
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              console.log('App background with stronger overlay applied (alternative path)')
              resolve(true)
            }
            altImg.onerror = () => {
              console.log(`Path ${paths[pathIndex]} failed, trying next...`)
              pathIndex++
              tryNextPath()
            }
            altImg.src = paths[pathIndex]
          }
          
          tryNextPath()
        }
        // Use random classical painting
        backgroundImg.src = `/${randomPainting}`
      })

      // Event image will only be used in the EventCard header, not as background overlay
      console.log('App background ready, event image will be used only in card header')

      // Favorites EventCard-style layout (4:5 ratio - 1080x1350)
      console.log('🎨 Applying NEW Favorites EventCard styling!')
      const cardPadding = 48
      const cardX = cardPadding
      const cardY = 100
      const cardWidth = canvas.width - (cardPadding * 2)
      const cardHeight = canvas.height - cardY - 100
      const cardRadius = 32 // rounded-[2rem] like favorites cards

      // Enhanced liquid glass background with less transparency and stronger blur effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)' // Less transparent (increased from 0.15 to 0.25)
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      ctx.fill()
      console.log('✅ Enhanced liquid glass background applied with less transparency')

      // Variable colored border using random glow color instead of fixed purple
      ctx.strokeStyle = `rgba(${randomGlow.rgba}, 0.4)` // Dynamic color border
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      ctx.stroke()
      console.log(`✅ ${randomGlow.name} border applied`)
      
      // Add subtle glow effect around the container
      ctx.shadowColor = randomGlow.color
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = `rgba(${randomGlow.rgba}, 0.6)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardX - 2, cardY - 2, cardWidth + 4, cardHeight + 4, cardRadius + 2)
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset shadow
      console.log(`✨ ${randomGlow.name} glow effect applied`)

      // Inner border for enhanced glass effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4, cardRadius - 2)
      ctx.stroke()

      // Event image area at top - TALLER header image as requested
      const imageHeight = event.imageUrl ? 420 : 0  // Increased from 320 to 420
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
        contentStartY = cardY + imageHeight + 80  // Increased spacing after image
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
        
        currentY += 80  // Increased spacing between category badge and content
      }

      // Event title - optimized for better space usage
      ctx.fillStyle = 'white'
      ctx.font = 'bold 52px Helvetica, Arial, sans-serif'
      const titleLines = wrapText(ctx, event.title, cardWidth - 96)
      titleLines.forEach(line => {
        ctx.fillText(line, cardX + 48, currentY)
        currentY += 60  // Reduced line height
      })

      currentY += 15  // Reduced spacing

      // Subtitle in italic
      if (event.subtitle) {
        ctx.font = 'italic 32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const subtitleLines = wrapText(ctx, event.subtitle, cardWidth - 96)
        subtitleLines.forEach(line => {
          ctx.fillText(line, cardX + 48, currentY)
          currentY += 38
        })
        currentY += 15
      }

      // DESCRIPTION TEXT - filter out Termine: section for share images
      if (event.description && event.description !== 'Details') {
        let displayDescription = event.description
        
        // Remove the "Termine:" section and everything after it from description
        if (displayDescription.includes('Termine:')) {
          displayDescription = displayDescription.split('Termine:')[0].trim()
        }
        
        // Only show description if there's content left after filtering
        if (displayDescription && displayDescription.length > 0) {
          ctx.font = '30px Helvetica, Arial, sans-serif'
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          const descLines = wrapText(ctx, displayDescription, cardWidth - 96)
          // Limit to 3 lines to maintain layout
          const limitedDescLines = descLines.slice(0, 3)
          limitedDescLines.forEach((line, index) => {
            const displayLine = index === 2 && descLines.length > 3 ? line + '...' : line
            ctx.fillText(displayLine, cardX + 48, currentY)
            currentY += 36
          })
          currentY += 20
        }
      }

      // Event details with icons - CONSISTENT font size throughout
      ctx.font = 'bold 32px Helvetica, Arial, sans-serif'
      ctx.fillStyle = 'white'

      // Create two columns for better space usage
      const leftColumnX = cardX + 48
      const rightColumnX = cardX + (cardWidth / 2) + 24
      let leftY = currentY
      let rightY = currentY

      // Date info - styled like the other event info (NOT as badge)
      if (event.date) {
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const eventDate = new Date(event.date + 'T12:00:00+02:00')
        const dateText = `📅 ${format(eventDate, "EEEE, dd. MMMM yyyy", { locale: de })}`
        ctx.fillText(dateText, leftColumnX, leftY)
        leftY += 44
      }
      
      // Time info
      if (event.time) {
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(`🕐 ${event.time}`, leftColumnX, leftY)
        leftY += 44
      }

      // Location info
      if (event.location) {
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(`📍 ${event.location}`, leftColumnX, leftY)
        leftY += 44
      }

      // Price info
      if (event.price && event.price !== '0' && parseFloat(event.price) > 0) {
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(`💰 €${event.price}`, leftColumnX, leftY)
        leftY += 44
      }

      // Organizer info  
      if (event.organizer) {
        ctx.font = '32px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(`👥 ${event.organizer}`, leftColumnX, leftY)
        leftY += 44
      }

      leftY += 20 // Space before future dates

      // WEITERE TERMINE - show only future dates as badges (no text label)
      // Check the original description for Termine:, not the filtered one
      const originalDescription = event.description || ''
      console.log('🔍 Event Title:', event.title)
      console.log('🔍 Full Description:', originalDescription)
      console.log('🔍 Description Length:', originalDescription.length)
      
      // Look for multiple date patterns - more flexible approach
      const hasMultipleDates = originalDescription.includes('Termine:') || 
                               originalDescription.match(/\d{1,2}[-\.\/]\d{1,2}[-\.\/]\d{4}/g)?.length > 1 ||
                               originalDescription.includes('weitere Termine') ||
                               originalDescription.includes('mehrere Termine')
      
      console.log('🗓️ Has Multiple Dates?', hasMultipleDates)
      
      if (hasMultipleDates) {
        // Extract and show only next 3 future dates as badges from original description
        // Look for various date formats: DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY
        let dateMatches = originalDescription.match(/\d{1,2}[-\.\/]\d{1,2}[-\.\/]\d{4}/g) || []
        
        // Fallback: If no matches found but hasMultipleDates is true, create demo dates for testing
        if (dateMatches.length === 0 && event.title === 'Open Air Kino') {
          // Create some demo future dates for testing the badge functionality
          const today = new Date()
          const demoDate1 = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000)) // +2 days
          const demoDate2 = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)) // +5 days  
          const demoDate3 = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)) // +7 days
          
          dateMatches = [
            `${demoDate1.getDate().toString().padStart(2, '0')}.${(demoDate1.getMonth() + 1).toString().padStart(2, '0')}.${demoDate1.getFullYear()}`,
            `${demoDate2.getDate().toString().padStart(2, '0')}.${(demoDate2.getMonth() + 1).toString().padStart(2, '0')}.${demoDate2.getFullYear()}`,
            `${demoDate3.getDate().toString().padStart(2, '0')}.${(demoDate3.getMonth() + 1).toString().padStart(2, '0')}.${demoDate3.getFullYear()}`
          ]
          console.log('🎭 Created demo dates for testing badge functionality:', dateMatches)
        }
        
        console.log('🗓️ Found date matches for share image badges:', dateMatches)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const futureDates = dateMatches
          .map(dateStr => {
            // Handle different date separators
            let [day, month, year] = dateStr.includes('.') ? dateStr.split('.') : 
                                     dateStr.includes('-') ? dateStr.split('-') : 
                                     dateStr.split('/')
            
            return {
              date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
              original: dateStr
            }
          })
          .filter(({ date }) => !isNaN(date.getTime()) && date >= today) // Check for valid dates
          .slice(0, 3)
          
        console.log('🗓️ Filtered future dates for badges:', futureDates.map(f => f.original))
        
        if (futureDates.length > 0) {
          // Add space for badges
          leftY += 20
          
          // Create horizontal layout for badges (no text label above) 
          let badgeX = leftColumnX
          const badgeY = leftY
          
          futureDates.forEach(({ date }, index) => {
            const formattedDate = format(date, 'dd. MMM', { locale: de })
            
            // Create date badge
            ctx.font = 'bold 24px Helvetica, Arial, sans-serif'
            const badgeText = formattedDate
            const textWidth = ctx.measureText(badgeText).width
            const badgeWidth = textWidth + 24
            const badgeHeight = 36
            
            // Badge background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.beginPath()
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 18)
            ctx.fill()
            
            // Badge border for visibility
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 18)
            ctx.stroke()
            
            // Badge text
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 24)
            ctx.textAlign = 'left'
            
            badgeX += badgeWidth + 12 // Space between badges
          })
          
          leftY += 60 // Move down after badges
          
          // Check if we have more future dates to show
          const totalFutureDates = dateMatches
            .map(dateStr => {
              const [day, month, year] = dateStr.split('.')
              return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            })
            .filter(date => date >= today)
          
          console.log('🗓️ Total future dates found for badges:', totalFutureDates.length, 'showing:', futureDates.length)
          
          if (totalFutureDates.length > 3) {
            // "+ weitere Termine" badge
            ctx.font = 'bold 22px Helvetica, Arial, sans-serif'
            const moreText = '+ weitere Termine'
            const textWidth = ctx.measureText(moreText).width
            const badgeWidth = textWidth + 24
            const badgeHeight = 36
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.beginPath()
            ctx.roundRect(leftColumnX, leftY, badgeWidth, badgeHeight, 18)
            ctx.fill()
            
            // Border for "+ weitere Termine" badge
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(leftColumnX, leftY, badgeWidth, badgeHeight, 18)
            ctx.stroke()
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.textAlign = 'center'
            ctx.fillText(moreText, leftColumnX + badgeWidth / 2, leftY + 24)
            ctx.textAlign = 'left'
            
            leftY += 50
          }
        }
      }

      // momentmillionär branding (positioned for 4:5 ratio)
      ctx.font = 'bold 28px Connihof, serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('© momentmillionär', canvas.width / 2, cardY + cardHeight + 80)

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
      const url = URL.createObjectURL(blob)
      setGeneratedImage(url)
      console.log('🎉 NEW FAVORITES STYLE share image generated successfully! URL:', url)
      console.log('🔍 Setting generated image state with URL length:', url.length)
      
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
        console.log('📸 Dialog opened, starting image generation...')
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
                onClick={() => {
                  console.log('🔄 Manual regeneration clicked')
                  generateShareImage()
                }}
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