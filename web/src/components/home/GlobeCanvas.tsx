'use client'

import { useEffect, useRef } from 'react'

export default function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return

    let mounted = true

    const init = async () => {
      const THREE = await import('three')

      if (!mounted) return

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(0, 0, 3.2)

      const geo = new THREE.SphereGeometry(1, 64, 64)
      const wireGeo = new THREE.SphereGeometry(1.01, 32, 32)
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x8B5CF6, wireframe: true, transparent: true, opacity: 0.08 })
      const wire = new THREE.Mesh(wireGeo, wireMat)
      scene.add(wire)

      const mat = new THREE.MeshPhongMaterial({
        color: 0x050510, emissive: 0x0A0520, specular: 0x8B5CF6,
        shininess: 30, transparent: true, opacity: 0.7, wireframe: false,
      })
      const globe = new THREE.Mesh(geo, mat)
      scene.add(globe)

      const isMobile = window.innerWidth < 768
      const dotCount = isMobile ? 1200 : 2500

      const dotGeo = new THREE.BufferGeometry()
      const positions = new Float32Array(dotCount * 3)
      const colors = new Float32Array(dotCount * 3)

      for (let i = 0; i < dotCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / dotCount)
        const theta = Math.sqrt(dotCount * Math.PI) * phi
        const r = 1.015
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.cos(phi)
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        const t = Math.random()
        colors[i * 3] = 0.54 * (1 - t) + 0.02 * t
        colors[i * 3 + 1] = 0.31 * (1 - t) + 0.72 * t
        colors[i * 3 + 2] = 0.96 * (1 - t) + 0.84 * t
      }

      dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      dotGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const dotMat = new THREE.PointsMaterial({ size: 0.012, vertexColors: true, transparent: true, opacity: 0.85 })
      const dots = new THREE.Points(dotGeo, dotMat)
      scene.add(dots)

      const ringGeo = new THREE.RingGeometry(1.05, 1.08, 64)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x8B5CF6, side: THREE.DoubleSide, transparent: true, opacity: 0.15 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      scene.add(ring)

      const ring2Geo = new THREE.RingGeometry(1.15, 1.17, 64)
      const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x06B6D4, side: THREE.DoubleSide, transparent: true, opacity: 0.08 })
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
      ring2.rotation.x = Math.PI / 4
      scene.add(ring2)

      scene.add(new THREE.AmbientLight(0x1a0a2e, 2))

      const violetLight = new THREE.PointLight(0x8B5CF6, 3, 8)
      violetLight.position.set(-2, 1, 2)
      scene.add(violetLight)

      const cyanLight = new THREE.PointLight(0x06B6D4, 2, 8)
      cyanLight.position.set(2, -1, 2)
      scene.add(cyanLight)

      let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

      if (!isMobile) {
        const handleMouse = (e: MouseEvent) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5
          mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3
        }
        document.addEventListener('mousemove', handleMouse)
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        })

        return () => {
          document.removeEventListener('mousemove', handleMouse)
        }
      }

      let time = 0
      function animate() {
        if (!mounted) return
        requestAnimationFrame(animate)
        time += 0.005
        targetX += (mouseX - targetX) * 0.04
        targetY += (mouseY - targetY) * 0.04

        globe.rotation.y = time * 0.15 + targetX
        globe.rotation.x = targetY * 0.5
        dots.rotation.y = time * 0.15 + targetX
        dots.rotation.x = targetY * 0.5
        wire.rotation.y = time * 0.12 + targetX
        wire.rotation.x = targetY * 0.5
        ring.rotation.z = time * 0.2
        ring2.rotation.y = -time * 0.15

        const pulse = Math.sin(time * 1.5) * 0.5 + 0.5
        violetLight.intensity = 2.5 + pulse * 1.5
        cyanLight.intensity = 1.5 + (1 - pulse) * 1.5
        dotMat.opacity = 0.6 + pulse * 0.3

        renderer.render(scene, camera)
      }
      animate()
    }

    init()

    return () => { mounted = false }
  }, [])

  return <canvas id="globe-canvas" ref={canvasRef} />
}
