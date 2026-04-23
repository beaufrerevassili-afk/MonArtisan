import React, { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onSave, width = 340, height = 180 }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Set canvas resolution for retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function stop(e) {
    if (e) e.preventDefault();
    setDrawing(false);
    if (hasDrawn && onSave) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    if (onSave) onSave('');
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Signature du client</div>
      <div style={{ border: '2px dashed #E8E6E1', borderRadius: 12, overflow: 'hidden', background: '#FAFAF8', position: 'relative', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
        {!hasDrawn && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#BFBFBF', fontSize: 14 }}>
            ✍️ Signez ici avec le doigt
          </div>
        )}
      </div>
      <button onClick={clear} type="button" style={{ marginTop: 6, background: 'none', border: 'none', color: '#A68B4B', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        Effacer la signature
      </button>
    </div>
  );
}
