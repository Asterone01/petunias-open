// ─── ELO Rating System ─────────────────────────────────────────────────────────

const ELO_K = 32;
const INITIAL_RATING = 1000;

// Category thresholds (ascenso/descenso automático)
const CATEGORY_THRESHOLDS = [
  { cat: 'A', min: 1600, max: Infinity },
  { cat: 'B', min: 1400, max: 1599 },
  { cat: 'C', min: 1200, max: 1399 },
  { cat: 'D', min: 1000, max: 1199 },
  { cat: 'E', min: 0,    max:  999 },
];

function getCategoryFromRating(rating) {
  const r = rating || INITIAL_RATING;
  return CATEGORY_THRESHOLDS.find(t => r >= t.min && r <= t.max)?.cat || 'E';
}

function ensurePlayerRating(player) {
  // Backfill old players that don't have rating/matches yet
  if (player.rating === undefined) player.rating = INITIAL_RATING;
  if (!Array.isArray(player.ratingHistory)) {
    player.ratingHistory = [{ date: player.createdAt || Date.now(), rating: player.rating, reason: 'inicial' }];
  }
  if (player.wins     === undefined) player.wins = 0;
  if (player.losses   === undefined) player.losses = 0;
  if (player.streak   === undefined) player.streak = 0;
  return player;
}

// Expected score (probability of winning)
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Returns the new ratings + delta for a match
function calculateElo(ratingA, ratingB, aWon) {
  const scoreA = aWon ? 1 : 0;
  const scoreB = aWon ? 0 : 1;
  const expA = expectedScore(ratingA, ratingB);
  const expB = expectedScore(ratingB, ratingA);
  const newA = Math.round(ratingA + ELO_K * (scoreA - expA));
  const newB = Math.round(ratingB + ELO_K * (scoreB - expB));
  return {
    newA, newB,
    deltaA: newA - ratingA,
    deltaB: newB - ratingB,
  };
}

// Applies match result to both players (mutates copies, returns new array)
function applyMatchToPlayers(players, match) {
  const pA = ensurePlayerRating({ ...players.find(p => p.id === match.playerAId) });
  const pB = ensurePlayerRating({ ...players.find(p => p.id === match.playerBId) });
  if (!pA.id || !pB.id) return { players, events: [] };

  const aWon = match.winnerId === pA.id;
  const { newA, newB, deltaA, deltaB } = calculateElo(pA.rating, pB.rating, aWon);
  const events = [];

  const oldCatA = pA.categoria;
  const oldCatB = pB.categoria;

  // Update A
  pA.rating = newA;
  pA.ratingHistory = [...pA.ratingHistory, { date: match.date, rating: newA, delta: deltaA, vs: pB.id, won: aWon }];
  if (aWon) { pA.wins++;   pA.streak = Math.max(0, pA.streak) + 1; }
  else      { pA.losses++; pA.streak = Math.min(0, pA.streak) - 1; }
  const newCatA = getCategoryFromRating(newA);
  if (newCatA !== oldCatA) {
    pA.categoria = newCatA;
    events.push({ type: newCatA < oldCatA ? 'ascenso' : 'descenso', playerId: pA.id, playerName: pA.nombre, from: oldCatA, to: newCatA });
  }

  // Update B
  pB.rating = newB;
  pB.ratingHistory = [...pB.ratingHistory, { date: match.date, rating: newB, delta: deltaB, vs: pA.id, won: !aWon }];
  if (!aWon) { pB.wins++;   pB.streak = Math.max(0, pB.streak) + 1; }
  else       { pB.losses++; pB.streak = Math.min(0, pB.streak) - 1; }
  const newCatB = getCategoryFromRating(newB);
  if (newCatB !== oldCatB) {
    pB.categoria = newCatB;
    events.push({ type: newCatB < oldCatB ? 'ascenso' : 'descenso', playerId: pB.id, playerName: pB.nombre, from: oldCatB, to: newCatB });
  }

  // Streak milestones (3, 5, 10)
  [pA, pB].forEach(p => {
    if ([3, 5, 10].includes(p.streak)) {
      events.push({ type: 'racha', playerId: p.id, playerName: p.nombre, streak: p.streak });
    }
  });

  // Build new players array
  const updated = players.map(p => p.id === pA.id ? pA : p.id === pB.id ? pB : p);

  // Match result event always goes first
  events.unshift({
    type: 'resultado',
    matchId: match.id,
    playerAId: pA.id, playerAName: pA.nombre, deltaA,
    playerBId: pB.id, playerBName: pB.nombre, deltaB,
    winnerId: match.winnerId, winnerName: aWon ? pA.nombre : pB.nombre,
    score: match.score,
  });

  return { players: updated, events };
}

// Reverts a match (used when deleting)
function revertMatchFromPlayers(players, match) {
  return players.map(p => {
    if (p.id !== match.playerAId && p.id !== match.playerBId) return p;
    const updated = ensurePlayerRating({ ...p });
    // Remove this match from history
    const idx = updated.ratingHistory.findIndex(h => h.date === match.date && h.vs && (h.vs === match.playerAId || h.vs === match.playerBId));
    if (idx > -1) {
      updated.ratingHistory = updated.ratingHistory.filter((_, i) => i !== idx);
    }
    // Recalculate rating/wins/losses from history
    updated.rating = updated.ratingHistory.length
      ? updated.ratingHistory[updated.ratingHistory.length - 1].rating
      : INITIAL_RATING;
    updated.wins = updated.ratingHistory.filter(h => h.won === true).length;
    updated.losses = updated.ratingHistory.filter(h => h.won === false).length;
    updated.categoria = getCategoryFromRating(updated.rating);
    return updated;
  });
}

// ─── Match record format ─────────────────────────────────────────────────────
// {
//   id, playerAId, playerBId, winnerId, score: "6-3, 6-4",
//   date: timestamp, confirmed: boolean, createdBy: userId?
// }

function createMatch({ playerAId, playerBId, winnerId, score, date, createdBy }) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    playerAId, playerBId, winnerId,
    score: score || '',
    date: date || Date.now(),
    confirmed: true,
    createdBy: createdBy || null,
  };
}

// ─── Stats Helpers ────────────────────────────────────────────────────────────

function getPlayerStats(player, matches) {
  const p = ensurePlayerRating({ ...player });
  const playerMatches = (matches || []).filter(m => m.playerAId === p.id || m.playerBId === p.id);
  const wins = playerMatches.filter(m => m.winnerId === p.id).length;
  const losses = playerMatches.length - wins;
  const winRate = playerMatches.length ? Math.round((wins / playerMatches.length) * 100) : 0;
  return {
    rating: p.rating,
    matchesPlayed: playerMatches.length,
    wins, losses, winRate,
    streak: p.streak || 0,
    categoria: p.categoria,
    ratingHistory: p.ratingHistory,
  };
}

function getHeadToHead(playerAId, playerBId, matches) {
  const h2h = (matches || []).filter(m =>
    (m.playerAId === playerAId && m.playerBId === playerBId) ||
    (m.playerAId === playerBId && m.playerBId === playerAId)
  );
  const aWins = h2h.filter(m => m.winnerId === playerAId).length;
  const bWins = h2h.length - aWins;
  return { matches: h2h, aWins, bWins, total: h2h.length };
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

function getRanking(players, { categoria = null, genero = null } = {}) {
  return [...players]
    .map(ensurePlayerRating)
    .filter(p => (!categoria || p.categoria === categoria))
    .filter(p => (!genero || p.genero === genero))
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

// ─── Feed (automatic events) ──────────────────────────────────────────────────

function getAutoFeed() {
  try { return JSON.parse(localStorage.getItem('petunias-autofeed')) || []; } catch { return []; }
}
function saveAutoFeed(feed) {
  // Keep last 200 events only
  const trimmed = feed.slice(-200);
  localStorage.setItem('petunias-autofeed', JSON.stringify(trimmed));
}

function addAutoFeedEvents(newEvents) {
  const feed = getAutoFeed();
  const now = Date.now();
  const stamped = newEvents.map((e, i) => ({ ...e, id: now + i, date: e.date || now }));
  saveAutoFeed([...feed, ...stamped]);
  return [...feed, ...stamped];
}

Object.assign(window, {
  ELO_K, INITIAL_RATING, CATEGORY_THRESHOLDS,
  getCategoryFromRating, ensurePlayerRating,
  calculateElo, applyMatchToPlayers, revertMatchFromPlayers,
  createMatch, getPlayerStats, getHeadToHead, getRanking,
  getAutoFeed, saveAutoFeed, addAutoFeedEvents,
});
