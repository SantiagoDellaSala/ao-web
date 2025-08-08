import React, { useRef, useEffect } from 'react'

export default function GameCanvas({ width = 640, height = 480 }) {
  const canvasRef = useRef(null)
  const playerRef = useRef({ x: width / 2, y: height / 2, size: 24, speed: 160 })
  const keysRef = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId
    let lastTime = performance.now()

    function update(dt) {
      const p = playerRef.current
      let dx = 0, dy = 0
      if (keysRef.current.ArrowUp || keysRef.current.w) dy -= 1
      if (keysRef.current.ArrowDown || keysRef.current.s) dy += 1
      if (keysRef.current.ArrowLeft || keysRef.current.a) dx -= 1
      if (keysRef.current.ArrowRight || keysRef.current.d) dx += 1

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1
        dx /= len; dy /= len
        p.x += dx * p.speed * dt
        p.y += dy * p.speed * dt
        // limitar dentro del canvas
        p.x = Math.max(p.size / 2, Math.min(width - p.size / 2, p.x))
        p.y = Math.max(p.size / 2, Math.min(height - p.size / 2, p.y))
      }
    }

    function draw() {
      const p = playerRef.current
      ctx.clearRect(0, 0, width, height)

      // grid simple (opcional, ayuda a ver movimiento)
      const tile = 32
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      for (let x = 0; x <= width; x += tile) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y <= height; y += tile) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }

      ctx.fillStyle = '#ff4d4d'
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)

      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText(`x:${Math.round(p.x)} y:${Math.round(p.y)}`, 8, 16)
    }

    function loop(now) {
      const dt = (now - lastTime) / 1000
      lastTime = now
      update(dt)
      draw()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const handleKeyDown = (e) => { keysRef.current[e.key] = true }
    const handleKeyUp = (e) => { keysRef.current[e.key] = false }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #222', display: 'block', background: '#0b0b0b' }}
      tabIndex={0}
    />
  )
}
