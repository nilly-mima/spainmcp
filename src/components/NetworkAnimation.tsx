'use client'

import { useEffect, useRef } from 'react'

const TOOLS = [
  { label: 'GitHub',      initials: 'GH', fx: 0.50, fy: 0.06 },
  { label: 'Playwright',  initials: 'PW', fx: 0.87, fy: 0.20 },
  { label: 'Notion',      initials: 'NO', fx: 0.95, fy: 0.54 },
  { label: 'YouTube',     initials: 'YT', fx: 0.80, fy: 0.88 },
  { label: 'PostgreSQL',  initials: 'PG', fx: 0.38, fy: 0.94 },
  { label: 'Brave Search',initials: 'BS', fx: 0.08, fy: 0.80 },
  { label: 'Filesystem',  initials: 'FS', fx: 0.04, fy: 0.42 },
  { label: 'Slack',       initials: 'SL', fx: 0.18, fy: 0.11 },
]

const NODE_R = 20
const CENTER_R = 30
const ORANGE = '#EA580C'

interface Particle {
  toolIdx: number
  progress: number
  speed: number
  size: number
}

export default function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Particles per connection
    const particles: Particle[] = []
    TOOLS.forEach((_, i) => {
      for (let j = 0; j < 3; j++) {
        particles.push({
          toolIdx: i,
          progress: Math.random(),
          speed: 0.0025 + Math.random() * 0.004,
          size: 2 + Math.random() * 1.5,
        })
      }
    })

    // Pulse state
    let pulseR = CENTER_R
    let pulseAlpha = 0

    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let animId: number

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const cx = W * 0.5
      const cy = H * 0.5

      // Tool node positions
      const toolPos = TOOLS.map(t => ({ x: t.fx * W, y: t.fy * H }))

      // Lines from tools → Claude
      toolPos.forEach(p => {
        const grad = ctx.createLinearGradient(p.x, p.y, cx, cy)
        grad.addColorStop(0, 'rgba(168,162,158,0.08)')
        grad.addColorStop(1, 'rgba(234,88,12,0.18)')
        ctx.beginPath()
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(cx, cy)
        ctx.stroke()
      })

      // Particles
      particles.forEach(p => {
        p.progress += p.speed
        if (p.progress > 1) p.progress = 0

        const tp = toolPos[p.toolIdx]
        const px = tp.x + (cx - tp.x) * p.progress
        const py = tp.y + (cy - tp.y) * p.progress
        const alpha = 0.3 + p.progress * 0.7

        ctx.beginPath()
        ctx.fillStyle = `rgba(234,88,12,${alpha})`
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Tool nodes
      toolPos.forEach((p, i) => {
        const tool = TOOLS[i]

        // Circle
        ctx.beginPath()
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = 'rgba(168,162,158,0.35)'
        ctx.lineWidth = 1.5
        ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Initials
        ctx.fillStyle = '#78716C'
        ctx.font = 'bold 9px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(tool.initials, p.x, p.y)

        // Label
        ctx.fillStyle = 'rgba(120,113,108,0.65)'
        ctx.font = '9px system-ui, sans-serif'
        const labelY = p.y + NODE_R + 11
        ctx.fillText(tool.label, p.x, labelY)
      })

      // Pulse ring around Claude
      pulseR += 0.4
      pulseAlpha -= 0.012
      if (pulseAlpha <= 0) { pulseR = CENTER_R + 2; pulseAlpha = 0.7 }
      ctx.beginPath()
      ctx.strokeStyle = `rgba(234,88,12,${pulseAlpha * 0.35})`
      ctx.lineWidth = 2
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.stroke()

      // Claude center node
      ctx.save()
      ctx.shadowColor = 'rgba(234,88,12,0.5)'
      ctx.shadowBlur = 24
      ctx.beginPath()
      ctx.fillStyle = ORANGE
      ctx.arc(cx, cy, CENTER_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Inner ring
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 1
      ctx.arc(cx, cy, CENTER_R - 6, 0, Math.PI * 2)
      ctx.stroke()

      // Claude label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Claude', cx, cy)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
