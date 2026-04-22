const MatchesView = ({ players, matches, onAddMatch, onDeleteMatch, currentUser }) => {
  // Vistas: 'list', 'manual', 'configLive', 'umpire', 'summary'
  const [view, setView] = React.useState('list'); 
  
  // --- INGRESO MANUAL ---
  const [manP1, setManP1] = React.useState('');
  const [manP2, setManP2] = React.useState('');
  const [manWinner, setManWinner] = React.useState('');
  const [manScore, setManScore] = React.useState('');

  // --- CONFIGURACIÓN PRE-PARTIDO ---
  const [config, setConfig] = React.useState({
    type: 'singles', 
    bestOfSets: 3,   
    gamesPerSet: 6,  
    tiebreakPts: 7   
  });
  
  const [teamA1, setTeamA1] = React.useState('');
  const [teamA2, setTeamA2] = React.useState(''); 
  const [teamB1, setTeamB1] = React.useState('');
  const [teamB2, setTeamB2] = React.useState(''); 

  // --- MÁQUINA DE TIEMPO (UNDO / REDO) ---
  const INITIAL_MATCH_STATE = {
    ptsA: 0, ptsB: 0,
    gamesA: 0, gamesB: 0,
    setsA: 0, setsB: 0,
    isTiebreak: false,
    server: null,
    statsA: { aces: 0, winners: 0, df: 0, ue: 0, totalPts: 0 }, 
    statsB: { aces: 0, winners: 0, df: 0, ue: 0, totalPts: 0 },
    matchHistoryStr: ''
  };

  const [history, setHistory] = React.useState([INITIAL_MATCH_STATE]);
  const [historyIdx, setHistoryIdx] = React.useState(0);
  const matchState = history[historyIdx];

  const POINT_SCORES = [0, 15, 30, 40, 'AD'];

  const pushState = (newState) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const undo = () => { if (historyIdx > 0) setHistoryIdx(historyIdx - 1); };
  const redo = () => { if (historyIdx < history.length - 1) setHistoryIdx(historyIdx + 1); };

  // ── LÓGICA DEL TENIS REPARADA ──
  const handleVolado = () => {
    if (!teamA1 || !teamB1) return;
    const ganador = Math.random() > 0.5 ? 'A' : 'B';
    const newState = { ...matchState, server: ganador };
    pushState(newState);
    alert(`🪙 ¡VOLADO!\n\nEl primer saque es para: Equipo ${ganador}`);
  };

  const winGame = (state, winner) => {
    let next = { ...state };
    if (winner === 'A') next.gamesA += 1;
    else next.gamesB += 1;
    
    next.ptsA = 0; next.ptsB = 0;
    next.server = next.server === 'A' ? 'B' : 'A';

    if (next.gamesA === config.gamesPerSet && next.gamesB === config.gamesPerSet) {
      next.isTiebreak = true;
    }
    return next;
  };

  // Función interna para procesar el punto matemáticamente sin guardar en el historial todavía
  const processPoint = (state, player) => {
    let next = { ...state };
    
    if (player === 'A') next.statsA.totalPts += 1;
    else next.statsB.totalPts += 1;

    if (next.isTiebreak) {
      if (player === 'A') next.ptsA += 1;
      else next.ptsB += 1;
      
      const totalPts = next.ptsA + next.ptsB;
      if (totalPts % 2 !== 0) next.server = next.server === 'A' ? 'B' : 'A';
      
      if ((player === 'A' && next.ptsA >= config.tiebreakPts && (next.ptsA - next.ptsB) >= 2) || 
          (player === 'B' && next.ptsB >= config.tiebreakPts && (next.ptsB - next.ptsA) >= 2)) {
         next = winGame(next, player);
         next.isTiebreak = false; 
      }
      return next;
    }

    if (player === 'A') {
      if (next.ptsA === 3 && next.ptsB === 4) { next.ptsB = 3; } 
      else if (next.ptsA === 3 && next.ptsB < 3) { next = winGame(next, 'A'); } 
      else if (next.ptsA === 4) { next = winGame(next, 'A'); } 
      else { next.ptsA += 1; }
    } else {
      if (next.ptsB === 3 && next.ptsA === 4) { next.ptsA = 3; } 
      else if (next.ptsB === 3 && next.ptsA < 3) { next = winGame(next, 'B'); }
      else if (next.ptsB === 4) { next = winGame(next, 'B'); }
      else { next.ptsB += 1; }
    }
    return next;
  };

  // Llama a processPoint y guarda el resultado
  const handlePoint = (player) => {
    let next = JSON.parse(JSON.stringify(matchState)); 
    next = processPoint(next, player);
    pushState(next);
  };

  // Combina estadística + punto en un solo paso para evitar choques
  const handleStat = (player, statType) => {
    let next = JSON.parse(JSON.stringify(matchState)); 
    
    // 1. Sumamos la estadística
    if (player === 'A') next.statsA[statType] += 1;
    else next.statsB[statType] += 1;
    
    // 2. Procesamos el punto correspondiente en el mismo estado
    if ((player === 'A' && (statType === 'aces' || statType === 'winners')) || 
        (player === 'B' && (statType === 'df' || statType === 'ue'))) {
      next = processPoint(next, 'A');
    } else {
      next = processPoint(next, 'B');
    }
    
    // 3. Ahora sí guardamos el resultado final en el historial
    pushState(next);
  };

  const manualSaveSet = () => {
    let next = { ...matchState };
    next.matchHistoryStr += `${next.gamesA}-${next.gamesB} `;
    if (next.gamesA > next.gamesB) next.setsA += 1;
    else if (next.gamesB > next.gamesA) next.setsB += 1;
    
    next.gamesA = 0; next.gamesB = 0; 
    next.ptsA = 0; next.ptsB = 0; 
    next.isTiebreak = false;
    pushState(next);
  };

  const goToSummary = () => {
    if (!teamA1 || !teamB1) return alert("Faltan jugadores principales.");
    setView('summary');
  };

  const confirmAndSaveMatch = () => {
    const winnerId = matchState.setsA > matchState.setsB ? teamA1 : matchState.setsB > matchState.setsA ? teamB1 : (matchState.gamesA > matchState.gamesB ? teamA1 : teamB1);
    
    let extraInfo = config.type === 'doubles' ? ` (Dobles: c/${players.find(p=>p.id==teamA2)?.nombre?.split(' ')[0] || '?'} vs c/${players.find(p=>p.id==teamB2)?.nombre?.split(' ')[0] || '?'})` : '';
    const finalScore = matchState.matchHistoryStr + (matchState.gamesA > 0 || matchState.gamesB > 0 ? `${matchState.gamesA}-${matchState.gamesB}` : '') + extraInfo;
    
    onAddMatch({
      playerAId: Number(teamA1), 
      playerBId: Number(teamB1),
      winnerId: Number(winnerId),
      score: finalScore.trim(),
      date: new Date().toISOString(),
      stats: { A: matchState.statsA, B: matchState.statsB } 
    });
    
    setView('list');
    setHistory([INITIAL_MATCH_STATE]);
    setHistoryIdx(0);
  };

  const getTeamName = (teamStr) => {
    if (teamStr === 'A') {
      const p1 = players.find(p=>p.id==teamA1)?.nombre || 'Jugador 1';
      const p2 = players.find(p=>p.id==teamA2)?.nombre?.split(' ')[0];
      return config.type === 'doubles' && p2 ? `${p1} / ${p2}` : p1;
    } else {
      const p1 = players.find(p=>p.id==teamB1)?.nombre || 'Jugador 2';
      const p2 = players.find(p=>p.id==teamB2)?.nombre?.split(' ')[0];
      return config.type === 'doubles' && p2 ? `${p1} / ${p2}` : p1;
    }
  };

  // ── COMPONENTE VISUAL PARA BARRAS DE ESTADÍSTICAS ──
  const StatBar = ({ label, valA, valB, isError = false }) => {
    const total = valA + valB;
    const pctA = total === 0 ? 50 : Math.round((valA / total) * 100);
    const pctB = total === 0 ? 50 : 100 - pctA;
    const colorA = valA > valB ? (isError ? '#4d4d4d' : '#00ff97') : (valA === valB ? '#7c7c7c' : (isError ? '#00ff97' : '#4d4d4d'));
    const colorB = valB > valA ? (isError ? '#4d4d4d' : '#00ff97') : (valA === valB ? '#7c7c7c' : (isError ? '#00ff97' : '#4d4d4d'));

    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#fff', marginBottom: 6, fontFamily: 'Audiowide' }}>
          <span>{valA} <span style={{fontSize:10, color:'#7c7c7c'}}>({pctA}%)</span></span>
          <span style={{ color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
          <span><span style={{fontSize:10, color:'#7c7c7c'}}>({pctB}%)</span> {valB}</span>
        </div>
        <div style={{ display: 'flex', height: 8, background: '#1f1f1f', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pctA}%`, background: colorA, transition: 'width 0.4s ease' }}></div>
          <div style={{ width: `${pctB}%`, background: colorB, transition: 'width 0.4s ease' }}></div>
        </div>
      </div>
    );
  };

  const renderMatchStats = () => (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, border: '1px solid #333' }}>
      <StatBar label="Aces" valA={matchState.statsA.aces} valB={matchState.statsB.aces} />
      <StatBar label="Dobles Faltas" valA={matchState.statsA.df} valB={matchState.statsB.df} isError={true} />
      <StatBar label="Tiros Ganadores" valA={matchState.statsA.winners} valB={matchState.statsB.winners} />
      <StatBar label="Errores No Forz." valA={matchState.statsA.ue} valB={matchState.statsB.ue} isError={true} />
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #4d4d4d' }}>
        <StatBar label="TOTAL PUNTOS" valA={matchState.statsA.totalPts} valB={matchState.statsB.totalPts} />
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* ── CABECERA GENERAL ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 15 }}>
        <h2 style={{ color: '#00ff97', fontFamily: 'Audiowide', fontSize: 22, margin: 0 }}>
          {view === 'list' ? `Historial de Partidos (${matches.length})` : 
           view === 'manual' ? 'Agregar Resultado Manual' : 
           view === 'configLive' ? 'Configuración del Partido' : 
           view === 'summary' ? 'Resumen del Partido' : 'Modo Umpire'}
        </h2>
        
        {view === 'list' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" onClick={() => setView('manual')}>+ Ingreso Rápido</button>
            <button className="btn-neon" onClick={() => setView('configLive')}>🎾 Iniciar Partido</button>
          </div>
        ) : view !== 'summary' ? (
          <button className="btn-outline" onClick={() => setView('list')}>← Volver a la Lista</button>
        ) : null}
      </div>

      {/* ── VISTA 1: CONFIGURACIÓN ── */}
      {view === 'configLive' && (
        <div className="glass-card dialog-elev" style={{ padding: 30, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label className="label-neon">Tipo de Partido</label>
              <select className="inp" value={config.type} onChange={e => setConfig({...config, type: e.target.value})}>
                <option value="singles">Singles (1 vs 1)</option>
                <option value="doubles">Dobles (2 vs 2)</option>
              </select>
            </div>
            <div>
              <label className="label-neon">Formato de Sets</label>
              <select className="inp" value={config.bestOfSets} onChange={e => setConfig({...config, bestOfSets: Number(e.target.value)})}>
                <option value={1}>1 Set (Pro Set)</option>
                <option value={2}>Al Mejor de 2 Sets</option>
                <option value={3}>Al Mejor de 3 Sets</option>
                <option value={5}>Al Mejor de 5 Sets</option>
              </select>
            </div>
            <div>
              <label className="label-neon">Juegos por Set</label>
              <select className="inp" value={config.gamesPerSet} onChange={e => setConfig({...config, gamesPerSet: Number(e.target.value)})}>
                <option value={4}>4 Juegos (Fast4)</option>
                <option value={6}>6 Juegos (Estándar)</option>
                <option value={8}>8 Juegos (Pro Set)</option>
              </select>
            </div>
            <div>
              <label className="label-neon">Puntos Tiebreak</label>
              <select className="inp" value={config.tiebreakPts} onChange={e => setConfig({...config, tiebreakPts: Number(e.target.value)})}>
                <option value={7}>A 7 Puntos</option>
                <option value={10}>A 10 Puntos (Match Tiebreak)</option>
              </select>
            </div>
          </div>

          <h3 className="label-neon" style={{ borderBottom: '1px solid #333', paddingBottom: 10, marginTop: 30, marginBottom: 15 }}>Selección de Jugadores</h3>
          
          <div className="two-col-form" style={{ marginBottom: 30 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 8 }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: 10 }}>Equipo 1 (Local)</strong>
              <select className="inp" value={teamA1} onChange={e => setTeamA1(e.target.value)} style={{ marginBottom: 10 }}>
                <option value="">Jugador 1...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {config.type === 'doubles' && (
                <select className="inp" value={teamA2} onChange={e => setTeamA2(e.target.value)}>
                  <option value="">Compañero...</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 8 }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: 10 }}>Equipo 2 (Visitante)</strong>
              <select className="inp" value={teamB1} onChange={e => setTeamB1(e.target.value)} style={{ marginBottom: 10 }}>
                <option value="">Jugador 1...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {config.type === 'doubles' && (
                <select className="inp" value={teamB2} onChange={e => setTeamB2(e.target.value)}>
                  <option value="">Compañero...</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              )}
            </div>
          </div>

          <button className="btn-neon" style={{ width: '100%', padding: '15px', fontSize: 16 }} onClick={() => {
            if(!teamA1 || !teamB1) return alert("Selecciona a los jugadores principales.");
            setHistory([INITIAL_MATCH_STATE]); setHistoryIdx(0);
            setView('umpire');
          }}>
            IR A LA CANCHA (UMPIRE)
          </button>
        </div>
      )}

      {/* ── VISTA 2: MODO UMPIRE (EN VIVO) ── */}
      {view === 'umpire' && (
        <div className="glass-card" style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }} onClick={handleVolado}>
              🪙 Volado
            </button>
            <div style={{ display: 'flex', gap: 10, background: '#1f1f1f', padding: '4px', borderRadius: 50 }}>
              <button onClick={undo} disabled={historyIdx === 0} style={{ background: 'none', border: 'none', color: historyIdx > 0 ? '#00ff97' : '#4d4d4d', cursor: historyIdx > 0 ? 'pointer' : 'default', padding: '6px 12px', fontSize: 18 }}>↩</button>
              <div style={{ width: 1, background: '#333' }}></div>
              <button onClick={redo} disabled={historyIdx === history.length - 1} style={{ background: 'none', border: 'none', color: historyIdx < history.length - 1 ? '#00ff97' : '#4d4d4d', cursor: historyIdx < history.length - 1 ? 'pointer' : 'default', padding: '6px 12px', fontSize: 18 }}>↪</button>
            </div>
          </div>

          {/* Marcador */}
          <div style={{ background: '#0a0a0a', border: '2px solid #333', borderRadius: 12, padding: '20px', marginBottom: 30, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: 10, marginBottom: 15, color: '#7c7c7c', fontFamily: 'Audiowide', fontSize: 11, textTransform: 'uppercase' }}>
              <div style={{ width: '40%', textAlign: 'center', color: matchState.server === 'A' ? '#00ff97' : '#7c7c7c' }}>
                {matchState.server === 'A' && '🎾 '} {getTeamName('A')}
              </div>
              <div style={{ width: '20%', display: 'flex', justifyContent: 'space-around' }}><span>Sets</span><span>Gms</span></div>
              <div style={{ width: '40%', textAlign: 'center', color: matchState.server === 'B' ? '#00ff97' : '#7c7c7c' }}>
                 {getTeamName('B')} {matchState.server === 'B' && ' 🎾'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Audiowide' }}>
              <div style={{ width: '40%', textAlign: 'center', fontSize: 56, color: matchState.server === 'A' ? '#00ff97' : '#fff' }}>
                {matchState.isTiebreak ? matchState.ptsA : POINT_SCORES[matchState.ptsA]}
              </div>
              <div style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ display: 'flex', gap: 20, fontSize: 18, color: '#fff' }}>
                  <span>{matchState.setsA}</span> <span style={{ color: '#4d4d4d' }}>-</span> <span>{matchState.setsB}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 32, color: '#ffc107', background: '#1a1a1a', padding: '5px 15px', borderRadius: 8 }}>
                  <span>{matchState.gamesA}</span> <span style={{ color: '#4d4d4d' }}>-</span> <span>{matchState.gamesB}</span>
                </div>
              </div>
              <div style={{ width: '40%', textAlign: 'center', fontSize: 56, color: matchState.server === 'B' ? '#00ff97' : '#fff' }}>
                 {matchState.isTiebreak ? matchState.ptsB : POINT_SCORES[matchState.ptsB]}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-neon" style={{ padding: 20, fontSize: 16, opacity: matchState.server === 'A' ? 1 : 0.7 }} onClick={() => handlePoint('A')}>+ PUNTO A</button>
              <button className="btn-outline" style={{ borderColor: '#28a745', color: '#28a745' }} onClick={() => handleStat('A', 'aces')}>ACE ({matchState.statsA.aces})</button>
              <button className="btn-outline" style={{ borderColor: '#17a2b8', color: '#17a2b8' }} onClick={() => handleStat('A', 'winners')}>WINNER ({matchState.statsA.winners})</button>
              <button className="btn-outline" style={{ borderColor: '#ffc107', color: '#ffc107' }} onClick={() => handleStat('A', 'ue')}>ERR. NO FORZ. ({matchState.statsA.ue})</button>
              <button className="btn-outline" style={{ borderColor: '#dc3545', color: '#dc3545' }} onClick={() => handleStat('A', 'df')}>DOBLE FALTA ({matchState.statsA.df})</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-neon" style={{ padding: 20, fontSize: 16, opacity: matchState.server === 'B' ? 1 : 0.7 }} onClick={() => handlePoint('B')}>+ PUNTO B</button>
              <button className="btn-outline" style={{ borderColor: '#28a745', color: '#28a745' }} onClick={() => handleStat('B', 'aces')}>ACE ({matchState.statsB.aces})</button>
              <button className="btn-outline" style={{ borderColor: '#17a2b8', color: '#17a2b8' }} onClick={() => handleStat('B', 'winners')}>WINNER ({matchState.statsB.winners})</button>
              <button className="btn-outline" style={{ borderColor: '#ffc107', color: '#ffc107' }} onClick={() => handleStat('B', 'ue')}>ERR. NO FORZ. ({matchState.statsB.ue})</button>
              <button className="btn-outline" style={{ borderColor: '#dc3545', color: '#dc3545' }} onClick={() => handleStat('B', 'df')}>DOBLE FALTA ({matchState.statsB.df})</button>
            </div>
          </div>

          {/* Estadísticas en Vivo */}
          <h4 className="label-neon" style={{ textAlign: 'center', marginBottom: 15 }}>Estadísticas en Vivo</h4>
          {renderMatchStats()}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 15, flexWrap: 'wrap', borderTop: '1px solid #333', paddingTop: 20, marginTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 12 }}>
              <input type="checkbox" checked={matchState.isTiebreak} onChange={(e) => { pushState({...matchState, isTiebreak: e.target.checked, ptsA: 0, ptsB: 0}) }} /> Tiebreak Manual
            </label>
            <button className="btn-outline" onClick={manualSaveSet}>Cerrar Set</button>
            <button className="btn-neon" onClick={goToSummary}>Terminar Partido</button>
          </div>
        </div>
      )}

      {/* ── VISTA 3: RESUMEN FINAL FACE-TO-FACE ── */}
      {view === 'summary' && (
        <div className="glass-card dialog-elev" style={{ padding: '32px 20px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          
          <h2 style={{ color: '#fff', fontFamily: 'Audiowide', fontSize: 24, marginBottom: 5 }}>RESULTADO FINAL</h2>
          <div style={{ color: '#ffc107', fontFamily: 'Audiowide', fontSize: 28, letterSpacing: 3, marginBottom: 30 }}>
            {matchState.matchHistoryStr + (matchState.gamesA > 0 || matchState.gamesB > 0 ? `${matchState.gamesA}-${matchState.gamesB}` : '')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
              <h3 style={{ color: matchState.setsA > matchState.setsB ? '#00ff97' : '#fff', fontFamily: 'Audiowide' }}>
                {getTeamName('A')}
              </h3>
            </div>
            <div style={{ color: '#4d4d4d', fontFamily: 'Audiowide', fontSize: 20 }}>VS</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
              <h3 style={{ color: matchState.setsB > matchState.setsA ? '#00ff97' : '#fff', fontFamily: 'Audiowide' }}>
                {getTeamName('B')}
              </h3>
            </div>
          </div>

          <h4 className="label-neon" style={{ textAlign: 'center', marginBottom: 20, borderTop: '1px solid #333', paddingTop: 20 }}>
            Estadísticas del Partido
          </h4>
          
          <div style={{ textAlign: 'left' }}>
            {renderMatchStats()}
          </div>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginTop: 30 }}>
            <button className="btn-outline" onClick={() => setView('umpire')}>← Volver al Marcador</button>
            <button className="btn-neon" onClick={confirmAndSaveMatch}>Guardar Partido en Historial</button>
          </div>
        </div>
      )}

      {/* ── VISTA 4: INGRESO MANUAL ── */}
      {view === 'manual' && (
        <div className="glass-card dialog-elev" style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
          <div className="two-col-form" style={{ marginBottom: 20 }}>
            <div>
              <label className="label-neon">Jugador 1</label>
              <select className="inp" value={manP1} onChange={e => setManP1(e.target.value)}>
                <option value="">Seleccionar...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label-neon">Jugador 2</label>
              <select className="inp" value={manP2} onChange={e => setManP2(e.target.value)}>
                <option value="">Seleccionar...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label-neon">Ganador</label>
            <select className="inp" value={manWinner} onChange={e => setManWinner(e.target.value)} style={{ border: '1px solid #00ff97' }}>
              <option value="">¿Quién ganó?</option>
              {manP1 && <option value={manP1}>{players.find(p=>p.id==manP1)?.nombre}</option>}
              {manP2 && <option value={manP2}>{players.find(p=>p.id==manP2)?.nombre}</option>}
            </select>
          </div>
          <div style={{ marginBottom: 30 }}>
            <label className="label-neon">Marcador Final (Opcional)</label>
            <input type="text" className="inp" placeholder="Ej: 6-4, 3-6, 7-6" value={manScore} onChange={e => setManScore(e.target.value)} />
          </div>
          <button className="btn-neon" style={{ width: '100%' }} onClick={() => {
            if (!manP1 || !manP2 || !manWinner) return alert("Faltan datos");
            onAddMatch({ playerAId: Number(manP1), playerBId: Number(manP2), winnerId: Number(manWinner), score: manScore, date: new Date().toISOString() });
            setView('list'); setManP1(''); setManP2(''); setManWinner(''); setManScore('');
          }}>Guardar Partido Manual</button>
        </div>
      )}

      {/* ── VISTA 5: LISTA DE PARTIDOS ── */}
      {view === 'list' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {matches.length === 0 && <p style={{ color: '#7c7c7c', textAlign: 'center' }}>No hay partidos registrados aún.</p>}
          {matches.map((m, i) => {
            const pA = players.find(p => p.id === m.playerAId);
            const pB = players.find(p => p.id === m.playerBId);
            if (!pA || !pB) return null;
            const aWon = m.winnerId === pA.id;
            
            return (
              <div key={m.id || i} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: aWon ? '#00ff97' : '#dc3545' }} />
                    <strong style={{ color: aWon ? '#fff' : '#b3b3b3' }}>{pA.nombre}</strong>
                    {m.deltaA && <span style={{ fontSize: 10, color: m.deltaA >= 0 ? '#00ff97' : '#dc3545' }}>{m.deltaA > 0 ? '+'+m.deltaA : m.deltaA}</span>}
                  </div>
                  <div style={{ fontFamily: 'Audiowide', fontSize: 18, color: '#ffc107', letterSpacing: 2, padding: '0 15px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                    {m.score || 'VS'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200, justifyContent: 'flex-end' }}>
                    {m.deltaB && <span style={{ fontSize: 10, color: m.deltaB >= 0 ? '#00ff97' : '#dc3545' }}>{m.deltaB > 0 ? '+'+m.deltaB : m.deltaB}</span>}
                    <strong style={{ color: !aWon ? '#fff' : '#b3b3b3' }}>{pB.nombre}</strong>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: !aWon ? '#00ff97' : '#dc3545' }} />
                  </div>
                </div>
                <button onClick={() => onDeleteMatch(m.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }} title="Eliminar Partido">✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}