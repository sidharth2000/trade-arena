import { useEffect, useRef } from 'react'
import styles from './ShoppingParticles.module.css'

const ICONS = ['cart', 'bag', 'tag', 'box', 'star', 'card']
const COLORS = ['rgba(40,116,240,', 'rgba(255,229,0,', 'rgba(255,97,97,', 'rgba(160,174,192,']

function drawCart(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(x-s,y-s*0.6); ctx.lineTo(x-s*0.5,y-s*0.6); ctx.lineTo(x-s*0.2,y+s*0.4); ctx.lineTo(x+s*0.8,y+s*0.4); ctx.lineTo(x+s,y-s*0.2); ctx.lineTo(x-s*0.5,y-s*0.2); ctx.stroke()
  ctx.beginPath(); ctx.arc(x-s*0.1,y+s*0.7,s*0.18,0,Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc(x+s*0.6,y+s*0.7,s*0.18,0,Math.PI*2); ctx.stroke()
}
function drawBag(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.roundRect(x-s*0.7,y-s*0.3,s*1.4,s*1.2,s*0.15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-s*0.3,y-s*0.3); ctx.arc(x,y-s*0.3,s*0.3,Math.PI,0); ctx.stroke()
}
function drawTag(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(x-s*0.8,y); ctx.lineTo(x-s*0.1,y-s*0.8); ctx.lineTo(x+s*0.8,y-s*0.8); ctx.lineTo(x+s*0.8,y+s*0.1); ctx.lineTo(x,y+s*0.9); ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.arc(x+s*0.35,y-s*0.45,s*0.15,0,Math.PI*2); ctx.stroke()
}
function drawBox(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.rect(x-s*0.7,y-s*0.3,s*1.4,s*1.1); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-s*0.7,y+s*0.2); ctx.lineTo(x+s*0.7,y+s*0.2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-s*0.2,y-s*0.3); ctx.lineTo(x-s*0.2,y+s*0.2); ctx.lineTo(x+s*0.2,y+s*0.2); ctx.lineTo(x+s*0.2,y-s*0.3); ctx.stroke()
}
function drawStar(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI / 5) - Math.PI / 2
    const b = (i * 4 * Math.PI / 5 + 2 * Math.PI / 5) - Math.PI / 2
    if (i === 0) ctx.moveTo(x + s * Math.cos(a), y + s * Math.sin(a))
    else ctx.lineTo(x + s * Math.cos(a), y + s * Math.sin(a))
    ctx.lineTo(x + s*0.4 * Math.cos(b), y + s*0.4 * Math.sin(b))
  }
  ctx.closePath(); ctx.stroke()
}
function drawCard(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.roundRect(x-s*0.9,y-s*0.55,s*1.8,s*1.1,s*0.12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-s*0.9,y-s*0.1); ctx.lineTo(x+s*0.9,y-s*0.1); ctx.stroke()
  ctx.beginPath(); ctx.roundRect(x-s*0.65,y+s*0.1,s*0.5,s*0.25,2); ctx.stroke()
}

const DRAWERS = { cart: drawCart, bag: drawBag, tag: drawTag, box: drawBox, star: drawStar, card: drawCard }

export default function ShoppingParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles = Array.from({ length: 25 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        s: Math.random() * 9 + 7,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        rot: Math.random() * Math.PI * 2,
        drot: (Math.random() - 0.5) * 0.012,
        o: Math.random() * 0.2 + 0.08,
        icon: ICONS[i % ICONS.length],
        colorBase: COLORS[i % COLORS.length],
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.save()
        ctx.globalAlpha = p.o
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        DRAWERS[p.icon](ctx, 0, 0, p.s, p.colorBase + '1)')
        ctx.restore()
        p.x += p.dx; p.y += p.dy; p.rot += p.drot
        if (p.x < -30) p.x = canvas.width + 30
        if (p.x > canvas.width + 30) p.x = -30
        if (p.y < -30) p.y = canvas.height + 30
        if (p.y > canvas.height + 30) p.y = -30
      })
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}