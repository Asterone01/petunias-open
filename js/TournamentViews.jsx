// ─── Match Result Modal ───────────────────────────────────────────────────────
function MatchModal({ match, formato, onSave, onClose }) {
  const maxSets = formato === 'bo3' ? 3 : 2;
  const [sets, setSets] = React.useState(
    match.sets.length ? match.sets : [[0,0]]
  );
  const [winnerId, setWinnerId] = React.useState(match.winner || '');

  const addSet = () => sets.length < maxSets && setSets([...sets, [0,0]]);
  const removeSet = (i) => setSets(sets.filter((_,j) => j!==i));
  const updateSet = (i, side, val) => {
    const next = sets.map((s,j) => j===i ? (side===0?[+val,s[1]]:[s[0],+val]) : s);
    setSets(next);
  };

  const autoWinner = () => {
    let w1=0,w2=0;
    sets.forEach(([s1,s2]) => { if(s1>s2) w1++; else if(s2>s1) w2++; });
    const need = formato==='bo3'?2:1;
    if(w1>=need && match.p1) return match.p1.id;
    if(w2>=need && match.p2) return match.p2.id;
    return '';
  };

  React.useEffect(() => { setWinnerId(autoWinner()); }, [sets]);

  const p1 = match.p1, p2 = match.p2;
  if (!p1 || !p2) return null;

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:100,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="glass-card" style={{ padding:28,width:'100%',maxWidth:440 }}>
        <div style={{ fontFamily:'Audiowide',color:'#00ff97',textAlign:'center',
          textTransform:'uppercase',letterSpacing:2,fontSize:14,marginBottom:20 }}>
          Resultado del Partido
        </div>

        {/* Players */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:12,
          alignItems:'center',marginBottom:24 }}>
          <PlayerChip player={p1} color="#00ff97" winner={winnerId===p1.id}/>
          <span style={{ color:'rgba(255,255,255,0.3)',fontWeight:700,fontSize:18 }}>VS</span>
          <PlayerChip player={p2} color="#3b82f6" winner={winnerId===p2.id} right/>
        </div>

        {/* Sets */}
        <div style={{ marginBottom:16 }}>
          <div className="label-neon">Sets</div>
          {sets.map((s,i) => (
            <div key={i} style={{ display:'flex',gap:10,alignItems:'center',marginBottom:8 }}>
              <span style={{ color:'rgba(255,255,255,0.4)',fontSize:11,width:40 }}>Set {i+1}</span>
              <input type="number" min={0} max={7} value={s[0]}
                onChange={e=>updateSet(i,0,e.target.value)}
                className="inp" style={{ width:60,textAlign:'center',padding:'8px' }}/>
              <span style={{ color:'rgba(255,255,255,0.3)' }}>–</span>
              <input type="number" min={0} max={7} value={s[1]}
                onChange={e=>updateSet(i,1,e.target.value)}
                className="inp" style={{ width:60,textAlign:'center',padding:'8px' }}/>
              {sets.length>1 && (
                <button onClick={()=>removeSet(i)}
                  style={{ background:'none',border:'none',color:'rgba(255,100,100,0.6)',cursor:'pointer',fontSize:16 }}>✕</button>
              )}
            </div>
          ))}
          {sets.length < maxSets && (
            <button onClick={addSet} className="btn-outline" style={{ fontSize:11,padding:'6px 14px',marginTop:4 }}>
              + Agregar set
            </button>
          )}
        </div>

        {/* Winner override */}
        <div style={{ marginBottom:24 }}>
          <div className="label-neon">Ganador</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {[p1,p2].map((p,ci) => (
              <button key={p.id} onClick={()=>setWinnerId(p.id)}
                style={{
                  padding:'10px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12,
                  textTransform:'uppercase',letterSpacing:1,transition:'all .2s',
                  border: winnerId===p.id ? `2px solid ${ci===0?'#00ff97':'#3b82f6'}` : '2px solid rgba(255,255,255,0.1)',
                  background: winnerId===p.id ? (ci===0?'rgba(0,255,151,0.15)':'rgba(59,130,246,0.15)') : 'transparent',
                  color: winnerId===p.id ? (ci===0?'#00ff97':'#3b82f6') : 'rgba(255,255,255,0.5)'
                }}>
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <button className="btn-outline" onClick={onClose} style={{ fontSize:12 }}>Cancelar</button>
          <button className="btn-neon" onClick={()=>winnerId && onSave(sets,winnerId)} style={{ fontSize:12 }}>
            ✓ Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerChip({ player, color, winner, right }) {
  return (
    <div style={{ textAlign: right?'right':'left', display:'flex', flexDirection:'column',
      alignItems: right?'flex-end':'flex-start', gap:4 }}>
      {player.foto
        ? <img src={player.foto} alt={player.nombre} style={{ width:44,height:44,borderRadius:'50%',
            objectFit:'cover', border:`2px solid ${winner?color:'rgba(255,255,255,0.1)'}`,
            boxShadow: winner?`0 0 10px ${color}55`:undefined }}/>
        : <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.05)',
            border:`2px solid ${winner?color:'rgba(255,255,255,0.1)'}`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🎾</div>
      }
      <span style={{ fontSize:11,fontWeight:700,color:winner?color:'rgba(255,255,255,0.7)',
        fontFamily:'Audiowide',textTransform:'uppercase',letterSpacing:.5 }}>
        {player.nombre.split(' ')[0]}
      </span>
    </div>
  );
}

// ─── Elimination Bracket ──────────────────────────────────────────────────────
function EliminationBracket({ matches, players, formato, onMatchClick }) {
  const totalRounds = matches.length ? Math.max(...matches.map(m=>m.round))+1 : 1;
  const rounds = Array.from({length:totalRounds},(_,r)=>
    matches.filter(m=>m.round===r).sort((a,b)=>a.position-b.position)
  );

  return (
    <div style={{ overflowX:'auto', paddingBottom:16 }}>
      <div style={{ display:'flex',gap:0,minWidth: rounds.length*220 }}>
        {rounds.map((rMatches,r) => (
          <div key={r} style={{ flex:1, display:'flex',flexDirection:'column' }}>
            {/* Round label */}
            <div style={{ textAlign:'center',padding:'8px 4px',
              fontFamily:'Audiowide',fontSize:10,textTransform:'uppercase',
              letterSpacing:2,color:'#00ff97',marginBottom:8 }}>
              {getRoundName(r, totalRounds)}
            </div>
            {/* Matches */}
            <div style={{ display:'flex',flexDirection:'column',
              justifyContent:'space-around',flex:1,gap:8,padding:'0 8px' }}>
              {rMatches.map(m => (
                <BracketMatch key={m.id} match={m} totalRounds={totalRounds}
                  round={r} onClick={()=>!m.bye && m.p1 && m.p2 && onMatchClick(m)}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({ match, round, totalRounds, onClick }) {
  const isFinal = round === totalRounds - 1;
  const canPlay = match.p1 && match.p2 && !match.bye;
  const done = match.done && match.winner;

  return (
    <div onClick={canPlay ? onClick : undefined}
      style={{
        borderRadius:8, overflow:'hidden',
        border: done ? '1px solid rgba(0,255,151,0.4)' : '1px solid rgba(255,255,255,0.1)',
        cursor: canPlay ? 'pointer' : 'default',
        transition:'all .2s',
        background: isFinal ? 'rgba(0,255,151,0.05)' : 'rgba(13,18,37,0.8)',
        boxShadow: done ? '0 0 12px rgba(0,255,151,0.1)' : undefined
      }}
      onMouseEnter={e=>{ if(canPlay) e.currentTarget.style.borderColor='#00ff97'; }}
      onMouseLeave={e=>{ if(canPlay) e.currentTarget.style.borderColor = done?'rgba(0,255,151,0.4)':'rgba(255,255,255,0.1)'; }}>
      <BracketSlot player={match.p1} isWinner={match.winner && match.p1?.id===match.winner} sets={match.sets} side={0} done={done}/>
      <div style={{ height:1,background:'rgba(255,255,255,0.07)' }}/>
      <BracketSlot player={match.p2} isWinner={match.winner && match.p2?.id===match.winner} sets={match.sets} side={1} done={done}/>
    </div>
  );
}

function BracketSlot({ player, isWinner, sets, side, done }) {
  const setsWon = sets.filter(([s1,s2])=> side===0 ? s1>s2 : s2>s1).length;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
      background: isWinner ? 'rgba(0,255,151,0.1)' : 'transparent',
      minHeight:36 }}>
      {player?.foto
        ? <img src={player.foto} alt="" style={{ width:22,height:22,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/>
        : <div style={{ width:22,height:22,borderRadius:'50%',background:'rgba(255,255,255,0.05)',flexShrink:0 }}/>
      }
      <span style={{ flex:1,fontSize:11,fontWeight: isWinner?700:400,
        color: player ? (isWinner?'#00ff97':'rgba(255,255,255,0.75)') : 'rgba(255,255,255,0.2)',
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'Audiowide' }}>
        {player ? player.nombre.split(' ')[0].toUpperCase() : 'TBD'}
      </span>
      {done && <span style={{ fontSize:12,fontWeight:700,color:isWinner?'#00ff97':'rgba(255,255,255,0.35)',
        fontFamily:'Audiowide',minWidth:16,textAlign:'right' }}>{setsWon}</span>}
    </div>
  );
}

// ─── Round Robin Table ────────────────────────────────────────────────────────
function RoundRobinView({ tournament, onMatchClick }) {
  const standings = getRRStandings(tournament.players, tournament.matches);
  const pending = tournament.matches.filter(m => !m.done);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {/* Standings */}
      <div className="glass-card" style={{ padding:20,overflowX:'auto' }}>
        <div className="label-neon" style={{ marginBottom:12 }}>Tabla de Posiciones</div>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(0,255,151,0.2)' }}>
              {['#','Jugador','PJ','G','P','Sets+','Sets-','Pts'].map(h=>(
                <th key={h} style={{ padding:'6px 10px',textAlign: h==='Jugador'?'left':'center',
                  color:'rgba(0,255,151,0.7)',fontSize:10,textTransform:'uppercase',letterSpacing:1,fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((s,i)=>(
              <tr key={s.player.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,151,0.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'8px 10px',textAlign:'center',fontFamily:'Audiowide',
                  color: i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'rgba(255,255,255,0.5)',fontWeight:700 }}>
                  {i+1}
                </td>
                <td style={{ padding:'8px 10px',display:'flex',alignItems:'center',gap:8 }}>
                  {s.player.foto
                    ? <img src={s.player.foto} alt="" style={{ width:28,height:28,borderRadius:'50%',objectFit:'cover' }}/>
                    : <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.05)' }}/>
                  }
                  <span style={{ fontWeight:600,color:'#fff' }}>{s.player.nombre}</span>
                </td>
                {[s.w+s.l,s.w,s.l,s.setsW,s.setsL].map((v,j)=>(
                  <td key={j} style={{ padding:'8px 10px',textAlign:'center',
                    color: j===1?'#00ff97':j===2?'#ff6b6b':'rgba(255,255,255,0.6)' }}>{v}</td>
                ))}
                <td style={{ padding:'8px 10px',textAlign:'center',fontFamily:'Audiowide',
                  fontWeight:700,color:'#00ff97',fontSize:14 }}>{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending matches */}
      {pending.length > 0 && (
        <div className="glass-card" style={{ padding:20 }}>
          <div className="label-neon" style={{ marginBottom:12 }}>Partidos Pendientes</div>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {pending.map(m=>(
              <div key={m.id} onClick={()=>onMatchClick(m)}
                style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',
                  borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',
                  transition:'all .2s',background:'rgba(255,255,255,0.02)' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#00ff97'; e.currentTarget.style.background='rgba(0,255,151,0.05)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}>
                <span style={{ flex:1,fontSize:13,fontWeight:600 }}>{m.p1.nombre}</span>
                <span style={{ color:'rgba(255,255,255,0.3)',fontSize:11 }}>vs</span>
                <span style={{ flex:1,fontSize:13,fontWeight:600,textAlign:'right' }}>{m.p2.nombre}</span>
                <span style={{ color:'#00ff97',fontSize:11,marginLeft:8 }}>▶</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done matches */}
      <DoneMatchesList matches={tournament.matches.filter(m=>m.done)} />
    </div>
  );
}

function DoneMatchesList({ matches }) {
  if (!matches.length) return null;
  return (
    <div className="glass-card" style={{ padding:20 }}>
      <div className="label-neon" style={{ marginBottom:12 }}>Resultados</div>
      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
        {matches.map(m=>(
          <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,
            padding:'8px 14px',borderRadius:8,background:'rgba(255,255,255,0.02)',fontSize:12 }}>
            <span style={{ flex:1,fontWeight: m.winner===m.p1?.id?700:400,
              color: m.winner===m.p1?.id?'#00ff97':'rgba(255,255,255,0.5)' }}>{m.p1?.nombre}</span>
            <span style={{ color:'rgba(255,255,255,0.35)',fontSize:11 }}>
              {m.sets.map(([s1,s2])=>`${s1}-${s2}`).join(' ')}
            </span>
            <span style={{ flex:1,fontWeight: m.winner===m.p2?.id?700:400,textAlign:'right',
              color: m.winner===m.p2?.id?'#00ff97':'rgba(255,255,255,0.5)' }}>{m.p2?.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Groups View ──────────────────────────────────────────────────────────────
function GroupsView({ tournament, onMatchClick }) {
  const groups = tournament.groups || [];
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {groups.map(g=>{
        const gMatches = tournament.matches.filter(m=>m.groupId===g.id);
        const standings = getRRStandings(g.players, gMatches, g.id);
        return (
          <div key={g.id} className="glass-card" style={{ padding:20 }}>
            <div style={{ fontFamily:'Audiowide',color:'#00ff97',fontSize:13,
              textTransform:'uppercase',letterSpacing:2,marginBottom:12 }}>{g.name}</div>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12,marginBottom:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(0,255,151,0.15)' }}>
                  {['#','Jugador','G','P','Pts'].map(h=>(
                    <th key={h} style={{ padding:'4px 8px',textAlign:h==='Jugador'?'left':'center',
                      color:'rgba(0,255,151,0.6)',fontSize:9,textTransform:'uppercase',letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((s,i)=>(
                  <tr key={s.player.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',
                    background: i<2?'rgba(0,255,151,0.04)':undefined }}>
                    <td style={{ padding:'6px 8px',textAlign:'center',color:i<2?'#00ff97':'rgba(255,255,255,0.4)',
                      fontWeight:700,fontSize:10 }}>{i+1}{i<2?' ✓':''}</td>
                    <td style={{ padding:'6px 8px',fontWeight:600 }}>{s.player.nombre}</td>
                    <td style={{ padding:'6px 8px',textAlign:'center',color:'#00ff97' }}>{s.w}</td>
                    <td style={{ padding:'6px 8px',textAlign:'center',color:'#ff6b6b' }}>{s.l}</td>
                    <td style={{ padding:'6px 8px',textAlign:'center',fontWeight:700,
                      fontFamily:'Audiowide',color:'#00ff97' }}>{s.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              {gMatches.filter(m=>!m.done).map(m=>(
                <div key={m.id} onClick={()=>onMatchClick(m)}
                  style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                    borderRadius:7,border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontSize:12,
                    transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#00ff97'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <span style={{ flex:1,fontWeight:600 }}>{m.p1.nombre}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)',fontSize:10 }}>vs</span>
                  <span style={{ flex:1,textAlign:'right',fontWeight:600 }}>{m.p2.nombre}</span>
                  <span style={{ color:'#00ff97',fontSize:11 }}>▶</span>
                </div>
              ))}
              {gMatches.filter(m=>m.done).map(m=>(
                <div key={m.id} style={{ display:'flex',alignItems:'center',gap:10,
                  padding:'7px 10px',borderRadius:7,background:'rgba(255,255,255,0.02)',fontSize:11 }}>
                  <span style={{ flex:1,fontWeight:m.winner===m.p1?.id?700:400,
                    color:m.winner===m.p1?.id?'#00ff97':'rgba(255,255,255,0.45)' }}>{m.p1?.nombre}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)',fontSize:10 }}>
                    {m.sets.map(([s1,s2])=>`${s1}-${s2}`).join(' ')}
                  </span>
                  <span style={{ flex:1,textAlign:'right',fontWeight:m.winner===m.p2?.id?700:400,
                    color:m.winner===m.p2?.id?'#00ff97':'rgba(255,255,255,0.45)' }}>{m.p2?.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {/* Elimination phase if groups are done */}
      {tournament.elimMatches && tournament.elimMatches.length > 0 && (
        <div className="glass-card" style={{ padding:20 }}>
          <div className="label-neon" style={{ marginBottom:12 }}>Fase Eliminatoria</div>
          <EliminationBracket matches={tournament.elimMatches}
            players={tournament.players} formato={tournament.formato}
            onMatchClick={m=>onMatchClick(m,'elim')}/>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MatchModal, EliminationBracket, RoundRobinView, GroupsView, PlayerChip, DoneMatchesList });
