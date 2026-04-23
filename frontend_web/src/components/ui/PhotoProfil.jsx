import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { isDemo as _isDemo } from '../../utils/storage';

export default function PhotoProfil({ size = 64, editable = true }) {
  const isDemo = _isDemo();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (isDemo) return;
    api.get('/profile-photo').then(({ data }) => { if (data.photo) setPhoto(data.photo); }).catch(() => {});
  }, []);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      // Resize to max 150x150
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
        canvas.width = 150; canvas.height = 150;
        canvas.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, 150, 150);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
        if (!isDemo) {
          api.put('/profile-photo', { photo: dataUrl }).catch(() => {});
        }
        setLoading(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  const initials = '?';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: photo ? 'none' : '#E8E6E1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: editable ? 'pointer' : 'default', border: '2px solid #E8E6E1' }}
        onClick={() => editable && fileRef.current?.click()}>
        {photo ? (
          <img src={photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: size * 0.35, fontWeight: 700, color: '#636363' }}>{initials}</span>
        )}
      </div>
      {editable && (
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: '#A68B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, cursor: 'pointer', border: '2px solid #fff' }}
          onClick={() => fileRef.current?.click()}>
          📷
        </div>
      )}
      {loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>...</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}
