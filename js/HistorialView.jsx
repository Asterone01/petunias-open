function HistorialView({ players, tournaments, matches = [] }) {
  const [subTab, setSubTab] = React.useState('ranking');
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [h2hP1, setH2hP1] = React.useState(players[0]?.id || null);
  const [h2hP2, setH2hP2] = React.useState(players[1]?.id || null);

  // ─── Compute global ranking ───────────────────────────────────────────────
  const rankingData = React.useMemo(() => {
    const pts = {};
    const wins = {};
    const played = {};
    const trophies = {};

    tournaments.filter(t => t.status === 'finished').forEach(t => {
      const tPts = calcTournamentPoints(t);
      Object.entries(tPts).forEach(([id, p]) => {
        pts[id] = (pts[id] || 0) + p;
      });
      // wins from matches
      const allMatches = [...t.matches, ...(t.elimMatches || [])];
      allMatches.filter(m => m.done && m.winner).forEach(m => {
        wins[m.winner] = (wins[m.winner] || 0) + 1;
        const loser = m.p1?.id === m.winner ? m.p2?.id : m.p1?.id;
        played[m.winner] = (played[m.winner] || 0) + 1;
        if (loser) played[loser] = (played[loser] || 0) + 1;
      });
      // trophy for winner
      if (t.winner) trophies[t.winner] = (trophies[t.winner] || 0) + 1;
    });

    return players.map(p => ({
      player: p,
      pts: pts[p.id] || 0,
      wins: wins[p.id] || 0,
      played: played[p.id] || 0,
      trophies: trophies[p.id] || 0,
      rating: getFifaRating(p)
    })).sort((a, b) => b.pts - a.pts || b.wins - a.wins);
  }, [players, tournaments]);

  // ─── Head to Head ─────────────────────────────────────────────────────────
  const h2hData = React.useMemo(() => {
    if (!h2hP1 || !h2hP2 || h2hP1 === h2hP2) return null;
    const p1 = players.find(p => p.id == h2hP1);
    const p2 = players.find(p => p.id == h2hP2);
    if (!p1 || !p2) return null;

    const meetings = [];
    let w1 = 0, w2 = 0;

    tournaments.forEach(t => {
      const allM = [...t.matches, ...(t.elimMatches || [])];
      allM.filter(m => m.done && m.winner).forEach(m => {
        const ids = [m.p1?.id, m.p2?.id];
        if (ids.includes(p1.id) && ids.includes(p2.id)) {
          const winner = m.winner === p1.id ? p1 : p2;
          if (m.winner === p1.id) w1++; else w2++;
          meetings.push({ tournament: t.nombre, sets: m.sets, winner, date: t.fecha });
        }
      });
    });

    // Also include standalone matches (new ELO/Partidos system)
    (matches || []).forEach(m => {
      const ids = [m.playerAId, m.playerBId];
      if (ids.includes(p1.id) && ids.includes(p2.id)) {
        const winner = m.winnerId === p1.id ? p1 : p2;
        if (m.winnerId === p1.id) w1++; else w2++;
        meetings.push({
          tournament: 'Partido suelto',
          sets: m.score ? m.score.split(',').map(s=>s.trim()) : [],
          winner,
          date: new Date(m.date).toLocaleDateString('es-AR'),
        });
      }
    });

    return { p1, p2, w1, w2, meetings };
  }, [h2hP1, h2hP2, players, tournaments, matches]);

  // ─── Player profile ───────────────────────────────────────────────────────
  const playerProfile = React.useMemo(() => {
    if (!selectedPlayer) return null;
    const p = players.find(x => x.id === selectedPlayer);
    if (!p) return null;

    const myTournaments = tournaments.filter(t =>
      t.players.some(pl => pl.id === p.id)
    );

    const allMatches = [];
    myTournaments.forEach(t => {
      [...t.matches, ...(t.elimMatches || [])].filter(m =>
        m.done && (m.p1?.id === p.id || m.p2?.id === p.id)
      ).forEach(m => allMatches.push({ ...m, tournamentName: t.nombre }));
    });

    const myWins = allMatches.filter(m => m.winner === p.id).length;
    const rk = rankingData.find(r => r.player.id === p.id);

    return { player: p, tournaments: myTournaments, matches: allMatches, wins: myWins, ranking: rk };
  }, [selectedPlayer, players, tournaments, rankingData]);

  const finished = tournaments.filter(t => t.status === 'finished');

  const TABS = [
    { key:'ranking', label:'Ranking Global' },
    { key:'history', label:`Historial (${finished.length})` },
    { key:'h2h',     label:'Head-to-Head' },
    { key:'profile', label:'Perfil Jugador' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Sub-nav */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={subTab === t.key ? 'cat-btn active' : 'cat-btn'} style={{ fontSize:11 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RANKING ── */}
      {subTab === 'ranking' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {rankingData.length === 0 ? (
            <div className="glass-card" style={{ padding:48, textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize:40, marginBottom:12, opacity:.3 }}>📊</div>
              Finaliza torneos para ver el ranking
            </div>
          ) : (
            <>
              {/* Top 3 podium */}
              {rankingData.length >= 3 && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:8 }}>
                  {[rankingData[1], rankingData[0], rankingData[2]].map((r, i) => {
                    if (!r) return <div key={i}/>;
                    const pos = i === 1 ? 1 : i === 0 ? 2 : 3;
                    const colors = ['#C0C0C0', '#FFD700', '#CD7F32'];
                    const sizes  = [140, 160, 120];
                    const c = colors[i];
                    return (
                      <div key={r.player.id} className="glass-card"
                        style={{ padding:20, textAlign:'center',
                          border:`1px solid ${c}40`,
                          boxShadow: i===1?`0 0 24px ${c}30`:undefined,
                          marginTop: i===1?0:20 }}>
                        {r.player.foto
                          ? <img src={r.player.foto} alt="" style={{ width:sizes[i], height:sizes[i],
                              borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', display:'block',
                              border:`3px solid ${c}`, boxShadow:`0 0 20px ${c}55` }}/>
                          : <div style={{ width:sizes[i], height:sizes[i], borderRadius:'50%',
                              background:`${c}15`, border:`3px solid ${c}`,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              margin:'0 auto 12px', fontSize:32 }}>🎾</div>
                        }
                        <div style={{ fontSize:28, fontWeight:700, fontFamily:'Audiowide',
                          color:c, marginBottom:4 }}>#{pos}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#fff',
                          fontFamily:'Audiowide', textTransform:'uppercase', letterSpacing:1 }}>
                          {r.player.nombre}
                        </div>
                        <div style={{ fontSize:20, fontWeight:700, color:c,
                          fontFamily:'Audiowide', marginTop:6 }}>{r.pts} pts</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4 }}>
                          {r.wins} victorias · {r.trophies} 🏆
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full table */}
              <div className="glass-card" style={{ padding:20, overflowX:'auto' }}>
                <div className="label-neon" style={{ marginBottom:14 }}>Tabla Completa</div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(0,255,151,0.2)' }}>
                      {['#','Jugador','OVR','Cat.','PJ','V','Torneos','Pts'].map(h=>(
                        <th key={h} style={{ padding:'7px 10px', textAlign:h==='Jugador'?'left':'center',
                          color:'rgba(0,255,151,0.7)', fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((r,i) => {
                      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
                      return (
                        <tr key={r.player.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer' }}
                          onClick={()=>{ setSelectedPlayer(r.player.id); setSubTab('profile'); }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,151,0.04)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'9px 10px', textAlign:'center', fontWeight:700,
                            fontFamily:'Audiowide', color:'rgba(0,255,151,0.8)', fontSize:14 }}>
                            {medal || (i+1)}
                          </td>
                          <td style={{ padding:'9px 10px', display:'flex', alignItems:'center', gap:10 }}>
                            {r.player.foto
                              ? <img src={r.player.foto} alt="" style={{ width:32,height:32,borderRadius:'50%',objectFit:'cover' }}/>
                              : <div style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.06)' }}/>
                            }
                            <span style={{ fontWeight:600 }}>{r.player.nombre}</span>
                          </td>
                          <td style={{ padding:'9px 10px', textAlign:'center', color:'rgba(255,255,255,0.6)' }}>{r.rating}</td>
                          <td style={{ padding:'9px 10px', textAlign:'center', color:'#00ff97', fontWeight:700 }}>{r.player.categoria}</td>
                          <td style={{ padding:'9px 10px', textAlign:'center', color:'rgba(255,255,255,0.5)' }}>{r.played}</td>
                          <td style={{ padding:'9px 10px', textAlign:'center', color:'#00ff97' }}>{r.wins}</td>
                          <td style={{ padding:'9px 10px', textAlign:'center' }}>{'🏆'.repeat(r.trophies)}</td>
                          <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Audiowide',
                            fontWeight:700, color:'#00ff97', fontSize:15 }}>{r.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* By category */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                {['A','B','C','D','E'].map(cat => {
                  const catData = rankingData.filter(r => r.player.categoria === cat);
                  if (!catData.length) return null;
                  const best = catData[0];
                  return (
                    <div key={cat} className="glass-card" style={{ padding:16 }}>
                      <div style={{ fontSize:10, color:'rgba(0,255,151,0.6)', textTransform:'uppercase',
                        letterSpacing:2, marginBottom:10 }}>Categoría {cat}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        {best.player.foto
                          ? <img src={best.player.foto} alt="" style={{ width:40,height:40,borderRadius:'50%',objectFit:'cover',border:'2px solid #00ff97' }}/>
                          : <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(0,255,151,0.08)',
                              border:'2px solid rgba(0,255,151,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}>🥇</div>
                        }
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'#00ff97' }}>{best.player.nombre}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{best.pts} pts</div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {subTab === 'history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {finished.length === 0 ? (
            <div className="glass-card" style={{ padding:48, textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
              No hay torneos finalizados aún
            </div>
          ) : (
            [...finished].reverse().map(t => {
              const winner = t.winner ? t.players.find(p=>p.id===t.winner) : null;
              const allM = [...t.matches, ...(t.elimMatches||[])].filter(m=>m.done);
              const MOD = { eliminacion:'Eliminación', roundrobin:'Round Robin', grupos:'Grupos+Elim.', dobles:'Dobles' };
              return (
                <div key={t.id} className="glass-card" style={{ padding:22 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontFamily:'Audiowide', fontSize:16, color:'#fff',
                        textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{t.nombre}</div>
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        {[MOD[t.modalidad], t.fecha, `${t.players.length} jugadores`, `${allM.length} partidos`].map((l,i)=>(
                          <span key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1 }}>{l}</span>
                        ))}
                      </div>
                    </div>
                    {winner && (
                      <div style={{ display:'flex', alignItems:'center', gap:10,
                        padding:'10px 16px', borderRadius:10,
                        background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.25)' }}>
                        {winner.foto
                          ? <img src={winner.foto} alt="" style={{ width:36,height:36,borderRadius:'50%',objectFit:'cover' }}/>
                          : <span style={{ fontSize:24 }}>🏆</span>
                        }
                        <div>
                          <div style={{ fontSize:9, color:'rgba(255,215,0,0.6)', textTransform:'uppercase', letterSpacing:2 }}>Campeón</div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#FFD700', fontFamily:'Audiowide' }}>{winner.nombre}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top 4 */}
                  <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
                    {(() => {
                      const tPts = calcTournamentPoints(t);
                      return t.players
                        .map(p => ({ p, pts: tPts[p.id] || 0 }))
                        .sort((a,b) => b.pts - a.pts)
                        .slice(0,4)
                        .map(({ p, pts }, i) => (
                          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:7,
                            padding:'6px 12px', borderRadius:8,
                            background: i===0?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.03)',
                            border: `1px solid ${i===0?'rgba(255,215,0,0.3)':'rgba(255,255,255,0.07)'}` }}>
                            <span style={{ color: ['#FFD700','#C0C0C0','#CD7F32','rgba(255,255,255,0.4)'][i],
                              fontSize:14 }}>
                              {['🥇','🥈','🥉','4°'][i]}
                            </span>
                            <span style={{ fontSize:12, color: i===0?'#FFD700':'rgba(255,255,255,0.6)',
                              fontWeight: i===0?700:400 }}>{p.nombre}</span>
                            <span style={{ fontSize:10, color:'rgba(0,255,151,0.6)', fontFamily:'Audiowide' }}>{pts}p</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── HEAD TO HEAD ── */}
      {subTab === 'h2h' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="glass-card" style={{ padding:22 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'center', marginBottom:20 }}>
              <div>
                <div className="label-neon">Jugador 1</div>
                <select className="inp" value={h2hP1||''} onChange={e=>setH2hP1(parseInt(e.target.value)||e.target.value)}>
                  {players.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <span style={{ color:'rgba(255,255,255,0.3)', fontWeight:700, fontSize:20, marginTop:20 }}>VS</span>
              <div>
                <div className="label-neon" style={{ color:'#3b82f6' }}>Jugador 2</div>
                <select className="inp" value={h2hP2||''} onChange={e=>setH2hP2(parseInt(e.target.value)||e.target.value)}
                  style={{ borderColor:'rgba(59,130,246,0.3)' }}>
                  {players.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            </div>

            {h2hData && h2hData.meetings.length > 0 ? (
              <>
                {/* Score */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16,
                  alignItems:'center', textAlign:'center', marginBottom:20 }}>
                  <div>
                    {h2hData.p1.foto
                      ? <img src={h2hData.p1.foto} alt="" style={{ width:64,height:64,borderRadius:'50%',
                          objectFit:'cover',border:'3px solid #00ff97',boxShadow:'0 0 16px rgba(0,255,151,0.4)',marginBottom:8,display:'block',margin:'0 auto 8px' }}/>
                      : <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(0,255,151,0.08)',
                          border:'3px solid #00ff97',display:'flex',alignItems:'center',justifyContent:'center',
                          margin:'0 auto 8px',fontSize:28 }}>🎾</div>
                    }
                    <div style={{ fontFamily:'Audiowide',fontSize:14,color:'#00ff97',textTransform:'uppercase' }}>
                      {h2hData.p1.nombre}
                    </div>
                    <div style={{ fontSize:48,fontWeight:700,fontFamily:'Audiowide',color:'#00ff97',
                      textShadow:'0 0 20px rgba(0,255,151,0.5)' }}>{h2hData.w1}</div>
                  </div>
                  <div style={{ fontSize:20,color:'rgba(255,255,255,0.2)',fontWeight:700 }}>–</div>
                  <div>
                    {h2hData.p2.foto
                      ? <img src={h2hData.p2.foto} alt="" style={{ width:64,height:64,borderRadius:'50%',
                          objectFit:'cover',border:'3px solid #3b82f6',boxShadow:'0 0 16px rgba(59,130,246,0.4)',
                          display:'block',margin:'0 auto 8px' }}/>
                      : <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(59,130,246,0.08)',
                          border:'3px solid #3b82f6',display:'flex',alignItems:'center',justifyContent:'center',
                          margin:'0 auto 8px',fontSize:28 }}>🎾</div>
                    }
                    <div style={{ fontFamily:'Audiowide',fontSize:14,color:'#3b82f6',textTransform:'uppercase' }}>
                      {h2hData.p2.nombre}
                    </div>
                    <div style={{ fontSize:48,fontWeight:700,fontFamily:'Audiowide',color:'#3b82f6',
                      textShadow:'0 0 20px rgba(59,130,246,0.5)' }}>{h2hData.w2}</div>
                  </div>
                </div>

                {/* Match history */}
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:16 }}>
                  <div className="label-neon" style={{ marginBottom:10 }}>Encuentros ({h2hData.meetings.length})</div>
                  {h2hData.meetings.map((m,i) => (
                    <div key={i} style={{ display:'flex',gap:12,alignItems:'center',padding:'8px 12px',
                      borderRadius:8,marginBottom:6,background:'rgba(255,255,255,0.02)',fontSize:12 }}>
                      <span style={{ color:'rgba(255,255,255,0.35)',width:80,flexShrink:0 }}>{m.date}</span>
                      <span style={{ flex:1,color:'rgba(255,255,255,0.4)',fontSize:11 }}>{m.tournament}</span>
                      <span style={{ fontWeight:700,color: m.winner.id===h2hData.p1.id?'#00ff97':'#3b82f6' }}>
                        {m.winner.nombre}
                      </span>
                      <span style={{ color:'rgba(255,255,255,0.3)',fontSize:11 }}>
                        {m.sets.map(([s1,s2])=>`${s1}-${s2}`).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center',color:'rgba(255,255,255,0.25)',padding:32 }}>
                {h2hData ? 'Estos jugadores nunca se enfrentaron' : 'Selecciona dos jugadores distintos'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PLAYER PROFILE ── */}
      {subTab === 'profile' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Selector */}
          <div className="glass-card" style={{ padding:18 }}>
            <div className="label-neon">Seleccionar Jugador</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
              {players.map(p => (
                <button key={p.id} onClick={()=>setSelectedPlayer(p.id)}
                  className={selectedPlayer===p.id?'cat-btn active':'cat-btn'}
                  style={{ fontSize:11 }}>{p.nombre}</button>
              ))}
            </div>
          </div>

          {playerProfile && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:16 }}>
              {/* Player card */}
              <div className="glass-card" style={{ padding:22, textAlign:'center' }}>
                {playerProfile.player.foto
                  ? <img src={playerProfile.player.foto} alt="" style={{ width:100,height:100,
                      borderRadius:'50%',objectFit:'cover',margin:'0 auto 12px',display:'block',
                      border:'3px solid #00ff97',boxShadow:'0 0 20px rgba(0,255,151,0.3)' }}/>
                  : <div style={{ width:100,height:100,borderRadius:'50%',background:'rgba(0,255,151,0.05)',
                      border:'3px solid rgba(0,255,151,0.3)',display:'flex',alignItems:'center',
                      justifyContent:'center',margin:'0 auto 12px',fontSize:40 }}>🎾</div>
                }
                <div style={{ fontFamily:'Audiowide',fontSize:16,color:'#00ff97',
                  textTransform:'uppercase',letterSpacing:1,marginBottom:4 }}>{playerProfile.player.nombre}</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:16 }}>
                  Cat. {playerProfile.player.categoria}
                  {playerProfile.player.edad?` · ${playerProfile.player.edad} años`:''}
                </div>
                <ProgressCircle rating={getFifaRating(playerProfile.player)} size="small"/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16 }}>
                  {[
                    { label:'Ranking', value:`#${(rankingData.findIndex(r=>r.player.id===playerProfile.player.id)+1)||'—'}` },
                    { label:'Puntos',  value: playerProfile.ranking?.pts||0 },
                    { label:'Victorias', value: playerProfile.wins },
                    { label:'Torneos', value: playerProfile.ranking?.trophies||0, suffix:'🏆' },
                  ].map(({ label, value, suffix }) => (
                    <div key={label} style={{ padding:'10px 8px',borderRadius:8,
                      background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize:18,fontWeight:700,fontFamily:'Audiowide',color:'#00ff97' }}>
                        {value}{suffix||''}
                      </div>
                      <div style={{ fontSize:9,textTransform:'uppercase',letterSpacing:1,
                        color:'rgba(255,255,255,0.35)',marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament history */}
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                <div className="glass-card" style={{ padding:20 }}>
                  <div className="label-neon" style={{ marginBottom:12 }}>Torneos Disputados</div>
                  {playerProfile.tournaments.length === 0
                    ? <div style={{ color:'rgba(255,255,255,0.25)',fontSize:12 }}>Sin torneos</div>
                    : playerProfile.tournaments.map(t => {
                        const isWinner = t.winner === playerProfile.player.id;
                        const tPts = calcTournamentPoints(t);
                        const myPts = tPts[playerProfile.player.id] || 0;
                        return (
                          <div key={t.id} style={{ display:'flex',alignItems:'center',gap:12,
                            padding:'10px 12px',borderRadius:8,marginBottom:6,
                            background: isWinner?'rgba(255,215,0,0.06)':'rgba(255,255,255,0.02)',
                            border: `1px solid ${isWinner?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.05)'}` }}>
                            <span style={{ fontSize:18 }}>{isWinner?'🏆':'🎾'}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:12,fontWeight:600,color:isWinner?'#FFD700':'#fff' }}>{t.nombre}</div>
                              <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)' }}>{t.fecha}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:13,fontWeight:700,color:'#00ff97',fontFamily:'Audiowide' }}>{myPts}p</div>
                              <div style={{ fontSize:9,color:t.status==='finished'?'rgba(0,255,151,0.5)':'rgba(255,170,0,0.6)',
                                textTransform:'uppercase',letterSpacing:1 }}>{t.status==='finished'?'Finalizado':'En curso'}</div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>

                {/* Radar */}
                <div className="glass-card" style={{ padding:20 }}>
                  <div className="label-neon" style={{ marginBottom:8 }}>Atributos</div>
                  <RadarChartComponent data={getChartData(playerProfile.player)} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { HistorialView });
