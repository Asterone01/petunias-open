// ─── Tournament Create Form ───────────────────────────────────────────────────
function TournamentCreate({ savedPlayers, onCreate, onCancel }) {
  const [form, setForm] = React.useState({
    nombre:'', fecha: new Date().toISOString().slice(0,10),
    modalidad:'eliminacion', formato:'bo3', categoria:'ALL'
  });
  const [selected, setSelected] = React.useState([]);
  const [newName, setNewName] = React.useState('');

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const filteredSaved = form.categoria==='ALL'
    ? savedPlayers
    : savedPlayers.filter(p=>p.categoria===form.categoria);

  const toggle = (player) => {
    setSelected(prev => prev.find(p=>p.id===player.id)
      ? prev.filter(p=>p.id!==player.id)
      : [...prev, player]);
  };

  const addNew = () => {
    if (!newName.trim()) return;
    const p = { id: Date.now()+Math.random(), nombre: newName.trim(),
      edad:'', genero:'M', categoria: form.categoria==='ALL'?'C':form.categoria,
      foto: null, derecha:5, reves:5, saque:5, volea:5, velocidad:5, mentalidad:5, slice:5, tecnica:5 };
    setSelected(prev=>[...prev, p]);
    setNewName('');
  };

  const handleCreate = () => {
    if (!form.nombre.trim()) return alert('Ingresa un nombre para el torneo');
    if (selected.length < 2) return alert('Necesitás al menos 2 jugadores');

    let matches = [], groups = null, elimMatches = null;
    if (form.modalidad === 'eliminacion') {
      matches = buildElimBracket(selected);
    } else if (form.modalidad === 'roundrobin') {
      matches = buildRoundRobin(selected);
    } else if (form.modalidad === 'grupos') {
      const gs = buildGroups(selected, 4);
      groups = gs;
      matches = buildGroupMatches(gs);
      elimMatches = [];
    } else if (form.modalidad === 'dobles') {
      matches = buildRoundRobin(selected);
    }

    onCreate({
      id: Date.now(), ...form,
      players: selected, matches,
      groups: groups || null,
      elimMatches: elimMatches || null,
      status: 'active', winner: null, createdAt: Date.now()
    });
  };

  const MODALS = [
    { key:'eliminacion', label:'Eliminación Directa', desc:'Bracket, el perdedor queda eliminado' },
    { key:'roundrobin',  label:'Round Robin',          desc:'Todos contra todos' },
    { key:'grupos',      label:'Grupos + Eliminación', desc:'Fase de grupos y luego bracket' },
    { key:'dobles',      label:'Dobles (Parejas)',     desc:'Round Robin con duplas' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Left: settings */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="glass-card" style={{ padding:22 }}>
            <div className="label-neon" style={{ marginBottom:16 }}>Configuración</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div className="label-neon">Nombre del Torneo</div>
                <input className="inp" value={form.nombre}
                  onChange={e=>set('nombre',e.target.value)} placeholder="Ej: Copa Petunias 2025"/>
              </div>
              <div>
                <div className="label-neon">Fecha</div>
                <input className="inp" type="date" value={form.fecha} onChange={e=>set('fecha',e.target.value)}/>
              </div>
              <div>
                <div className="label-neon">Formato de Sets</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[{k:'bo1',l:'1 Set'},{k:'bo2',l:'Mejor de 2'},{k:'bo3',l:'Mejor de 3'}].map(f=>(
                    <button key={f.k} onClick={()=>set('formato',f.k)}
                      className={form.formato===f.k?'cat-btn active':'cat-btn'} style={{ fontSize:10 }}>
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding:22 }}>
            <div className="label-neon" style={{ marginBottom:14 }}>Modalidad</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {MODALS.map(m=>(
                <button key={m.key} onClick={()=>set('modalidad',m.key)}
                  style={{
                    padding:'12px 14px', borderRadius:8, cursor:'pointer', textAlign:'left',
                    border: form.modalidad===m.key ? '1.5px solid #00ff97' : '1px solid rgba(255,255,255,0.1)',
                    background: form.modalidad===m.key ? 'rgba(0,255,151,0.08)' : 'transparent',
                    transition:'all .15s'
                  }}>
                  <div style={{ fontWeight:700, fontSize:12, color: form.modalidad===m.key?'#00ff97':'#fff',
                    fontFamily:'Audiowide', textTransform:'uppercase', letterSpacing:1 }}>{m.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: player selection */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="glass-card" style={{ padding:22, flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div className="label-neon" style={{ marginBottom:0 }}>
                Jugadores <span style={{ color:'rgba(255,255,255,0.4)',fontWeight:400 }}>({selected.length} sel.)</span>
              </div>
              <select className="inp" value={form.categoria} onChange={e=>set('categoria',e.target.value)}
                style={{ width:'auto', padding:'5px 10px', fontSize:11 }}>
                <option value="ALL">Todas las Cat.</option>
                {['A','B','C','D','E'].map(c=><option key={c} value={c}>Cat. {c}</option>)}
              </select>
            </div>

            {/* Saved players */}
            <div style={{ maxHeight:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
              {filteredSaved.length === 0
                ? <div style={{ color:'rgba(255,255,255,0.25)', fontSize:12, textAlign:'center', padding:16 }}>
                    No hay jugadores guardados en esta categoría
                  </div>
                : filteredSaved.map(p => {
                    const isSel = selected.find(s=>s.id===p.id);
                    return (
                      <div key={p.id} onClick={()=>toggle(p)}
                        style={{
                          display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                          borderRadius:7, cursor:'pointer', transition:'all .15s',
                          border: isSel ? '1px solid rgba(0,255,151,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          background: isSel ? 'rgba(0,255,151,0.08)' : 'rgba(255,255,255,0.02)'
                        }}>
                        {p.foto
                          ? <img src={p.foto} alt="" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover' }}/>
                          : <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,0.06)',
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎾</div>
                        }
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color: isSel?'#00ff97':'#fff' }}>{p.nombre}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Cat. {p.categoria} · {getFifaRating(p)} OVR</div>
                        </div>
                        <div style={{ width:20, height:20, borderRadius:'50%', border:'1.5px solid',
                          borderColor: isSel?'#00ff97':'rgba(255,255,255,0.2)',
                          background: isSel?'#00ff97':'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, color:'#000', fontWeight:700 }}>
                          {isSel ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            {/* Add new player */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12 }}>
              <div className="label-neon" style={{ marginBottom:8 }}>Agregar jugador rápido</div>
              <div style={{ display:'flex', gap:8 }}>
                <input className="inp" value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addNew()}
                  placeholder="Nombre del jugador" style={{ flex:1 }}/>
                <button className="btn-neon" onClick={addNew} style={{ padding:'10px 16px', fontSize:12, whiteSpace:'nowrap' }}>
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Selected summary */}
          {selected.length > 0 && (
            <div className="glass-card" style={{ padding:16 }}>
              <div className="label-neon" style={{ marginBottom:8 }}>Seleccionados ({selected.length})</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {selected.map(p=>(
                  <span key={p.id} onClick={()=>toggle(p)}
                    style={{ padding:'4px 10px', borderRadius:20, background:'rgba(0,255,151,0.12)',
                      border:'1px solid rgba(0,255,151,0.35)', color:'#00ff97', fontSize:11,
                      cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    {p.nombre.split(' ')[0]} <span style={{ opacity:.6, fontSize:10 }}>✕</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <button className="btn-outline" onClick={onCancel}>← Cancelar</button>
        <button className="btn-neon" onClick={handleCreate}>
          ✓ Crear Torneo ({selected.length} jugadores)
        </button>
      </div>
    </div>
  );
}

// ─── Tournament Detail ────────────────────────────────────────────────────────
function TournamentDetail({ tournament, onUpdate, onBack }) {
  const [activeModal, setActiveModal] = React.useState(null);
  const [modalType, setModalType] = React.useState('main');

  const totalRounds = tournament.matches.length
    ? Math.log2(nextPow2(tournament.players.length)) : 1;

  const isDone = (() => {
    if (tournament.modalidad === 'eliminacion') {
      const finals = tournament.matches.filter(m => m.round === totalRounds - 1);
      return finals.every(m => m.done);
    }
    return tournament.matches.every(m => m.done);
  })();

  const openMatch = (m, type='main') => { setActiveModal(m); setModalType(type); };

  const saveResult = (sets, winnerId) => {
    let newMatches = [...tournament.matches];
    let elimMatches = tournament.elimMatches ? [...tournament.elimMatches] : null;

    if (modalType === 'elim' && elimMatches) {
      elimMatches = setMatchResult(elimMatches, activeModal.id, sets, winnerId);
    } else {
      newMatches = setMatchResult(newMatches, activeModal.id, sets, winnerId);
    }

    // check if groups phase done → generate elim bracket
    let newElimMatches = elimMatches;
    if (tournament.modalidad === 'grupos' && newMatches.every(m=>m.done)) {
      const advancers = [];
      (tournament.groups||[]).forEach(g => {
        const st = getRRStandings(g.players, newMatches, g.id);
        st.slice(0,2).forEach(s => advancers.push(s.player));
      });
      if (!elimMatches || elimMatches.length === 0) {
        newElimMatches = buildElimBracket(advancers);
      }
    }

    // determine winner
    let winner = tournament.winner;
    if (tournament.modalidad === 'eliminacion') {
      const finalMatch = newMatches.find(m => m.round === totalRounds - 1);
      if (finalMatch?.done) winner = finalMatch.winner;
    } else if (newElimMatches && newElimMatches.every(m=>m.done)) {
      const fr = Math.max(...newElimMatches.map(m=>m.round));
      const fm = newElimMatches.find(m=>m.round===fr && m.done);
      if (fm) winner = fm.winner;
    } else if (['roundrobin','dobles'].includes(tournament.modalidad) && newMatches.every(m=>m.done)) {
      const st = getRRStandings(tournament.players, newMatches);
      winner = st[0]?.player.id || null;
    }

    onUpdate({ ...tournament, matches: newMatches,
      elimMatches: newElimMatches, winner,
      status: (winner || (isDone && !winner)) ? 'finished' : 'active' });
    setActiveModal(null);
  };

  const simulate = () => {
    if (!confirm('¿Simular todos los partidos restantes?')) return;
    let newMatches = [...tournament.matches];
    let elimMatches = tournament.elimMatches ? [...tournament.elimMatches] : null;
    const fmt = tournament.formato;

    const simAll = (ms) => {
      let updated = [...ms];
      let changed = true;
      while (changed) {
        changed = false;
        updated.forEach((m,i) => {
          if (!m.done && m.p1 && m.p2 && !m.bye) {
            const { sets, winnerId } = simulateMatch(m.p1, m.p2, fmt);
            updated = setMatchResult(updated, m.id, sets, winnerId);
            changed = true;
          }
        });
      }
      return updated;
    };

    newMatches = simAll(newMatches);

    if (tournament.modalidad === 'grupos') {
      let advancers = [];
      (tournament.groups||[]).forEach(g => {
        const st = getRRStandings(g.players, newMatches, g.id);
        st.slice(0,2).forEach(s => advancers.push(s.player));
      });
      elimMatches = simAll(buildElimBracket(advancers));
    }

    let winner = tournament.winner;
    if (['eliminacion'].includes(tournament.modalidad)) {
      const fr = Math.max(...newMatches.map(m=>m.round));
      const fm = newMatches.find(m=>m.round===fr&&m.done);
      if (fm) winner = fm.winner;
    } else if (elimMatches?.length) {
      const fr = Math.max(...elimMatches.map(m=>m.round));
      const fm = elimMatches.find(m=>m.round===fr&&m.done);
      if (fm) winner = fm.winner;
    } else {
      const st = getRRStandings(tournament.players, newMatches);
      winner = st[0]?.player.id || null;
    }

    onUpdate({ ...tournament, matches: newMatches, elimMatches, winner, status:'finished' });
  };

  const winnerPlayer = tournament.winner
    ? tournament.players.find(p => p.id === tournament.winner) : null;

  const MOD_LABELS = { eliminacion:'Eliminación Directa', roundrobin:'Round Robin', grupos:'Grupos+Elim.', dobles:'Dobles' };
  const FMT_LABELS  = { bo1:'1 Set', bo2:'Mejor de 2', bo3:'Mejor de 3' };

  const pending = [
    ...tournament.matches.filter(m=>!m.done&&!m.bye&&m.p1&&m.p2),
    ...(tournament.elimMatches||[]).filter(m=>!m.done&&!m.bye&&m.p1&&m.p2)
  ].length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div className="glass-card" style={{ padding:22 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontFamily:'Audiowide', fontSize:20, fontWeight:700,
              color:'#00ff97', textTransform:'uppercase', letterSpacing:2,
              textShadow:'0 0 12px rgba(0,255,151,0.5)', marginBottom:6 }}>{tournament.nombre}</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              {[
                { label: MOD_LABELS[tournament.modalidad] },
                { label: FMT_LABELS[tournament.formato] },
                { label: tournament.fecha },
                { label: `${tournament.players.length} jugadores` },
                { label: tournament.status === 'finished' ? '✓ Finalizado' : `${pending} pendientes`,
                  color: tournament.status==='finished'?'#00ff97':'#ffaa00' }
              ].map((t,i)=>(
                <span key={i} style={{ fontSize:11, color: t.color||'rgba(255,255,255,0.45)',
                  textTransform:'uppercase', letterSpacing:1 }}>{t.label}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {pending > 0 && (
              <button className="btn-outline" onClick={simulate}
                style={{ fontSize:11, padding:'8px 14px' }}>⚡ Simular</button>
            )}
            <button onClick={onBack} className="btn-outline"
              style={{ fontSize:11, padding:'8px 14px' }}>← Volver</button>
          </div>
        </div>

        {/* Winner banner */}
        {winnerPlayer && (
          <div style={{ marginTop:16, padding:'14px 18px', borderRadius:10,
            background:'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(0,255,151,0.05))',
            border:'1px solid rgba(255,215,0,0.3)',
            display:'flex', alignItems:'center', gap:12 }}>
            {winnerPlayer.foto
              ? <img src={winnerPlayer.foto} alt="" style={{ width:48, height:48,
                  borderRadius:'50%', objectFit:'cover', border:'2px solid #FFD700',
                  boxShadow:'0 0 14px rgba(255,215,0,0.5)' }}/>
              : <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,215,0,0.1)',
                  border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏆</div>
            }
            <div>
              <div style={{ fontSize:10, color:'rgba(255,215,0,0.7)', textTransform:'uppercase', letterSpacing:2 }}>Campeón</div>
              <div style={{ fontFamily:'Audiowide', fontSize:18, color:'#FFD700', fontWeight:700,
                textShadow:'0 0 10px rgba(255,215,0,0.6)' }}>{winnerPlayer.nombre}</div>
            </div>
          </div>
        )}
      </div>

      {/* Content by modality */}
      {tournament.modalidad === 'eliminacion' && (
        <div className="glass-card" style={{ padding:22 }}>
          <div className="label-neon" style={{ marginBottom:16 }}>Bracket</div>
          <EliminationBracket matches={tournament.matches}
            players={tournament.players} formato={tournament.formato}
            onMatchClick={openMatch}/>
        </div>
      )}

      {(tournament.modalidad === 'roundrobin' || tournament.modalidad === 'dobles') && (
        <RoundRobinView tournament={tournament} onMatchClick={openMatch}/>
      )}

      {tournament.modalidad === 'grupos' && (
        <GroupsView tournament={tournament} onMatchClick={openMatch}/>
      )}

      {/* Match modal */}
      {activeModal && (
        <MatchModal match={activeModal} formato={tournament.formato}
          onSave={saveResult} onClose={()=>setActiveModal(null)}/>
      )}
    </div>
  );
}

// ─── Tournament List ──────────────────────────────────────────────────────────
function TournamentList({ tournaments, onSelect, onCreate }) {
  const STATUS = { active:'En curso', finished:'Finalizado', draft:'Borrador' };
  const MODAL_LABELS = { eliminacion:'Elim.', roundrobin:'Round Robin', grupos:'Grupos', dobles:'Dobles' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:16,
          textTransform:'uppercase', letterSpacing:3 }}>Torneos</div>
        <button className="btn-neon" onClick={onCreate} style={{ fontSize:12, padding:'10px 20px' }}>
          + Nuevo Torneo
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="glass-card" style={{ padding:64, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16, opacity:.25 }}>🏆</div>
          <div style={{ color:'rgba(255,255,255,0.25)', textTransform:'uppercase',
            letterSpacing:3, fontSize:13, marginBottom:16 }}>No hay torneos aún</div>
          <button className="btn-neon" onClick={onCreate}>Crear primer torneo</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[...tournaments].reverse().map(t => {
            const winner = t.winner ? t.players.find(p=>p.id===t.winner) : null;
            const pending = [...t.matches, ...(t.elimMatches||[])].filter(m=>!m.done&&!m.bye&&m.p1&&m.p2).length;
            return (
              <div key={t.id} onClick={()=>onSelect(t.id)}
                className="glass-card"
                style={{ padding:20, cursor:'pointer', transition:'all .2s',
                  borderColor: t.status==='active'?'rgba(0,255,151,0.3)':undefined }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(0,255,151,0.5)'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,255,151,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.status==='active'?'rgba(0,255,151,0.3)':'rgba(0,255,151,0.15)'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontFamily:'Audiowide', fontSize:15, color:'#fff',
                      textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>{t.nombre}</div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      {[MODAL_LABELS[t.modalidad], t.fecha, `${t.players.length} jugadores`].map((l,i)=>(
                        <span key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.4)',
                          textTransform:'uppercase', letterSpacing:1 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    {winner && (
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {winner.foto
                          ? <img src={winner.foto} alt="" style={{ width:32, height:32, borderRadius:'50%',
                              objectFit:'cover', border:'2px solid #FFD700' }}/>
                          : <div style={{ width:32, height:32, borderRadius:'50%', fontSize:18,
                              display:'flex', alignItems:'center', justifyContent:'center' }}>🏆</div>
                        }
                        <span style={{ fontSize:12, color:'#FFD700', fontWeight:700 }}>{winner.nombre}</span>
                      </div>
                    )}
                    <div style={{
                      padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700,
                      textTransform:'uppercase', letterSpacing:1,
                      background: t.status==='finished'?'rgba(0,255,151,0.15)':t.status==='active'?'rgba(255,170,0,0.15)':'rgba(255,255,255,0.08)',
                      color: t.status==='finished'?'#00ff97':t.status==='active'?'#ffaa00':'rgba(255,255,255,0.4)',
                      border: `1px solid ${t.status==='finished'?'rgba(0,255,151,0.3)':t.status==='active'?'rgba(255,170,0,0.3)':'rgba(255,255,255,0.1)'}`
                    }}>{STATUS[t.status]}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Tournament Page ─────────────────────────────────────────────────────
function TournamentPage({ savedPlayers, tournaments, onSave }) {
  const [view, setView] = React.useState('list'); // list | create | detail
  const [selectedId, setSelectedId] = React.useState(null);

  const selectedTournament = tournaments.find(t=>t.id===selectedId);

  const handleCreate = (t) => {
    onSave([...tournaments, t]);
    setSelectedId(t.id);
    setView('detail');
  };

  const handleUpdate = (updated) => {
    onSave(tournaments.map(t => t.id===updated.id ? updated : t));
    setSelectedId(updated.id);
  };

  const handleSelect = (id) => { setSelectedId(id); setView('detail'); };

  return (
    <div>
      {view==='list'   && <TournamentList tournaments={tournaments} onSelect={handleSelect} onCreate={()=>setView('create')}/>}
      {view==='create' && <TournamentCreate savedPlayers={savedPlayers} onCreate={handleCreate} onCancel={()=>setView('list')}/>}
      {view==='detail' && selectedTournament && (
        <TournamentDetail tournament={selectedTournament} onUpdate={handleUpdate} onBack={()=>setView('list')}/>
      )}
    </div>
  );
}

Object.assign(window, { TournamentPage });
