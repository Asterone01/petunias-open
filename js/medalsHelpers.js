// ─── Monthly Medals ──────────────────────────────────────────────────────────

function getMonthKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function getMonthRange(monthKey) {
  const [y,m] = monthKey.split('-').map(Number);
  const start = new Date(y, m-1, 1).getTime();
  const end   = new Date(y, m, 1).getTime();
  return { start, end };
}

function listAvailableMonths(matches, trainings, attendance) {
  const set = new Set();
  (matches || []).forEach(m => set.add(getMonthKey(m.date)));
  (trainings || []).forEach(t => set.add(getMonthKey(t.fecha)));
  (attendance || []).forEach(a => set.add(getMonthKey(a.recordedAt)));
  // Ensure current month is present
  set.add(getMonthKey(Date.now()));
  return [...set].sort().reverse();
}

// Returns top-3 per medal category for the given month.
function computeMonthlyMedals(monthKey, players, matches) {
  const { start, end } = getMonthRange(monthKey);
  const monthMatches = (matches || []).filter(m => m.date >= start && m.date < end);
  const attendance   = (typeof getAttendance === 'function' ? getAttendance() : [])
    .filter(a => a.recordedAt >= start && a.recordedAt < end);

  const byPlayer = {};
  const touch = (id) => (byPlayer[id] = byPlayer[id] || {
    playerId: id, played: 0, wins: 0, losses: 0,
    ratingStart: null, ratingEnd: null, ratingDelta: 0,
    bestStreak: 0, curStreak: 0,
    presentes: 0, asistTotales: 0,
  });

  // Sort matches by date ascending so streak/rating delta is chronological
  const sortedM = [...monthMatches].sort((a,b) => a.date - b.date);
  sortedM.forEach(m => {
    const a = touch(m.playerAId);
    const b = touch(m.playerBId);
    a.played++; b.played++;
    const aWon = m.winnerId === m.playerAId;
    if (aWon) { a.wins++; b.losses++; a.curStreak = Math.max(0,a.curStreak)+1; b.curStreak = Math.min(0,b.curStreak)-1; }
    else      { b.wins++; a.losses++; b.curStreak = Math.max(0,b.curStreak)+1; a.curStreak = Math.min(0,a.curStreak)-1; }
    a.bestStreak = Math.max(a.bestStreak, a.curStreak);
    b.bestStreak = Math.max(b.bestStreak, b.curStreak);

    // Rating delta approx via match deltas (recorded when match was created)
    if (typeof m.deltaA === 'number') a.ratingDelta += m.deltaA;
    if (typeof m.deltaB === 'number') b.ratingDelta += m.deltaB;
  });

  attendance.forEach(r => {
    const p = touch(r.playerId);
    p.asistTotales++;
    if (r.status === 'presente') p.presentes++;
  });

  const rows = Object.values(byPlayer).map(r => {
    const player = players.find(p => p.id === r.playerId);
    return { ...r, nombre: player?.nombre || '—', foto: player?.foto, categoria: player?.categoria };
  });

  const top = (key, n=3, min=1) => rows
    .filter(r => (r[key] || 0) >= min)
    .sort((a,b) => (b[key]||0) - (a[key]||0))
    .slice(0, n);

  return {
    monthKey,
    totalMatches: sortedM.length,
    totalAttendance: attendance.length,
    medals: {
      mostPlayed:    top('played'),
      mostWins:      top('wins'),
      ratingGain:    top('ratingDelta'),
      bestStreak:    top('bestStreak'),
      mostPresentes: top('presentes'),
    },
  };
}

Object.assign(window, {
  getMonthKey, getMonthRange, listAvailableMonths, computeMonthlyMedals,
});
