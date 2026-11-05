'use client'

import { useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/lib/gsap'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPress;
  uniform float uAspect;
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vec3 p = position;
    vec2 d = uv - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float ripple = sin(dist * 34.0 - uTime * 6.0) * exp(-dist * 6.0) * uPress;
    float wind = sin(uv.x * 5.0 + uTime * 0.7) * 0.010 + sin(uv.y * 8.0 + uTime * 1.05) * 0.007;
    float dent = -exp(-dist * dist * 55.0) * uPress;
    p.z += ripple * 0.045 + wind + dent * 0.09;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uCover;
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
    vec2 uv = (vUv - 0.5) * uCover + 0.5 + n.xy * 0.012;
    vec4 c = texture2D(uTex, uv);
    float light = dot(n, normalize(vec3(-0.45, 0.55, 1.0)));
    c.rgb *= 0.82 + 0.26 * light;
    c.rgb += pow(max(light, 0.0), 18.0) * 0.07;
    gl_FragColor = c;
  }
`

/** A sheet of the Sunday Set poplin you can press and ripple with the cursor. */
export function FabricTouch() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el || prefersReducedMotion()) return
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const THREE = await import('three')
      if (disposed) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      el.appendChild(renderer.domElement)
      el.classList.add('is-live')

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
      camera.position.z = 2
      const tex = new THREE.TextureLoader().load('/img/l-fabric.webp', (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        resize()
      })
      const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPress: { value: 0 },
        uAspect: { value: 1 },
        uTex: { value: tex },
        uCover: { value: new THREE.Vector2(1, 1) },
      }
      const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 180, 180), mat)
      scene.add(mesh)

      const resize = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        renderer.setSize(w, h, false)
        const aspect = w / h
        uniforms.uAspect.value = aspect
        const img = tex.image as { width?: number; height?: number } | undefined
        const ia = img?.width && img.height ? img.width / img.height : 1
        uniforms.uCover.value.set(aspect > ia ? 1 : aspect / ia, aspect > ia ? ia / aspect : 1)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(el)

      const target = new THREE.Vector2(0.5, 0.5)
      let press = 0
      let down = false
      let visible = false
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = 1 - (e.clientY - r.top) / r.height
        press = Math.min(1.4, press + Math.hypot(x - target.x, y - target.y) * 9)
        target.set(x, y)
      }
      const onDown = () => (down = true)
      const onUp = () => (down = false)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup', onUp)

      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '100px' })
      io.observe(el)

      const clock = new THREE.Clock()
      let raf = 0
      const loop = () => {
        raf = requestAnimationFrame(loop)
        if (!visible) return
        const dt = Math.min(clock.getDelta(), 0.05)
        uniforms.uTime.value += dt
        uniforms.uMouse.value.lerp(target, 0.12)
        press += ((down ? 1.2 : 0) - press) * 0.04
        uniforms.uPress.value += (press - uniforms.uPress.value) * 0.15
        renderer.render(scene, camera)
      }
      loop()

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        io.disconnect()
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        mesh.geometry.dispose()
        mat.dispose()
        tex.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <section className="fabric" data-header-tone="light">
      <div ref={host} className="fabric__canvas" data-cursor="touch">
        <img src="/img/l-fabric.webp" alt="Close-up of sage and cream pinstripe cotton poplin" className="fabric__fallback" />
      </div>
      <div className="fabric__copy">
        <p className="t-caps">N° 05 — Go on, touch it</p>
        <h2 className="t-display" data-split="chars">
          feel the poplin
        </h2>
        <p>Long-staple cotton, woven tight and brushed soft — it gets better every single wash.</p>
        <ul className="fabric__facts">
          <li>
            <strong>120</strong>
            <span>gsm poplin</span>
          </li>
          <li>
            <strong>100%</strong>
            <span>long-staple cotton</span>
          </li>
          <li>
            <strong>∞</strong>
            <span>washes softer</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
