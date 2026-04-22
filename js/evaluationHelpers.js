// ─── Coach Evaluations ───────────────────────────────────────────────────────
// One record per evaluation — stores slider values, focus areas, notes.
// Allows tracking player progress month over month.

const EVALUATIONS_KEY = 'petunias-evaluations';

function getEvaluations() {
  try { return JSON.parse(localStorage.getItem(EVALUATIONS_KEY)) || []; } catch { return []; }
}
function saveEvaluations(list) { localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(list)); }

// {
//   id, playerId, coachId, coachName, fecha (timestamp),
//   attrs: { derecha, reves, saque, volea, velocidad, mentalidad, slice, tecnica }, // 0-10
//   focusAreas: [strings],
//   fortalezas: string, debilidades: string, notas: string,
// }
function createEvaluation({ playerId, coachId, coachName, fecha, attrs, focusAreas, fortalezas, debilidades, notas }) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    playerId,
    coachId: coachId || null,
    coachName: coachName || '',
    fecha: fecha || Date.now(),
    attrs: attrs || {},
    focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
    fortalezas: fortalezas || '',
    debilidades: debilidades || '',
    notas: notas || '',
  };
}

function getEvaluationsForPlayer(playerId) {
  return getEvaluations()
    .filter(e => e.playerId === playerId)
    .sort((a,b) => b.fecha - a.fecha);
}

Object.assign(window, {
  EVALUATIONS_KEY,
  getEvaluations, saveEvaluations, createEvaluation, getEvaluationsForPlayer,
});
