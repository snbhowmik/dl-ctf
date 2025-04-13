"use client"

import { useRef, useEffect, useState } from "react"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const isTouchingRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ensure canvas has proper dimensions
    const updateCanvasSize = () => {
      // Set minimum dimensions to prevent zero height/width
      canvas.width = canvas.offsetWidth

      canvas.height = canvas.offsetHeight
      setIsMobile(window.innerWidth < 768)
      setCanvasReady(true)
    }

    // Initial size update
    updateCanvasSize()

    let particles: {
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      color: string
      scatteredColor: string
      life: number
      isText: string
    }[] = []

    let textImageData: ImageData | null = null

    function createTextImage() {
      if (!ctx || !canvas || !canvasReady) return 0

      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.save()

      const scale = isMobile ? 0.6 : 1
      const fontSize = 60 * scale
      const titleFontSize = 40 * scale
      const lineHeight = fontSize * 1.2

      // Calculate total height of all text elements
      const totalHeight = titleFontSize + lineHeight * 2 + fontSize * 0.8

      // Position text in the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2 - totalHeight / 2)

      // Draw "DarkLead!" text
      ctx.save()
      ctx.font = `bold ${titleFontSize}px "Arial", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText("DarkLead!", 0, 0)
      ctx.restore()

      // Draw "Shadow" text
      ctx.save()
      ctx.font = `bold ${fontSize}px "Arial", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText("SHADOW", 0, titleFontSize + fontSize * 0.5)
      ctx.restore()

      // Draw "Apocalypse CTF" text
      ctx.save()
      ctx.font = `bold ${fontSize}px "Arial", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText("APOCALYPSE CTF", 0, titleFontSize + fontSize * 0.5 + lineHeight)
      ctx.restore()

      // Draw "Coming Soon!" text
      ctx.save()
      ctx.font = `bold ${titleFontSize}px "Arial", sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText("Coming Soon!", 0, titleFontSize + fontSize * 0.5 + lineHeight * 2)
      ctx.restore()

      ctx.restore()

      try {
        // Get image data only if canvas has valid dimensions
        if (canvas.width > 0 && canvas.height > 0) {
          textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          return scale
        } else {
          console.error("Canvas has invalid dimensions:", canvas.width, canvas.height)
          return 0
        }
      } catch (error) {
        console.error("Error getting image data:", error)
        return 0
      }
    }

    function createParticle(scale: number) {
      if (!ctx || !canvas || !textImageData) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        // Ensure we don't access out of bounds data
        const index = (y * canvas.width + x) * 4 + 3
        if (index >= data.length) continue

        if (data[index] > 128) {
          // Determine which text element the particle belongs to based on y position
          const centerY = canvas.height / 2
          const fontSize = 60 * (isMobile ? 0.6 : 1)
          const titleFontSize = 40 * (isMobile ? 0.6 : 1)
          const lineHeight = fontSize * 1.2
          const totalHeight = titleFontSize + lineHeight * 2 + fontSize * 0.8

          const relativeY = y - (centerY - totalHeight / 2)

          let particleType = "title" // Default (DarkLead or Coming Soon)

          if (relativeY > titleFontSize && relativeY < titleFontSize + fontSize * 0.5 + lineHeight) {
            particleType = "shadow"
          } else if (
            relativeY >= titleFontSize + fontSize * 0.5 + lineHeight &&
            relativeY < titleFontSize + fontSize * 0.5 + lineHeight * 2
          ) {
            particleType = "apocalypse"
          }

          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1 + 0.5,
            color: "white",
            scatteredColor: "#FF0000", // All text in red
            isText: particleType,
            life: Math.random() * 100 + 50,
          }
        }
      }

      return null
    }

    function createInitialParticles(scale: number) {
      if (!textImageData) return

      const baseParticleCount = 7000
      const particleCount = canvas
        ? Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)))
        : 0

      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(scale)
        if (particle) particles.push(particle)
      }
    }

    let animationFrameId: number

    function animate(scale: number) {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const { x: mouseX, y: mouseY } = mousePositionRef.current
      const maxDistance = 240

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance && (isTouchingRef.current || !("ontouchstart" in window))) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          const moveX = Math.cos(angle) * force * 60
          const moveY = Math.sin(angle) * force * 60
          p.x = p.baseX - moveX
          p.y = p.baseY - moveY

          ctx.fillStyle = p.scatteredColor
        } else {
          p.x += (p.baseX - p.x) * 0.1
          p.y += (p.baseY - p.y) * 0.1
          ctx.fillStyle = "white"
        }

        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle(scale)
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 7000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )

      while (particles.length < targetParticleCount) {
        const newParticle = createParticle(scale)
        if (newParticle) particles.push(newParticle)
      }

      animationFrameId = requestAnimationFrame(() => animate(scale))
    }

    // Wait for the next frame to ensure canvas is properly sized
    requestAnimationFrame(() => {
      const scale = createTextImage()
      if (textImageData) {
        createInitialParticles(scale)
        animate(scale)
      } else {
        console.error("Failed to create text image data")
      }
    })

    const handleResize = () => {
      updateCanvasSize()
      // Wait for canvas to be ready after resize
      requestAnimationFrame(() => {
        const newScale = createTextImage()
        particles = []
        if (textImageData) {
          createInitialParticles(newScale)
        }
      })
    }

    const handleMove = (x: number, y: number) => {
      mousePositionRef.current = { x, y }
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchStart = () => {
      isTouchingRef.current = true
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      mousePositionRef.current = { x: 0, y: 0 }
    }

    const handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        mousePositionRef.current = { x: 0, y: 0 }
      }
    }

    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile, canvasReady])

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        style={{ minHeight: "100px", minWidth: "100px" }}
        aria-label="Interactive particle effect with Shadow Apocalypse CTF text"
      />
      <div className="absolute bottom-[50px] text-center z-10">
        <p className="font-mono text-gray-400 text-xs sm:text-base md:text-sm">
          <span className="text-red-500">DarkLead!</span>{" "}
          <a href="#" className="invite-link text-red-500 transition-colors duration-300 hover:text-red-400">
            Shadow
          </a>{" "}
          <span className="text-red-500">Apocalypse CTF</span> <span className="text-red-500">Coming Soon!</span>
          <br />
          <a
            href="https://darklead.org/"
            className="text-gray-500 text-xs mt-2.5 inline-block"
            target="_blank"
            rel="noreferrer"
          >
            by DarkLead!
          </a>
        </p>
      </div>
    </div>
  )
}
