'use client'

import { useEffect, useRef } from 'react'

const MODELS = [
  { label: 'Claude', color: '#cc785c', logo: '/logos/claude.svg' },
  { label: 'ChatGPT', color: '#10a37f', logo: '/logos/openai.svg' },
  { label: 'Gemini', color: '#4285f4', logo: '/logos/gemini.svg' },
]

const SERVERS = [
  { label: 'BOE', logo: '' },
  { label: 'AEMET', logo: '' },
  { label: 'GitHub', logo: '/logos/github.svg' },
  { label: 'Notion', logo: '/logos/notion.svg' },
  { label: 'Postgres', logo: '/logos/postgres.svg' },
]

const NODE_W = 62
const NODE_H = 30
const HUB_W = 70
const HUB_H = 42

interface Particle {
  fromX: number; fromY: number
  cpX: number; cpY: number
  toX: number; toY: number
  progress: number
  speed: number
  size: number
}

function bezierPt(t: number, p0: number, cp: number, p1: number) {
  const mt = 1 - t
  return mt * mt * p0 + 2 * mt * t * cp + t * t * p1
}

export default function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    let pulseScale = 0
    const dpr = window.devicePixelRatio || 1
    let particles: Particle[] = []
    let inited = false

    const isDark = () => document.documentElement.classList.contains('dark')

    /* ── Load logo images ── */
    const logoImages: Record<string, HTMLImageElement> = {}
    const allLogos = [...MODELS, ...SERVERS].filter(n => n.logo)
    allLogos.forEach(n => {
      const img = new Image()
      img.src = n.logo
      logoImages[n.logo] = img
    })

    const resize = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      inited = false
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let animId: number

    function drawCard3D(x: number, y: number, w: number, h: number, dark: boolean, depth: number) {
      const shadow = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'
      const edgeR = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
      const edgeB = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
      const bgFill = dark ? '#292524' : '#FFFFFF'
      const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(28,25,23,0.1)'
      const shine0 = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)'

      ctx.fillStyle = shadow
      ctx.beginPath(); ctx.roundRect(x + depth, y + depth, w, h, 6); ctx.fill()
      ctx.fillStyle = edgeR
      ctx.beginPath()
      ctx.moveTo(x + w, y + 2); ctx.lineTo(x + w + depth, y + depth + 2)
      ctx.lineTo(x + w + depth, y + h + depth); ctx.lineTo(x + w, y + h)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = edgeB
      ctx.beginPath()
      ctx.moveTo(x + 2, y + h); ctx.lineTo(x + depth + 2, y + h + depth)
      ctx.lineTo(x + w + depth, y + h + depth); ctx.lineTo(x + w, y + h)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = bgFill; ctx.strokeStyle = border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke()
      const shine = ctx.createLinearGradient(x, y, x, y + h * 0.35)
      shine.addColorStop(0, shine0); shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = shine
      ctx.beginPath(); ctx.roundRect(x + 1, y + 1, w - 2, h * 0.35, [5, 5, 0, 0]); ctx.fill()
    }

    function drawLogo(logo: string, cx: number, cy: number, size: number, dark: boolean) {
      const img = logoImages[logo]
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save()
        if (dark) {
          ctx.filter = 'invert(1) brightness(0.85)'
        }
        ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size)
        ctx.restore()
        return true
      }
      return false
    }

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      const dark = isDark()
      ctx.clearRect(0, 0, W, H)

      const hubX = W * 0.5
      const hubY = H * 0.48

      const modelSpacing = W / (MODELS.length + 1)
      const modelY = H * 0.12
      const modelPos = MODELS.map((_, i) => ({ x: modelSpacing * (i + 1), y: modelY }))

      const serverSpacing = W / (SERVERS.length + 1)
      const serverY = H * 0.82
      const serverPos = SERVERS.map((_, i) => ({ x: serverSpacing * (i + 1), y: serverY }))

      if (!inited) {
        particles = []
        modelPos.forEach((p, i) => {
          const offsetX = (i - (MODELS.length - 1) / 2) * 25
          const cpX = hubX + offsetX
          const cpY = p.y + 14 + (hubY - HUB_H / 2 - p.y - 14) * 0.45
          for (let j = 0; j < 3; j++) {
            particles.push({
              fromX: p.x, fromY: p.y + 14, cpX, cpY,
              toX: hubX, toY: hubY - HUB_H / 2,
              progress: Math.random(), speed: 0.002 + Math.random() * 0.003,
              size: 1.5 + Math.random() * 1.5,
            })
          }
        })
        serverPos.forEach((p, i) => {
          const offsetX = (i - (SERVERS.length - 1) / 2) * 25
          const cpX = hubX + offsetX
          const cpY = hubY + HUB_H / 2 + (p.y - hubY - HUB_H / 2) * 0.55
          for (let j = 0; j < 3; j++) {
            particles.push({
              fromX: hubX, fromY: hubY + HUB_H / 2, cpX, cpY,
              toX: p.x, toY: p.y - 14,
              progress: Math.random(), speed: 0.002 + Math.random() * 0.003,
              size: 1.5 + Math.random() * 1.5,
            })
          }
        })
        // Extended particles going down
        serverPos.forEach((p, i) => {
          const spread = (i - (SERVERS.length - 1) / 2) * 0.18
          const endX = p.x + spread * W * 0.35
          const cpX = p.x + (endX - p.x) * 0.4
          const cpY = p.y + NODE_H / 2 + (H + 40 - p.y) * 0.35
          for (let j = 0; j < 2; j++) {
            particles.push({
              fromX: p.x, fromY: p.y + NODE_H / 2, cpX, cpY,
              toX: endX, toY: H + 40,
              progress: Math.random(), speed: 0.001 + Math.random() * 0.002,
              size: 1.5 + Math.random() * 1,
            })
          }
        })
        inited = true
      }

      /* ── Curved lines: models → hub ── */
      const lineColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(28,25,23,0.08)'
      modelPos.forEach((p, i) => {
        const offsetX = (i - (MODELS.length - 1) / 2) * 25
        const cpX = hubX + offsetX
        const cpY = p.y + 14 + (hubY - HUB_H / 2 - p.y - 14) * 0.45
        ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1
        ctx.moveTo(p.x, p.y + 14)
        ctx.quadraticCurveTo(cpX, cpY, hubX, hubY - HUB_H / 2)
        ctx.stroke()
      })

      /* ── Curved lines: hub → servers ── */
      serverPos.forEach((p, i) => {
        const offsetX = (i - (SERVERS.length - 1) / 2) * 25
        const cpX = hubX + offsetX
        const cpY = hubY + HUB_H / 2 + (p.y - hubY - HUB_H / 2) * 0.55
        ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1
        ctx.moveTo(hubX, hubY + HUB_H / 2)
        ctx.quadraticCurveTo(cpX, cpY, p.x, p.y - 14)
        ctx.stroke()
      })

      /* ── Extended curved lines down ── */
      serverPos.forEach((p, i) => {
        const spread = (i - (SERVERS.length - 1) / 2) * 0.18
        const endX = p.x + spread * W * 0.35
        const endY = H + 40
        const cpX = p.x + (endX - p.x) * 0.4
        const cpY = p.y + NODE_H / 2 + (endY - p.y) * 0.35
        const grad = ctx.createLinearGradient(p.x, p.y + NODE_H / 2, endX, endY)
        grad.addColorStop(0, dark ? 'rgba(255,255,255,0.06)' : 'rgba(28,25,23,0.06)')
        grad.addColorStop(0.4, dark ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.04)')
        grad.addColorStop(1, 'rgba(37,99,235,0)')
        ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = 1
        ctx.moveTo(p.x, p.y + NODE_H / 2)
        ctx.quadraticCurveTo(cpX, cpY, endX, endY)
        ctx.stroke()
      })

      /* ── Particles (follow bezier) ── */
      particles.forEach(p => {
        p.progress += p.speed
        if (p.progress > 1) p.progress = 0
        const t = p.progress
        const px = bezierPt(t, p.fromX, p.cpX, p.toX)
        const py = bezierPt(t, p.fromY, p.cpY, p.toY)
        const alpha = Math.sin(t * Math.PI) * 0.7 + 0.15
        ctx.beginPath()
        ctx.fillStyle = `rgba(37,99,235,${alpha})`
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      /* ── Model nodes (top) — logo + name only ── */
      const textColor = dark ? '#a8a29e' : '#78716c'
      modelPos.forEach((p, i) => {
        const m = MODELS[i]
        const logoSize = 20
        if (m.logo && drawLogo(m.logo, p.x, p.y - 2, logoSize, dark)) {
          ctx.fillStyle = textColor
          ctx.font = '500 8px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(m.label, p.x, p.y + 12)
        } else {
          ctx.fillStyle = dark ? '#e7e5e4' : '#1c1917'
          ctx.font = '600 10px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(m.label, p.x, p.y)
        }
      })

      /* ── Server nodes (bottom) — logo + name only ── */
      serverPos.forEach((p, i) => {
        const s = SERVERS[i]
        const logoSize = 20
        if (s.logo && drawLogo(s.logo, p.x, p.y - 2, logoSize, dark)) {
          ctx.fillStyle = textColor
          ctx.font = '500 8px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(s.label, p.x, p.y + 12)
        } else {
          ctx.fillStyle = dark ? '#e7e5e4' : '#1c1917'
          ctx.font = '600 10px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(s.label, p.x, p.y)
        }
      })

      /* ── Pulse ── */
      pulseScale += 0.01
      if (pulseScale > 1) pulseScale = 0
      const pAlpha = (1 - pulseScale) * 0.12
      const pW = HUB_W + pulseScale * 28
      const pH = HUB_H + pulseScale * 18
      ctx.beginPath()
      ctx.strokeStyle = dark ? `rgba(37,99,235,${pAlpha})` : `rgba(28,25,23,${pAlpha})`
      ctx.lineWidth = 1.5
      ctx.roundRect(hubX - pW / 2, hubY - pH / 2, pW, pH, 10)
      ctx.stroke()

      /* ── Hub (dark) ── */
      const hx = hubX - HUB_W / 2
      const hy = hubY - HUB_H / 2

      ctx.fillStyle = dark ? 'rgba(37,99,235,0.15)' : 'rgba(0,0,0,0.2)'
      ctx.beginPath(); ctx.roundRect(hx + 4, hy + 4, HUB_W, HUB_H, 8); ctx.fill()

      ctx.fillStyle = dark ? 'rgba(37,99,235,0.08)' : 'rgba(0,0,0,0.12)'
      ctx.beginPath()
      ctx.moveTo(hx + HUB_W, hy + 3); ctx.lineTo(hx + HUB_W + 4, hy + 7)
      ctx.lineTo(hx + HUB_W + 4, hy + HUB_H + 4); ctx.lineTo(hx + HUB_W, hy + HUB_H)
      ctx.closePath(); ctx.fill()

      const hubGrad = ctx.createLinearGradient(hx, hy, hx, hy + HUB_H)
      hubGrad.addColorStop(0, '#2d2926'); hubGrad.addColorStop(1, '#1c1917')
      ctx.fillStyle = hubGrad
      ctx.beginPath(); ctx.roundRect(hx, hy, HUB_W, HUB_H, 8); ctx.fill()

      const hubShine = ctx.createLinearGradient(hx, hy, hx, hy + HUB_H * 0.3)
      hubShine.addColorStop(0, 'rgba(255,255,255,0.1)'); hubShine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hubShine
      ctx.beginPath(); ctx.roundRect(hx + 1, hy + 1, HUB_W - 2, HUB_H * 0.3, [7, 7, 0, 0]); ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(hx, hy, HUB_W, HUB_H, 8); ctx.stroke()

      // Logo squares (orange)
      const sq = 5, gap = 2.5
      const lx = hubX - sq - gap / 2 - 16, ly = hubY - sq - gap / 2
      ctx.fillStyle = '#2563EB'
      ctx.beginPath(); ctx.roundRect(lx, ly, sq, sq, 1.5); ctx.fill()
      ctx.beginPath(); ctx.roundRect(lx + sq + gap, ly, sq, sq, 1.5); ctx.fill()
      ctx.beginPath(); ctx.roundRect(lx, ly + sq + gap, sq, sq, 1.5); ctx.fill()
      ctx.beginPath(); ctx.roundRect(lx + sq + gap, ly + sq + gap, sq, sq, 1.5); ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText('MCP', hubX - 2, hubY + 0.5)

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
