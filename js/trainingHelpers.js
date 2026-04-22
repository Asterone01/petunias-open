// ─── Training / Attendance Helpers ───────────────────────────────────────────

const TRAININGS_KEY   = 'petunias-trainings';
const ATTENDANCE_KEY  = 'petunias-attendance';

function getTrainings() {
  try { return JSON.parse(localStorage.getItem(TRAININGS_KEY)) || []; } catch { return []; }
}
function saveTrainings(list) { localStorage.setItem(TRAININGS_KEY, JSON.stringify(list)); }

function getAttendance() {
  try { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || []; } catch { return []; }
}
function saveAttendance(list) { localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list)); }

// ─── Training record ──────────────────────────────────────────────────────────
// {
//   id, titulo, fecha (ISO timestamp), duracionMin, categoria,
//   lugar, coachId, coachName, playerIds: [], exercises: [{ nombre, descripcion, duracionMin }],
//   notas, createdAt
// }
function createTraining({ titulo, fecha, duracionMin, categoria, lugar, coachId, coachName, playerIds, exercises, notas }) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    titulo: titulo || 'Entrenamiento',
    fecha: fecha || Date.now(),
    duracionMin: Number(duracionMin) || 60,
    categoria: categoria || 'Libre',
    lugar: lugar || '',
    coachId: coachId || null,
    coachName: coachName || '',
    playerIds: Array.isArray(playerIds) ? playerIds : [],
    exercises: Array.isArray(exercises) ? exercises : [],
    notas: notas || '',
    createdAt: Date.now(),
  };
}

// ─── Attendance record ───────────────────────────────────────────────────────
// { trainingId, playerId, status: 'presente' | 'ausente' | 'justificado', notas, recordedAt }
function setPlayerAttendance(trainingId, playerId, status, notas = '') {
  const all = getAttendance();
  const idx = all.findIndex(a => a.trainingId === trainingId && a.playerId === playerId);
  const record = { trainingId, playerId, status, notas, recordedAt: Date.now() };
  if (idx >= 0) all[idx] = record; else all.push(record);
  saveAttendance(all);
  return record;
}

function getAttendanceForTraining(trainingId) {
  return getAttendance().filter(a => a.trainingId === trainingId);
}

function getAttendanceForPlayer(playerId) {
  return getAttendance().filter(a => a.playerId === playerId);
}

function getPlayerAttendanceStats(playerId, { sinceTs = null } = {}) {
  const recs = getAttendanceForPlayer(playerId).filter(r => !sinceTs || r.recordedAt >= sinceTs);
  const presentes     = recs.filter(r => r.status === 'presente').length;
  const ausentes      = recs.filter(r => r.status === 'ausente').length;
  const justificados  = recs.filter(r => r.status === 'justificado').length;
  const total = recs.length;
  const rate = total ? Math.round((presentes / total) * 100) : 0;
  return { total, presentes, ausentes, justificados, rate };
}

Object.assign(window, {
  TRAININGS_KEY, ATTENDANCE_KEY,
  getTrainings, saveTrainings,
  getAttendance, saveAttendance,
  createTraining, setPlayerAttendance,
  getAttendanceForTraining, getAttendanceForPlayer, getPlayerAttendanceStats,
});
