import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Center } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// 1. Individual Glowing Laser Beam Component
function LaserBolt({ position, id, onRemove }) {
  const boltRef = useRef();
  useFrame(() => {
    if (!boltRef.current) return;
    boltRef.current.position.z -= 0.6; // High velocity travel
    if (boltRef.current.position.z < -30) onRemove(id);
  });
  return (
    <mesh ref={boltRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1.2, 4]} />
      {/* Emissive + EmissiveIntensity makes it GLOW with Bloom enabled */}
      <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} />
    </mesh>
  );
}

// 2. Enemy Alien Target Component
function EnemyShip({ position, id, onRemove, lasers, onHit }) {
  const shipRef = useRef();
  
  useFrame(() => {
    if (!shipRef.current) return;
    shipRef.current.position.z += 0.12; // Hurtle towards screen faster
    shipRef.current.rotation.y += 0.04;
    shipRef.current.rotation.x += 0.01;

    // Laser Box Collision Approximation
    lasers.forEach((laser) => {
      const dx = Math.abs(shipRef.current.position.x - laser.pos[0]);
      const dy = Math.abs(shipRef.current.position.y - laser.pos[1]);
      if (dx < 0.7 && dy < 0.7 && Math.abs(shipRef.current.position.z - (laser.pos[2] - (3.0 - shipRef.current.position.z) * 1.5)) < 12) {
         if (shipRef.current.position.z < 2.5) {
            onHit(id);
         }
      }
    });

    if (shipRef.current.position.z > 5) onRemove(id);
  });

  return (
    <group ref={shipRef} position={position}>
      {/* Core Plasma Sphere */}
      <mesh>
        <octahedronGeometry args={[0.35]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Spinning Outer Ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 8, 24]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

// 3. Motion-Controlled Twin Blasters Component
function PlayerWeapon({ handData, onFire }) {
  const weaponRef = useRef();
  const lastFiredRef = useRef(0);

  useFrame((state) => {
    if (!weaponRef.current) return;

    const targetX = handData.detected ? handData.x * 2.8 : 0;
    const targetY = handData.detected ? (handData.y * 2.0) - 0.4 : -0.7;

    weaponRef.current.position.x = THREE.MathUtils.lerp(weaponRef.current.position.x, targetX, 0.15);
    weaponRef.current.position.y = THREE.MathUtils.lerp(weaponRef.current.position.y, targetY, 0.15);
    weaponRef.current.position.z = 2.8;

    weaponRef.current.rotation.y = THREE.MathUtils.lerp(weaponRef.current.rotation.y, -targetX * 0.15, 0.1);
    weaponRef.current.rotation.x = THREE.MathUtils.lerp(weaponRef.current.rotation.x, (targetY + 0.4) * 0.1, 0.1);

    if (handData.isFiring) {
      const now = state.clock.getElapsedTime();
      if (now - lastFiredRef.current > 0.12) {
        // Alternating Left / Right barrel muzzle fire coordinates
        const sideOffset = Math.sin(state.clock.getElapsedTime() * 40) > 0 ? 0.25 : -0.25;
        onFire([weaponRef.current.position.x + sideOffset, weaponRef.current.position.y - 0.1, weaponRef.current.position.z - 1.0]);
        lastFiredRef.current = now;
      }
    }
  });

  return (
    <group ref={weaponRef}>
      {/* Center housing block */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Left Laser Cannon Barrel */}
      <mesh position={[-0.25, -0.05, -0.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Right Laser Cannon Barrel */}
      <mesh position={[0.25, -0.05, -0.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Glowing Energy Condensers */}
      <mesh position={[0, -0.02, 0.1]}>
        <boxGeometry args={[0.15, 0.05, 0.4]} />
        <meshStandardMaterial color="#06b6d4" emissive="#00ffff" emissiveIntensity={handData.isFiring ? 5 : 1} toneMapped={false} />
      </mesh>
    </group>
  );
}

// 4. Immersive Static Cockpit HUD Frame Overlay Component
function StarshipCockpit() {
  return (
    <group position={[0, 0, 4.2]}>
      {/* Bottom Main Console Dashboard Dash */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[4, 0.6, 1]} />
        <meshStandardMaterial color="#020617" roughness={0.5} />
      </mesh>
      {/* Left Cockpit Structural Pillar Truss */}
      <mesh position={[-2.1, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.15, 4, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Right Cockpit Structural Pillar Truss */}
      <mesh position={[2.1, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.15, 4, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

export default function GameScene({ handData, onScore }) {
  const [lasers, setLasers] = useState([]);
  const [enemies, setEnemies] = useState([]);

  const handleFire = (spawnPosition) => {
    setLasers((prev) => [...prev, { id: Date.now() + Math.random(), pos: spawnPosition }]);
  };

  const handleRemoveLaser = (id) => setLasers((prev) => prev.filter((l) => l.id !== id));
  const handleRemoveEnemy = (id) => setEnemies((prev) => prev.filter((e) => e.id !== id));
  
  const handleEnemyHit = (id) => {
    onScore();
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const randomX = (Math.random() - 0.5) * 6;
      const randomY = (Math.random() - 0.5) * 3.5;
      setEnemies((prev) => [...prev, { id: Date.now() + Math.random(), pos: [randomX, randomY, -25] }]);
    }, 1200); // Higher velocity encounter speeds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 10, 5]} intensity={1.0} color="#ffffff" />
        
        <Stars radius={120} depth={40} count={2500} factor={5} saturation={0.8} fade speed={2} />

        {lasers.map((laser) => (
          <LaserBolt key={laser.id} id={laser.id} position={laser.pos} onRemove={handleRemoveLaser} />
        ))}

        {enemies.map((enemy) => (
          <EnemyShip key={enemy.id} id={enemy.id} position={enemy.pos} onRemove={handleRemoveEnemy} lasers={lasers} onHit={handleEnemyHit} />
        ))}

        <PlayerWeapon handData={handData} onFire={handleFire} />
        
        <StarshipCockpit />

        {/* 🚀 THE POST-PROCESSING NEON GLOW ENGINE LAYER */}
        <EffectComposer>
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.1} 
            luminanceSmoothing={0.9} 
            height={300} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}