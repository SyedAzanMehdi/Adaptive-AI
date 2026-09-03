import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { prefersReducedMotion } from "../../lib/anim";
import { useThemeStore } from "../../stores/theme";

function Centerpiece({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.7, 1]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.55} />
    </mesh>
  );
}

function ParallaxRig({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const k = Math.min(1, delta * 2.2);
    group.current.rotation.y += (state.pointer.x * 0.25 - group.current.rotation.y) * k;
    group.current.rotation.x += (-state.pointer.y * 0.15 - group.current.rotation.x) * k;
  });
  return <group ref={group}>{children}</group>;
}

/** Ambient 3D backdrop: floating geometry with pointer parallax.
 *  Renders nothing for reduced-motion users. */
export default function HeroScene() {
  const theme = useThemeStore((s) => s.theme);
  if (prefersReducedMotion()) return null;
  const dark = theme !== "light";
  const wire = dark ? "#a3a3a3" : "#404040";
  const mid = dark ? "#737373" : "#525252";
  const soft = dark ? "#a3a3a3" : "#737373";
  const bright = dark ? "#e5e5e5" : "#171717";
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color={soft} />
      <ParallaxRig>
        <Centerpiece color={wire} />
        <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.4}>
          <mesh position={[-2.8, 1.3, -1]}>
            <torusGeometry args={[0.5, 0.18, 16, 40]} />
            <meshStandardMaterial color={soft} roughness={0.35} metalness={0.4} />
          </mesh>
        </Float>
        <Float speed={2.1} rotationIntensity={0.9} floatIntensity={1.1}>
          <mesh position={[2.9, -1.2, -0.6]}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color={mid} roughness={0.3} metalness={0.5} flatShading />
          </mesh>
        </Float>
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.8}>
          <mesh position={[2.2, 1.7, -1.4]}>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial color={bright} roughness={0.2} metalness={0.6} />
          </mesh>
        </Float>
      </ParallaxRig>
    </Canvas>
  );
}
