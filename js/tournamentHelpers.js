// ─── Tournament Helpers ───────────────────────────────────────────────────────

// Points awarded by finishing position in elimination
const ELIM_POINTS = { winner:100, finalist:60, semi:30, quarter:15, r1:5 };
const RR_POINTS   = { 1:100, 2:60, 3:30, 4:15, default:5 };

function nextPow2(n) {
  let p = 1; while (p < n) p <<= 1; return p;
}

function uid() { return Math.random().toString(36).slice(2,9); }

// Seed players by rating descending
function seedPlayers(players) {
  return [...players].sort((a,b) => getFifaRating(b) - getFifaRating(a));
}

// Build initial elimination bracket matches
function buildElimBracket(players) {
  const seeded = seedPlayers(players);
  const size   = nextPow2(seeded.length);
  const byes   = size - seeded.length;
  // interleave byes at bottom of seed list
  const slots  = [...seeded, ...Array(byes).fill(null)];
  const rounds = Math.log2(size);
  let matches  = [];

  // R0: pair slots
  for (let i = 0; i < size/2; i++) {
    const p1 = slots[i*2];
    const p2 = slots[i*2+1];
    const bye = p2 === null;
    matches.push({
      id: uid(), round:0, position:i,
      p1: p1 || null, p2: p2 || null,
      sets:[], winner: bye && p1 ? p1.id : null,
      bye, done: bye
    });
  }

  // subsequent rounds (TBD)
  for (let r = 1; r < rounds; r++) {
    const count = size / Math.pow(2, r+1);
    for (let i = 0; i < count; i++) {
      matches.push({ id:uid(), round:r, position:i, p1:null, p2:null, sets:[], winner:null, bye:false, done:false });
    }
  }

  // propagate byes immediately
  matches = propagateByes(matches);
  return matches;
}

function propagateByes(matches) {
  const updated = [...matches];
  updated.forEach(m => {
    if (m.done && m.winner) {
      advanceWinner(updated, m);
    }
  });
  return updated;
}

function getWinnerPlayer(matches, matchId) {
  const m = matches.find(x => x.id === matchId);
  return m?.winner ? (m.p1?.id === m.winner ? m.p1 : m.p2) : null;
}

function advanceWinner(matches, match) {
  const nextRound = match.round + 1;
  const nextPos   = Math.floor(match.position / 2);
  const slot      = match.position % 2 === 0 ? 'p1' : 'p2';
  const target    = matches.find(m => m.round === nextRound && m.position === nextPos);
  if (!target) return;
  const winner = match.p1?.id === match.winner ? match.p1 : match.p2;
  target[slot] = winner;
  // auto-bye if other slot is null and we just filled one
  if (target.p1 && target.p2 === null) { /* wait */ }
}

function setMatchResult(matches, matchId, sets, winnerId) {
  const updated = matches.map(m => m.id === matchId
    ? { ...m, sets, winner: winnerId, done: true }
    : { ...m }
  );
  const match = updated.find(m => m.id === matchId);
  advanceWinner(updated, match);
  return updated;
}

function getRoundName(round, totalRounds) {
  const r = totalRounds - 1 - round; // distance from final
  if (r === 0) return 'FINAL';
  if (r === 1) return 'SEMIFINAL';
  if (r === 2) return 'CUARTOS';
  if (r === 3) return 'OCTAVOS';
  return `RONDA ${round + 1}`;
}

// ─── Round Robin ─────────────────────────────────────────────────────────────

function buildRoundRobin(players, groupId = null) {
  const matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i+1; j < players.length; j++) {
      matches.push({
        id: uid(), round: 0, position: matches.length,
        p1: players[i], p2: players[j],
        sets: [], winner: null, done: false,
        groupId: groupId || null
      });
    }
  }
  return matches;
}

function getRRStandings(players, matches, groupId = null) {
  const ms = groupId ? matches.filter(m => m.groupId === groupId) : matches;
  const stats = {};
  players.forEach(p => { stats[p.id] = { player:p, w:0, l:0, pts:0, setsW:0, setsL:0 }; });
  ms.filter(m => m.done).forEach(m => {
    if (!m.winner) return;
    const loserId = m.p1.id === m.winner ? m.p2.id : m.p1.id;
    if (stats[m.winner]) { stats[m.winner].w++; stats[m.winner].pts += 2; }
    if (stats[loserId])  { stats[loserId].l++; }
    m.sets.forEach(([s1, s2]) => {
      const p1wins = s1 > s2;
      if (stats[m.p1.id]) { p1wins ? stats[m.p1.id].setsW++ : stats[m.p1.id].setsL++; }
      if (stats[m.p2.id]) { p1wins ? stats[m.p2.id].setsL++ : stats[m.p2.id].setsW++; }
    });
  });
  return Object.values(stats).sort((a,b) => b.pts - a.pts || b.setsW - a.setsW);
}

// ─── Groups + Elimination ────────────────────────────────────────────────────

function buildGroups(players, groupSize = 4) {
  const seeded = seedPlayers(players);
  const groups = [];
  for (let i = 0; i < seeded.length; i += groupSize) {
    const groupPlayers = seeded.slice(i, i + groupSize);
    const gid = uid();
    groups.push({ id: gid, name: `Grupo ${groups.length + 1}`, players: groupPlayers });
  }
  return groups;
}

function buildGroupMatches(groups) {
  return groups.flatMap(g => buildRoundRobin(g.players, g.id));
}

// ─── Points calculation ───────────────────────────────────────────────────────

function calcTournamentPoints(tournament) {
  const pts = {};
  if (tournament.modalidad === 'eliminacion') {
    const { matches } = tournament;
    const totalRounds = Math.log2(nextPow2(tournament.players.length));
    matches.forEach(m => {
      if (!m.done || !m.winner) return;
      const loserId = m.p1?.id === m.winner ? m.p2?.id : m.p1?.id;
      // winner gets points based on round
      const roundName = getRoundName(m.round, totalRounds);
      let winPts = m.round * 5 + 5;
      if (roundName === 'FINAL')     winPts = ELIM_POINTS.finalist;
      if (roundName === 'SEMIFINAL') winPts = ELIM_POINTS.semi;
      if (roundName === 'CUARTOS')   winPts = ELIM_POINTS.quarter;
      if (!pts[m.winner]) pts[m.winner] = 0;
      pts[m.winner] += winPts;
      if (loserId) {
        if (!pts[loserId]) pts[loserId] = 0;
        // loser already had their chance to win in earlier rounds
      }
    });
    // tournament winner bonus
    if (tournament.winner) {
      pts[tournament.winner] = (pts[tournament.winner] || 0) + 40;
    }
  } else {
    // RR / groups: by standings
    const standings = getRRStandings(tournament.players, tournament.matches);
    standings.forEach((s, i) => {
      pts[s.player.id] = RR_POINTS[i+1] || RR_POINTS.default;
    });
  }
  return pts;
}

// simulate a single match randomly (weighted by rating)
function simulateMatch(p1, p2, formato) {
  const r1 = getFifaRating(p1), r2 = getFifaRating(p2);
  const total = r1 + r2;
  const setsNeeded = formato === 'bo3' ? 2 : formato === 'bo2' ? 2 : 1;
  let w1 = 0, w2 = 0;
  const sets = [];
  while (w1 < setsNeeded && w2 < setsNeeded) {
    const p1wins = Math.random() < (r1 / total);
    if (p1wins) {
      const s1 = 6, s2 = Math.floor(Math.random() * 5);
      sets.push([s1, s2]); w1++;
    } else {
      const s1 = Math.floor(Math.random() * 5), s2 = 6;
      sets.push([s1, s2]); w2++;
    }
  }
  return { sets, winnerId: w1 >= setsNeeded ? p1.id : p2.id };
}

Object.assign(window, {
  buildElimBracket, setMatchResult, getRoundName, nextPow2,
  buildRoundRobin, getRRStandings, buildGroups, buildGroupMatches,
  calcTournamentPoints, simulateMatch, seedPlayers
});
