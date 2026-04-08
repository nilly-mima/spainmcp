'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

const ORANGE = '#2563EB'
const ORANGE_LIGHT = '#60A5FA'
const NODE_BG = '#f5f0eb'

const NODES = [
  { label: 'GH', name: 'GitHub', angle: Math.PI * 0.5, r: 3.2 },
  { label: 'SL', name: 'Slack', angle: Math.PI * 0.75, r: 3.5 },
  { label: 'FS', name: 'Filesystem', angle: Math.PI * 1.0, r: 3.0 },
  { label: 'BS', name: 'Brave Search', angle: Math.PI * 1.3, r: 3.4 },
  { label: 'PG', name: 'Postgres', angle: Math.PI * 1.6, r: 3.1 },
  { label: 'YT', name: 'YouTube', angle: Math.PI * 1.85, r: 3.3 },
  { label: 'NO', name: 'Notion', angle: Math.PI * 0.05, r: 3.2 },
  { label: 'PW', name: 'Playwright', angle: Math.PI * 0.3, r: 3.5 },
]

/* ── Traveling dot along a line ── */
function TravelDot({ start, end, speed, delay }: { start: THREE.Vector3; end: THREE.Vector3; speed: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const progress = useRef(delay % 1)

  useFrame((_, delta) => {
    progress.current += delta * speed
    if (progress.current > 1) progress.current = 0
    const t = progress.current
    ref.current.position.lerpVectors(start, end, t)
    // Pulse size
    const pulse = Math.sin(t * Math.PI)
    ref.current.scale.setScalar(0.6 + pulse * 0.4)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={ORANGE} />
    </mesh>
  )
}

/* ── Connection line with multiple dots ── */
function Connection({ from, to, index }: { from: THREE.Vector3; to: THREE.Vector3; index: number }) {
  const curve = useMemo(() => {
    // Slight curve via midpoint offset
    const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
    mid.z += 0.3 + Math.sin(index * 1.5) * 0.2
    return new THREE.QuadraticBezierCurve3(from, mid, to)
  }, [from, to, index])

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.012, 6, false), [curve])

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color={ORANGE} transparent opacity={0.18} />
      </mesh>
      <TravelDot start={from} end={to} speed={0.25 + index * 0.03} delay={index * 0.12} />
      <TravelDot start={from} end={to} speed={0.2 + index * 0.02} delay={0.5 + index * 0.08} />
    </group>
  )
}

/* ── Node sphere with label ── */
function Node({ position, label, name }: { position: THREE.Vector3; label: string; name: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.15}>
      <group position={position}>
        {/* Shadow/glow */}
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[0.42, 32]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.04} />
        </mesh>
        {/* Outer ring */}
        <mesh>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color={hovered ? ORANGE_LIGHT : '#e7e5e4'} />
        </mesh>
        {/* Inner circle */}
        <mesh
          position={[0, 0, 0.01]}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <circleGeometry args={[0.35, 32]} />
          <meshBasicMaterial color={hovered ? ORANGE : NODE_BG} />
        </mesh>
        {/* Label text */}
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.18}
          color={hovered ? '#ffffff' : '#57534e'}

          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {label}
        </Text>
        {/* Name below */}
        <Text
          position={[0, -0.58, 0]}
          fontSize={0.12}
          color="#a8a29e"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
        {/* Sparkle decoration */}
        {hovered && (
          <mesh position={[0.35, 0.35, 0.02]}>
            <circleGeometry args={[0.04, 6]} />
            <meshBasicMaterial color={ORANGE} />
          </mesh>
        )}
      </group>
    </Float>
  )
}

/* ── Central hub ── */
function CentralHub() {
  const glowRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Pulsing glow
    const scale = 1 + Math.sin(t * 1.5) * 0.05
    glowRef.current.scale.set(scale, scale, 1)
    // Rotating ring
    ringRef.current.rotation.z = t * 0.3
  })

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.08} />
      </mesh>
      {/* Rotating ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.78, 0.82, 48]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.25} />
      </mesh>
      {/* Main sphere */}
      <mesh>
        <sphereGeometry args={[0.65, 48, 48]} />
        <MeshDistortMaterial
          color={ORANGE}
          emissive={ORANGE}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.1}
          distort={0.08}
          speed={2}
        />
      </mesh>
      {/* Inner bright */}
      <mesh position={[0, 0, 0.3]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0, 0.67]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        MCP
      </Text>
    </group>
  )
}

/* ── Sparkle decorations ── */
function Sparkles() {
  const ref = useRef<THREE.Group>(null!)

  const sparkles = useMemo(() => Array.from({ length: 6 }, () => ({
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 6,
    size: 0.04 + Math.random() * 0.06,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.2,
  })), [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.children.forEach((child, i) => {
      const s = sparkles[i]
      const pulse = 0.3 + Math.sin(t * s.speed + s.phase) * 0.7
      child.scale.setScalar(pulse)
    })
  })

  return (
    <group ref={ref}>
      {sparkles.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, -0.2]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[s.size, s.size]} />
          <meshBasicMaterial color="#a8a29e" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Floating particles ── */
function Particles({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2
      spd[i] = 0.001 + Math.random() * 0.003
    }
    return { positions: pos, speeds: spd }
  }, [count])

  useFrame(() => {
    const geo = ref.current.geometry
    const pos = geo.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i]
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={ORANGE_LIGHT} transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

/* ── Scene ── */
function Scene() {
  const groupRef = useRef<THREE.Group>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })

  const nodePositions = useMemo(() =>
    NODES.map(n => new THREE.Vector3(Math.cos(n.angle) * n.r, Math.sin(n.angle) * n.r, 0)),
    []
  )
  const center = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame(() => {
    // Gentle mouse parallax
    groupRef.current.rotation.y += (mouseRef.current.x * 0.15 - groupRef.current.rotation.y) * 0.02
    groupRef.current.rotation.x += (mouseRef.current.y * -0.08 - groupRef.current.rotation.x) * 0.02
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      {/* Invisible plane for mouse tracking */}
      <mesh
        visible={false}
        onPointerMove={(e) => {
          mouseRef.current.x = (e.point.x / 5)
          mouseRef.current.y = (e.point.y / 5)
        }}
      >
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial />
      </mesh>

      <group ref={groupRef}>
        <CentralHub />

        {NODES.map((node, i) => (
          <Node key={node.label} position={nodePositions[i]} label={node.label} name={node.name} />
        ))}

        {nodePositions.map((pos, i) => (
          <Connection key={i} from={center} to={pos} index={i} />
        ))}

        <Sparkles />
        <Particles count={50} />
      </group>
    </>
  )
}

/* ── Export ── */
export default function HeroScene() {
  return (
    <div className="w-full h-[520px] relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
