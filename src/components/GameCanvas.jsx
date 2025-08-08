import { useRef, useEffect, useState } from 'react'

export default function GameCanvas({ width = 640, height = 480 }) {
    const canvasRef = useRef(null)
    const playerRef = useRef({ x: 0, y: 0, size: 24, speed: 160 })
    const keysRef = useRef({})
    const [mapData, setMapData] = useState(null)
    const [tilesetImage, setTilesetImage] = useState(null)

    useEffect(() => {
        async function loadMap() {
            const data = await fetch('/maps/mapa1.json').then(res => res.json())

            const img = new Image()
            img.src = '/tilesets/' + data.tileset
            await new Promise(res => img.onload = res)

            setMapData(data)
            setTilesetImage(img)

            playerRef.current.x = (data.map[0].length * data.tileSize) / 2
            playerRef.current.y = (data.map.length * data.tileSize) / 2
        }
        loadMap()
    }, [])

    useEffect(() => {
        if (!mapData || !tilesetImage) return
        const ctx = canvasRef.current.getContext('2d')
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
    dx /= len
    dy /= len

    const newX = p.x + dx * p.speed * dt
    const newY = p.y + dy * p.speed * dt

    const tileSize = mapData.tileSize
    const halfSize = p.size / 2

    // Función auxiliar: chequea si un punto colisiona
    function isWalkable(px, py) {
        const tileX = Math.floor(px / tileSize)
        const tileY = Math.floor(py / tileSize)
        return (
            mapData.collision[tileY] &&
            mapData.collision[tileY][tileX] === 0
        )
    }

    // Chequear colisión para X
    if (
        isWalkable(newX - halfSize, p.y - halfSize) &&
        isWalkable(newX + halfSize - 1, p.y - halfSize) &&
        isWalkable(newX - halfSize, p.y + halfSize - 1) &&
        isWalkable(newX + halfSize - 1, p.y + halfSize - 1)
    ) {
        p.x = newX
    }

    // Chequear colisión para Y
    if (
        isWalkable(p.x - halfSize, newY - halfSize) &&
        isWalkable(p.x + halfSize - 1, newY - halfSize) &&
        isWalkable(p.x - halfSize, newY + halfSize - 1) &&
        isWalkable(p.x + halfSize - 1, newY + halfSize - 1)
    ) {
        p.y = newY
    }

    // Mantener dentro de límites del mapa
    const maxX = mapData.map[0].length * tileSize - halfSize
    const maxY = mapData.map.length * tileSize - halfSize
    p.x = Math.max(halfSize, Math.min(maxX, p.x))
    p.y = Math.max(halfSize, Math.min(maxY, p.y))
}

        }


        function draw() {
            const p = playerRef.current
            const tileSize = mapData.tileSize
            const offsetX = p.x - width / 2
            const offsetY = p.y - height / 2

            ctx.clearRect(0, 0, width, height)

            const tilesPerRow = tilesetImage.width / tileSize

            for (let row = 0; row < mapData.map.length; row++) {
                for (let col = 0; col < mapData.map[row].length; col++) {
                    const tileIndex = mapData.map[row][col]
                    const sx = (tileIndex % tilesPerRow) * tileSize
                    const sy = Math.floor(tileIndex / tilesPerRow) * tileSize
                    const dx = col * tileSize - offsetX
                    const dy = row * tileSize - offsetY

                    if (dx + tileSize >= 0 && dx < width && dy + tileSize >= 0 && dy < height) {
                        ctx.drawImage(tilesetImage, sx, sy, tileSize, tileSize, dx, dy, tileSize, tileSize)
                    }
                }
            }

            ctx.fillStyle = '#ff4d4d'
            ctx.fillRect(width / 2 - p.size / 2, height / 2 - p.size / 2, p.size, p.size)
        }

        function loop(now) {
            const dt = (now - lastTime) / 1000
            lastTime = now
            update(dt)
            draw()
            rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)

        const handleKeyDown = e => { keysRef.current[e.key] = true }
        const handleKeyUp = e => { keysRef.current[e.key] = false }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [mapData, tilesetImage, width, height])

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ border: '1px solid #222', display: 'block', background: '#0b0b0b' }}
        />
    )
}
