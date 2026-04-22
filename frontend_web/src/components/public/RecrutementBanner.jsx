import { useNavigate } from 'react-router-dom';
import DS from '../../design/luxe';

export default function RecrutementBanner({ secteur = null }) {
  const navigate = useNavigate();
  const label = secteur
    ? `Des entreprises du secteur ${secteur} recrutent en ce moment`
    : 'Des entreprises recrutent en ce moment';

  return (
    <div
      onClick={() => navigate(secteur ? `/recrutement?secteur=${secteur}` : '/recrutement')}
      style={{
        background: DS.goldLight, borderBottom: `1px solid #EDE8D4`,
        padding: '0 clamp(16px,4vw,48px)', height: DS.bannerH,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, cursor: 'pointer', transition: 'background .15s',
        fontFamily: DS.font,
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F0EAD2'}
      onMouseLeave={e => e.currentTarget.style.background = DS.goldLight}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.gold, boxShadow: `0 0 8px rgba(201,169,110,0.7)`, flexShrink: 0 }} />
      <span style={{ fontSize: 12.5, color: '#7A6840', letterSpacing: '-0.01em' }}>{label}</span>
      <span style={{ fontSize: 12.5, color: '#5A4820', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
        Voir les offres
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span>
    </div>
  );
}
