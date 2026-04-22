// ─── Dashboard Helpers ───────────────────────────────────────────────────────
// Modular dashboard: layouts persisted per user (or 'guest').
// Layout = array of widget keys in desired order.

const DASHBOARD_KEY = 'petunias-dashboard-layouts';

function getAllLayouts() {
  try { return JSON.parse(localStorage.getItem(DASHBOARD_KEY)) || {}; }
  catch { return {}; }
}
function saveAllLayouts(obj) {
  localStorage.setItem(DASHBOARD_KEY, JSON.stringify(obj));
}

function layoutKeyFor(user) {
  if (!user) return 'guest';
  if (user.isAdmin) return 'admin:' + (user.id || user.username || 'root');
  if (user.isCoach) return 'coach:' + (user.id || user.username);
  return 'player:' + (user.id || user.username);
}

function getDashboardLayout(user) {
  const all = getAllLayouts();
  const key = layoutKeyFor(user);
  if (all[key] && Array.isArray(all[key])) return all[key];
  return defaultLayoutFor(user);
}

function saveDashboardLayout(user, list) {
  const all = getAllLayouts();
  all[layoutKeyFor(user)] = list;
  saveAllLayouts(all);
}

// ── Widget catalog ──────────────────────────────────────────────────────────
// Each entry: { key, title, icon, scope: 'all'|'admin'|'coach'|'player', description }
const WIDGET_CATALOG = [
  { key:'welcome',     title:'Bienvenida',         icon:'👋', scope:'all',    desc:'Saludo + rating personal' },
  { key:'myStats',     title:'Mis estadísticas',   icon:'📊', scope:'player', desc:'Rating, W/L, racha' },
  { key:'myRating',    title:'Mi evolución ELO',   icon:'📈', scope:'player', desc:'Mini-gráfica de los últimos movimientos' },
  { key:'nextTraining',title:'Próximo entrenamiento', icon:'🎾', scope:'all', desc:'El siguiente entrenamiento programado' },
  { key:'myEvaluation',title:'Última evaluación',  icon:'📋', scope:'player', desc:'Tu evaluación más reciente' },
  { key:'top5',        title:'Top 5 ranking',      icon:'🏆', scope:'all',    desc:'Los 5 primeros del ranking global' },
  { key:'recentMatches',title:'Partidos recientes',icon:'⚔️', scope:'all',    desc:'Últimos 5 partidos registrados' },
  { key:'news',        title:'Últimas noticias',   icon:'📰', scope:'all',    desc:'Feed corto de noticias/torneos' },
  { key:'monthMedals', title:'Medallas del mes',   icon:'🏅', scope:'all',    desc:'Ganadores del mes actual' },
  { key:'totals',      title:'Totales globales',   icon:'🧮', scope:'admin',  desc:'Jugadores, partidos, torneos, entrenos' },
  { key:'adminQuick',  title:'Accesos rápidos',    icon:'⚡', scope:'admin',  desc:'Atajos a tareas de admin' },
  { key:'coachTasks',  title:'Pendientes coach',   icon:'📝', scope:'coach',  desc:'Próximos entrenamientos que gestionas' },
  { key:'attendance',  title:'Asistencia reciente',icon:'✅', scope:'all',    desc:'Asistencias de los últimos días' },
  { key:'calendar',    title:'Agenda',             icon:'📅', scope:'all',    desc:'Próximos eventos (torneos + entrenos)' },
];

function widgetsAvailableFor(user) {
  const isAdmin = !!user?.isAdmin;
  const isCoach = !!user?.isCoach;
  const isPlayer = !!user && !isAdmin; // coach or linked player still "has stats"
  return WIDGET_CATALOG.filter(w => {
    if (w.scope === 'all') return true;
    if (w.scope === 'admin') return isAdmin;
    if (w.scope === 'coach') return isAdmin || isCoach;
    if (w.scope === 'player') return !!user;
    return true;
  });
}

function defaultLayoutFor(user) {
  if (!user) return ['welcome','top5','news','monthMedals'];
  if (user.isAdmin) return ['welcome','totals','adminQuick','top5','recentMatches','news','monthMedals'];
  if (user.isCoach) return ['welcome','coachTasks','nextTraining','top5','recentMatches','monthMedals'];
  return ['welcome','myStats','myRating','nextTraining','myEvaluation','top5','news'];
}

Object.assign(window, {
  DASHBOARD_KEY,
  getDashboardLayout, saveDashboardLayout,
  WIDGET_CATALOG, widgetsAvailableFor, defaultLayoutFor,
});
