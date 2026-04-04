// ── Tarifs Freample Com — source unique partagée entre dashboard patron et page publique ──
// Les prix sont stockés en localStorage pour persister les modifications du patron.
// Clé : 'freample_com_tarifs'

const TARIFS_DEFAULT = [
  { cat:'Montage vidéo', items:[
    { id:'mv1', nom:'TikTok / Reel (15-60s)', prix:49 },
    { id:'mv2', nom:'YouTube Short (60s-3min)', prix:89 },
    { id:'mv3', nom:'Vidéo YouTube (5-15min)', prix:199 },
    { id:'mv4', nom:'Clip promotionnel (30s-2min)', prix:349 },
    { id:'mv5', nom:'Pack 5 TikToks', prix:199 },
    { id:'mv6', nom:'Pack 10 TikToks', prix:349 },
    { id:'mv7', nom:'Pack 20 TikToks', prix:599 },
  ]},
  { cat:'Réseaux sociaux', items:[
    { id:'rs1', nom:'Gestion 1 réseau / mois', prix:299 },
    { id:'rs2', nom:'Gestion 3 réseaux / mois', prix:699 },
    { id:'rs3', nom:'Stratégie + audit complet', prix:149 },
    { id:'rs4', nom:'Shooting photo (10 visuels)', prix:249 },
  ]},
  { cat:'Design graphique', items:[
    { id:'dg1', nom:'Logo simple', prix:99 },
    { id:'dg2', nom:'Logo + charte graphique', prix:249 },
    { id:'dg3', nom:'Pack 10 visuels réseaux', prix:149 },
    { id:'dg4', nom:'Flyer / Affiche A4', prix:69 },
    { id:'dg5', nom:'Carte de visite (recto-verso)', prix:49 },
  ]},
  { cat:'Publicité en ligne', items:[
    { id:'pl1', nom:'Setup campagne (1 plateforme)', prix:199 },
    { id:'pl2', nom:'Gestion Ads mensuelle', prix:399 },
    { id:'pl3', nom:'Audit + recommandations', prix:99 },
  ]},
];

const STORAGE_KEY = 'freample_com_tarifs';

export function getTarifs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return TARIFS_DEFAULT;
}

export function saveTarifs(tarifs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarifs));
  } catch (e) {}
}

export function resetTarifs() {
  localStorage.removeItem(STORAGE_KEY);
  return TARIFS_DEFAULT;
}

export { TARIFS_DEFAULT };
