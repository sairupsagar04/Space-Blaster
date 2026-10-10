import React, { useState } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import GameScene from './GameScene';
import { Target, ShieldAlert } from 'lucide-react';

function App() {
  const { videoRef, handData } = useHandTracking();
  const [score, setScore] = useState(0);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', color: '#e2e8f0', fontFamily: '"Share Tech Mono", monospace', letterSpacing: '0.05em' }}>
      
      {/* 3D Core Layer */}
      <GameScene handData={handData} onScore={() => setScore(s => s + 100)} />

      {/* Sci-Fi HUD Layer Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px' }}>
        
        {/* Upper Command Console */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          
          {/* System Telemetry */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.5))', borderLeft: '4px solid #06b6d4', borderTop: '1px solid rgba(6,182,212,0.2)', borderRight: '1px solid rgba(6,182,212,0.2)', borderBottom: '1px solid rgba(6,182,212,0.2)', padding: '16px 24px', borderRadius: '0 12px 12px 0', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ color: '#06b6d4', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tactical Link V1.0</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: handData.detected ? '#10b981' : '#f43f5e', animate: 'pulse 2s infinite' }} />
              SYS_STATUS: {handData.detected ? 'NEURAL LOCK ACTIVE' : 'CALIBRATING VISION BIOMETRICS...'}
            </div>
          </div>

          {/* Central Holographic Score Ticker */}
          <div style={{ textAlign: 'center', background: 'rgba(2, 6, 23, 0.75)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '12px 40px', borderRadius: '16px', backdropFilter: 'blur(8px)', boxShadow: '0 0 20px rgba(234, 179, 8, 0.15)' }}>
            <div style={{ fontSize: '11px', color: '#eab308', textTransform: 'uppercase', marginBottom: '2px' }}>Sector Confirmed Kills</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>
              {score.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Weapons Heat Sync readouts */}
          <div style={{ background: 'linear-gradient(225deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.5))', borderRight: '4px solid ' + (handData.isFiring ? '#ef4444' : '#10b981'), padding: '16px 24px', borderRadius: '12px 0 0 12px', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(16,185,129,0.2)', borderBottom: '1px solid rgba(16,185,129,0.2)', borderLeft: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>WEAPONS ARRAY MATRIX</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: handData.isFiring ? '#ef4444' : '#10b981', textAlign: 'right', marginTop: '2px' }}>
              {handData.isFiring ? '⚡ ALTERNATING_BOOST_FIRE' : '⚡ CAPACITORS_CHARGED'}
            </div>
          </div>
        </div>

        {/* Center Tech Crosshair HUD Sight lines */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Reticle Brackets */}
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', borderTop: '2px solid #06b6d4', borderLeft: '2px solid #06b6d4' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', borderTop: '2px solid #06b6d4', borderRight: '2px solid #06b6d4' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', borderBottom: '2px solid #06b6d4', borderLeft: '2px solid #06b6d4' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', borderBottom: '2px solid #06b6d4', borderRight: '2px solid #06b6d4' }} />
            
            <Target size={44} color={handData.isFiring ? '#ef4444' : '#06b6d4'} style={{ transform: handData.isFiring ? 'scale(1.1) rotate(45deg)' : 'scale(1)', transition: 'all 0.1s ease', margin: 'auto' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '12px', background: 'rgba(2,6,23,0.8)', padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(100,116,139,0.2)' }}>
            RAD_COORD // X: {handData.x.toFixed(2)} Y: {handData.y.toFixed(2)}
          </div>
        </div>

        {/* Low Margin Navigation warning items */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {!handData.detected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', animation: 'pulse 1.5s infinite' }}>
              <ShieldAlert size={16} /> PILOT ENGAGEMENT TIMEOUT: LOCATING CAMERA INPUTS
            </div>
          )}
        </div>
      </div>

      {/* Biometric Webcam Mirror Box */}
      <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 30, width: '160px', height: '120px', backgroundColor: '#020617', border: '2px solid #1e293b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.7 }} muted playsInline />
        <div style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '9px', color: '#38bdf8', fontWeight: 'bold' }}>CAM_FEED_MIRROR</div>
      </div>
    </div>
  );
}

export default App;