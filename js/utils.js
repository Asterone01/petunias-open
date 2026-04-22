const ATTRIBUTES = [
  { name: 'Derecha',    key: 'derecha',    icon: '→' },
  { name: 'Revés',      key: 'reves',      icon: '←' },
  { name: 'Saque',      key: 'saque',      icon: '↑' },
  { name: 'Volea',      key: 'volea',      icon: '◎' },
  { name: 'Velocidad',  key: 'velocidad',  icon: '⚡' },
  { name: 'Mentalidad', key: 'mentalidad', icon: '◈' },
  { name: 'Slice',      key: 'slice',      icon: '↺' },
  { name: 'Técnica',    key: 'tecnica',    icon: '✦' },
];

function getFifaRating(player) {
  const sum = ATTRIBUTES.reduce((s, a) => s + (player[a.key] || 0), 0);
  const avg = sum / ATTRIBUTES.length;
  return Math.round(40 + (avg - 1) * (59 / 9));
}

function getTier(rating) {
  if (rating >= 85) return { label: 'ELITE',    color: '#FFD700' };
  if (rating >= 75) return { label: 'PRO',      color: '#00ff97' };
  if (rating >= 65) return { label: 'ADVANCED', color: '#00d4ff' };
  if (rating >= 50) return { label: 'MEDIUM',   color: '#ffaa00' };
  return                    { label: 'ROOKIE',   color: '#ff6b6b' };
}

function getChartData(player) {
  return ATTRIBUTES.map(a => ({ name: a.name, value: player[a.key] || 0 }));
}
