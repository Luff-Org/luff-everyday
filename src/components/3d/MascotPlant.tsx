"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useThemeStore } from "@/store/useThemeStore";
import { THEMES } from "@/lib/constants";

/**
 * Mouse Tracking
 */
function useMouse() {
  const mouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return mouse;
}

/**
 * Cat Ears
 */
function Ears({ color }: { color: string }) {
  const innerColor = new THREE.Color(color).multiplyScalar(1.2).getStyle();
  return (
    <group position={[0, 0, -0.2]}>
      {/* Left Ear */}
      <group position={[-0.65, 0.7, 0]} rotation={[0, 0, 0.55]}>
        <mesh>
          <coneGeometry args={[0.4, 0.7, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.05, 0.08]} scale={[0.6, 0.7, 0.1]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color={innerColor} />
        </mesh>
      </group>
      {/* Right Ear */}
      <group position={[0.65, 0.7, 0]} rotation={[0, 0, -0.55]}>
        <mesh>
          <coneGeometry args={[0.4, 0.7, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.05, 0.08]} scale={[0.6, 0.7, 0.1]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color={innerColor} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Whiskers
 */
function Whiskers({ color }: { color: string }) {
  const yPositions = [0.12, 0, -0.12];
  const spread = [0.15, 0, -0.15];

  return (
    <>
      {/* Left Whiskers */}
      <group position={[-0.6, -0.12, 0.7]}>
        {yPositions.map((y, i) => (
          <mesh
            key={i}
            position={[0, y, 0]}
            rotation={[0, 0, Math.PI / 2 - spread[i]]} // 👈 flipped
          >
            <cylinderGeometry args={[0.01, 0.01, 0.8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>

      {/* Right Whiskers */}
      <group position={[0.6, -0.12, 0.7]}>
        {yPositions.map((y, i) => (
          <mesh
            key={i}
            position={[0, y, 0]}
            rotation={[0, 0, Math.PI / 2 + spread[i]]} // 👈 opposite
          >
            <cylinderGeometry args={[0.01, 0.01, 0.8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/**
 * Cat Character
 */
function Character({
  mouse,
}: {
  mouse: React.MutableRefObject<THREE.Vector2>;
}) {
  const group = useRef<THREE.Group>(null);
  const { theme: themeId } = useThemeStore();
  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const [isSad, setIsSad] = React.useState(false);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftPupil = useRef<THREE.Mesh>(null);
  const rightPupil = useRef<THREE.Mesh>(null);
  const blinkState = useRef({ nextBlink: 0, blinking: false });
  const hitProgress = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (group.current) {
      group.current.position.x += (0 - group.current.position.x) * 0.1;
      let targetY = Math.sin(t * 1.5) * 0.05;
      if (isSad) {
        hitProgress.current += delta * 15;
        targetY = -0.12 * Math.abs(Math.sin(hitProgress.current * 2));
        group.current.rotation.x = -0.15 * Math.sin(hitProgress.current);
      } else {
        hitProgress.current = 0;
        group.current.rotation.x += (0 - group.current.rotation.x) * 0.1;
      }
      group.current.position.y += (targetY - group.current.position.y) * 0.2;
    }

    if (!isSad && t > blinkState.current.nextBlink) {
      blinkState.current.blinking = true;
      if (t > blinkState.current.nextBlink + 0.15) {
        blinkState.current.blinking = false;
        blinkState.current.nextBlink = t + Math.random() * 4 + 1.5;
      }
    }

    const blinkScale = isSad ? 0.01 : blinkState.current.blinking ? 0.05 : 1;
    if (leftEye.current)
      leftEye.current.scale.y = THREE.MathUtils.lerp(
        leftEye.current.scale.y,
        blinkScale,
        0.5,
      );
    if (rightEye.current)
      rightEye.current.scale.y = THREE.MathUtils.lerp(
        rightEye.current.scale.y,
        blinkScale,
        0.5,
      );

    const maxX = 0.08;
    const maxY = 0.05;
    [leftPupil, rightPupil].forEach((pupil) => {
      if (!pupil.current) return;
      if (isSad) {
        pupil.current.scale.setScalar(0);
      } else {
        pupil.current.scale.setScalar(1);
        const targetX = THREE.MathUtils.clamp(
          mouse.current.x * maxX,
          -0.07,
          0.07,
        );
        const targetY = THREE.MathUtils.clamp(
          mouse.current.y * maxY,
          -0.04,
          0.04,
        );
        pupil.current.position.x += (targetX - pupil.current.position.x) * 0.15;
        pupil.current.position.y += (targetY - pupil.current.position.y) * 0.15;
      }
    });

    state.camera.position.x +=
      (mouse.current.x * 0.4 - state.camera.position.x) * 0.05;
    state.camera.position.y +=
      (1.2 + mouse.current.y * 0.25 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  const handleInteraction = () => {
    if (isSad) return;
    setIsSad(true);
    setTimeout(() => setIsSad(false), 1000);
  };

  const stripeColor = new THREE.Color(currentTheme.primary)
    .multiplyScalar(0.85)
    .getStyle();

  return (
    <group
      ref={group}
      scale={0.8}
      onPointerDown={(e) => {
        e.stopPropagation();
        handleInteraction();
      }}
    >
      {/* BODY */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial color={currentTheme.primary} />
      </mesh>

      {/* STRIPES */}
      <group position={[0, 0.5, 0.6]} rotation={[-0.4, 0, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.04, 0.35, 8, 8]} />
          <meshStandardMaterial color={stripeColor} />
        </mesh>
        <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, 0.2]}>
          <capsuleGeometry args={[0.04, 0.35, 8, 8]} />
          <meshStandardMaterial color={stripeColor} />
        </mesh>
        <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.04, 0.35, 8, 8]} />
          <meshStandardMaterial color={stripeColor} />
        </mesh>
      </group>

      <Ears color={currentTheme.primary} />
      <Whiskers color={currentTheme.sub} />

      {/* 👀 EYES */}
      <group position={[0, 0.05, 0.75]}>
        <mesh ref={leftEye} position={[-0.28, 0, 0.05]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
          <mesh ref={leftPupil} position={[0, 0, 0.16]}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
        <mesh ref={rightEye} position={[0.28, 0, 0.05]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
          <mesh ref={rightPupil} position={[0, 0, 0.16]}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
      </group>

      {/* NOSE */}
      <mesh position={[0, -0.08, 0.9]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.08]} />
        <meshStandardMaterial color={currentTheme.sub} roughness={0.1} />
      </mesh>

      {/* DYNAMIC MOUTH */}
      <group position={[0, isSad ? -0.28 : -0.22, 0.95]}>
        {isSad ? (
          <mesh>
            <torusGeometry args={[0.16, 0.045, 16, 64, Math.PI]} />
            <meshStandardMaterial color={currentTheme.sub} />
          </mesh>
        ) : (
          <group>
            {/* Left */}
            <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.14, 0.02, 16, 64, Math.PI / 1.1]} />
              <meshStandardMaterial color={currentTheme.sub} />
            </mesh>

            {/* Right */}
            <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.14, 0.02, 16, 64, Math.PI / 1.1]} />
              <meshStandardMaterial color={currentTheme.sub} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

/**
 * Main Component
 */
export default function MascotPlant() {
  const mouse = useMouse();

  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas shadows camera={{ position: [0, 1.2, 5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />

        <Character mouse={mouse} />

        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
