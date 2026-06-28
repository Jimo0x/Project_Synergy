'use client'

import { useEffect, useRef } from 'react'
import type { Mesh } from 'three'


export default function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return

    let mounted = true
    let mouseX = 0, mouseY = 0

    const init = async () => {
      const THREE = await import('three')

      if (!mounted) return

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(0, 0, 6)

      const shapes: Mesh[] = []
      const geometries = [
        new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8),
        new THREE.IcosahedronGeometry(0.6, 0),
        new THREE.OctahedronGeometry(0.55),
        new THREE.TorusGeometry(0.5, 0.2, 16, 32),
        new THREE.DodecahedronGeometry(0.45),
      ]

      const colors = [0x8B5CF6, 0x06B6D4, 0xA78BFA, 0x22D3EE, 0x7C3AED]

      const positions = [
        { x: -2.5, y: 1.5, z: -2 },
        { x: 2.8, y: -1.8, z: -1 },
        { x: -1.8, y: -2.2, z: -3 },
        { x: 2.2, y: 2, z: -2.5 },
        { x: 0, y: 0, z: -4 },
      ]

      geometries.forEach((geo, i) => {
        const mat = new THREE.MeshPhysicalMaterial({
          color: colors[i],
          wireframe: true,
          transparent: true,
          opacity: 0.12 + Math.random() * 0.1,
          metalness: 0.8,
          roughness: 0.2,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(positions[i].x, positions[i].y, positions[i].z)
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
        scene.add(mesh)
        shapes.push(mesh)

        const innerMat = new THREE.MeshPhysicalMaterial({
          color: colors[i],
          transparent: true,
          opacity: 0.04,
          metalness: 0.3,
          roughness: 0.6,
        })
        const inner = new THREE.Mesh(geo.clone(), innerMat)
        inner.position.copy(mesh.position)
        inner.scale.set(0.85, 0.85, 0.85)
        scene.add(inner)
        shapes.push(inner)
      })

      const ambient = new THREE.AmbientLight(0x1a0a2e, 1)
      scene.add(ambient)

      const pointLight1 = new THREE.PointLight(0x8B5CF6, 2, 10)
      pointLight1.position.set(-3, 2, 2)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0x06B6D4, 2, 10)
      pointLight2.position.set(3, -2, 2)
      scene.add(pointLight2)

      const resizeHandler = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', resizeHandler)

      const mouseHandler = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2
      }
      document.addEventListener('mousemove', mouseHandler)

      let time = 0
      function animate() {
        if (!mounted) return
        requestAnimationFrame(animate)
        time += 0.008

        shapes.forEach((mesh, i) => {
          mesh.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1)
          mesh.rotation.y += 0.005 * (i % 3 === 0 ? 1 : -1)
          mesh.rotation.z += 0.002

          const idx = Math.floor(i / 2)
          if (idx < positions.length) {
            const baseX = positions[idx].x
            const baseY = positions[idx].y
            mesh.position.x = baseX + Math.sin(time * 0.3 + idx) * 0.3 + mouseX * 0.15
            mesh.position.y = baseY + Math.cos(time * 0.4 + idx) * 0.3 + mouseY * 0.15
          }
        })

        pointLight1.intensity = 1.5 + Math.sin(time * 1.2) * 0.8
        pointLight2.intensity = 1.5 + Math.cos(time * 1.3) * 0.8

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('resize', resizeHandler)
        document.removeEventListener('mousemove', mouseHandler)
      }
    }

    const cleanup = init().catch(() => {})

    return () => {
      mounted = false
      cleanup.then(fn => typeof fn === 'function' && fn())
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
