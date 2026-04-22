// ─── Dashboard View ──────────────────────────────────────────────────────────
// Modular dashboard. Each widget is a draggable card. User can add / remove
// widgets and reorder via HTML5 drag-and-drop. Layout persists per user.

function DashboardView({ players, matches, tournaments, currentUser, onGoTab }) {
  const [layout, setLayout] = React.useState(() => getDashboardLayout(currentUser));
  const [editMode, setEditMode] = React.useState(false);
  const [draggingKey, setDraggingKey] = React.useState(null);
  const [overKey, setOverKey] = React.useState(null);

  // Persist layout on every change
  React.useEffect(() => {
    saveDashboardLayout(currentUser, layout);
  }, [layout, currentUser?.id]);

  // Re-hydrate when user changes
  React.useEffect(() => {
    setLayout(getDashboardLayout(currentUser));
  }, [currentUser?.id]);

  const available = widgetsAvailableFor(currentUser);
  const availableKeys = new Set(available.map(w => w.key));
  const missing = available.filter(w => !layout.includes(w.key));
  // Drop widgets no longer available for current role
  const cleanLayout = layout.filter(k => availableKeys.has(k));

  // ── DnD handlers ──
  const onDragStart = (key) => (e) => {
    if (!editMode) return;
    setDraggingKey(key);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', key); } catch {}
  };
  const onDragOver = (key) => (e) => {
    if (!editMode || !draggingKey) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (key !== overKey) setOverKey(key);
  };
  const onDrop = (targetKey) => (e) => {
    if (!editMode || !draggingKey) return;
    e.preventDefault();
    if (draggingKey === targetKey) { setDraggingKey(null); setOverKey(null); return; }
    const next = [...cleanLayout];
    const from = next.indexOf(draggingKey);
    const to   = next.indexOf(targetKey);
    if (from < 0 || to < 0) { setDraggingKey(null); setOverKey(null); return; }
    next.splice(from, 1);
    next.splice(to, 0, draggingKey);
    setLayout(next);
    setDraggingKey(null);
    setOverKey(null);
  };
  const onDragEnd = () => { setDraggingKey(null); setOverKey(null); };

  const removeWidget = (key) => setLayout(prev => prev.filter(k => k !== key));
  const addWidget    = (key) => setLayout(prev => [...prev, key]);
  const resetLayout  = () => setLayout(defaultLayoutFor(currentUser));

  const widgetProps = { players, matches, tournaments, currentUser, onGoTab };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:20,
            textTransform:'uppercase', letterSpacing:2 }}>Dashboard</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>
            {currentUser
              ? `${currentUser.isAdmin ? 'Admin' : currentUser.isCoach ? 'Coach' : 'Jugador'} · Arrastrá para reorganizar`
              : 'Vista de invitado · Ingresá para personalizar'}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={()=>setEditMode(m=>!m)}
            className={editMode ? 'btn-neon' : 'btn-outline'}
            style={{ padding:'8px 16px', fontSize:11 }}>
            {editMode ? '✓ Listo' : '✎ Editar'}
          </button>
          {editMode && (
            <button onClick={resetLayout} className="btn-outline"
              style={{ padding:'8px 16px', fontSize:11 }}>
              ↺ Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Available widgets panel (edit mode) */}
      {editMode && missing.length > 0 && (
        <div className="glass-card" style={{ padding:14 }}>
          <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:11,
            textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>
            + Añadir widget
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {missing.map(w => (
              <button key={w.key} onClick={()=>addWidget(w.key)}
                style={{ padding:'8px 12px', borderRadius:9999,
                  background:'rgba(0,255,151,0.08)',
                  border:'1px solid rgba(0,255,151,0.25)', color:'#fff',
                  fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <span>{w.icon}</span><span>{w.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of widgets */}
      {cleanLayout.length === 0 ? (
        <div className="glass-card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:10 }}>
            Tu dashboard está vacío
          </div>
          <button className="btn-neon" onClick={()=>{ setEditMode(true); }}
            style={{ padding:'8px 16px', fontSize:11 }}>+ Añadir widgets</button>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',
          gap:16,
        }}>
          {cleanLayout.map(key => {
            const meta = WIDGET_CATALOG.find(w => w.key === key);
            if (!meta) return null;
            const isDragging = draggingKey === key;
            const isOver = overKey === key && draggingKey && draggingKey !== key;
            return (
              <div key={key}
                draggable={editMode}
                onDragStart={onDragStart(key)}
                onDragOver={onDragOver(key)}
                onDrop={onDrop(key)}
                onDragEnd={onDragEnd}
                style={{
                  opacity: isDragging ? 0.4 : 1,
                  transform: isOver ? 'scale(1.02)' : 'scale(1)',
                  transition:'transform .15s ease, opacity .15s ease',
                  outline: isOver ? '2px solid #00ff97' : 'none',
                  outlineOffset: 4,
                  borderRadius: 8,
                  cursor: editMode ? 'grab' : 'default',
                }}>
                <WidgetFrame meta={meta} editMode={editMode}
                  onRemove={()=>removeWidget(key)}>
                  <WidgetBody widgetKey={key} {...widgetProps} />
                </WidgetFrame>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Widget frame ────────────────────────────────────────────────────────────
function WidgetFrame({ meta, editMode, onRemove, children }) {
  return (
    <div className="glass-card" style={{ padding:16, height:'100%',
      display:'flex', flexDirection:'column', gap:12, position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{meta.icon}</span>
          <span style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:11,
            textTransform:'uppercase', letterSpacing:1.5 }}>{meta.title}</span>
        </div>
        {editMode && (
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span title="Arrastrar" style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>⋮⋮</span>
            <button onClick={onRemove}
              style={{ background:'rgba(255,80,80,0.1)',
                border:'1px solid rgba(255,80,80,0.3)', color:'#ff9090',
                borderRadius:9999, width:24, height:24, cursor:'pointer',
                fontSize:11, lineHeight:1 }}>×</button>
          </div>
        )}
      </div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );
}

// ── Widget body dispatcher ──────────────────────────────────────────────────
function WidgetBody({ widgetKey, players, matches, tournaments, currentUser, onGoTab }) {
  switch (widgetKey) {
    case 'welcome':      return <WelcomeWidget user={currentUser} players={players} matches={matches}/>;
    case 'myStats':      return <MyStatsWidget user={currentUser} players={players} matches={matches}/>;
    case 'myRating':     return <MyRatingWidget user={currentUser} players={players} matches={matches}/>;
    case 'nextTraining': return <NextTrainingWidget user={currentUser} players={players} onGoTab={onGoTab}/>;
    case 'myEvaluation': return <MyEvaluationWidget user={currentUser} players={players}/>;
    case 'top5':         return <Top5Widget players={players} matches={matches}/>;
    case 'recentMatches':return <RecentMatchesWidget players={players} matches={matches}/>;
    case 'news':         return <NewsWidget/>;
    case 'monthMedals':  return <MonthMedalsWidget players={players} matches={matches}/>;
    case 'totals':       return <TotalsWidget players={players} matches={matches} tournaments={tournaments}/>;
    case 'adminQuick':   return <AdminQuickWidget onGoTab={onGoTab}/>;
    case 'coachTasks':   return <CoachTasksWidget user={currentUser}/>;
    case 'attendance':   return <AttendanceWidget players={players}/>;
    case 'calendar':     return <CalendarWidget tournaments={tournaments}/>;
    default: return <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Widget no disponible</div>;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function findLinkedPlayer(user, players) {
  if (!user) return null;
  if (user.playerId) {
    const p = players.find(pl => pl.id === user.playerId);
    if (p) return p;
  }
  if (user.nombre) {
    const p = players.find(pl => (pl.nombre || '').toLowerCase() === user.nombre.toLowerCase());
    if (p) return p;
  }
  return null;
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-AR', { day:'2-digit', month:'short' });
}

// ── Individual widgets ──────────────────────────────────────────────────────

function WelcomeWidget({ user, players, matches }) {
  const linked = findLinkedPlayer(user, players);
  const rating = linked?.rating ?? null;
  const tier = rating != null && typeof getTier === 'function' ? getTier(rating) : null;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{greeting},</div>
      <div style={{ fontFamily:'Audiowide', fontSize:22, color:'#fff',
        textTransform:'uppercase', letterSpacing:1 }}>
        {user ? user.nombre?.split(' ')[0] || 'Jugador' : 'Invitado'}
      </div>
      {linked ? (
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
          <div style={{ fontFamily:'Audiowide', fontSize:28, color:'#00ff97' }}>
            {Math.round(rating || 0)}
          </div>
          <div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)',
              textTransform:'uppercase', letterSpacing:1 }}>Rating</div>
            {tier && <div style={{ fontSize:11, color:'#00ff97',
              fontFamily:'Audiowide', letterSpacing:1 }}>{tier}</div>}
          </div>
        </div>
      ) : (
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>
          {user ? 'Perfil sin jugador vinculado' : 'Bienvenido a PETUNIAS OPEN'}
        </div>
      )}
    </div>
  );
}

function MyStatsWidget({ user, players, matches }) {
  const p = findLinkedPlayer(user, players);
  if (!p) return <EmptyLine text="Sin jugador vinculado"/>;
  const myMatches = (matches||[]).filter(m => m.playerAId === p.id || m.playerBId === p.id);
  const wins = myMatches.filter(m => m.winnerId === p.id).length;
  const losses = myMatches.length - wins;
  const wr = myMatches.length ? Math.round(wins*100/myMatches.length) : 0;
  const Stat = ({ label, val, color }) => (
    <div style={{ textAlign:'center', flex:1 }}>
      <div style={{ fontFamily:'Audiowide', fontSize:20, color: color || '#00ff97' }}>{val}</div>
      <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)',
        textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ display:'flex', gap:6 }}>
      <Stat label="Partidos" val={myMatches.length}/>
      <Stat label="Ganados"  val={wins}/>
      <Stat label="Perdidos" val={losses} color="#ff9090"/>
      <Stat label="Winrate"  val={`${wr}%`}/>
    </div>
  );
}

function MyRatingWidget({ user, players }) {
  const p = findLinkedPlayer(user, players);
  if (!p) return <EmptyLine text="Sin jugador vinculado"/>;
  const hist = (p.ratingHistory || []).slice(-12);
  if (hist.length < 2) return <EmptyLine text="Aún pocos movimientos"/>;
  const vals = hist.map(h => h.rating || 0);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = Math.max(1, max - min);
  const pts = vals.map((v,i) => {
    const x = (i / (vals.length-1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = vals[vals.length-1];
  const first = vals[0];
  const delta = Math.round(last - first);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
        <div style={{ fontFamily:'Audiowide', fontSize:22, color:'#00ff97' }}>{Math.round(last)}</div>
        <div style={{ fontSize:11, color: delta >= 0 ? '#00ff97' : '#ff9090', fontFamily:'Audiowide' }}>
          {delta >= 0 ? '+' : ''}{delta}
        </div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ width:'100%', height:60, display:'block' }}>
        <polyline points={pts} fill="none" stroke="#00ff97" strokeWidth="1.5"/>
      </svg>
      <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginTop:4,
        textTransform:'uppercase', letterSpacing:1 }}>
        Últimos {hist.length} movimientos
      </div>
    </div>
  );
}

function NextTrainingWidget({ user, players, onGoTab }) {
  const all = typeof getTrainings === 'function' ? getTrainings() : [];
  const now = Date.now();
  const upcoming = all.filter(t => t.fecha >= now).sort((a,b)=>a.fecha-b.fecha);
  const linked = findLinkedPlayer(user, players);
  // If user is linked to a player, try to find one that includes them
  const mine = linked ? upcoming.find(t => (t.playerIds||[]).includes(linked.id)) : null;
  const pick = mine || upcoming[0];
  if (!pick) return <EmptyLine text="No hay entrenamientos programados"/>;
  return (
    <div>
      <div style={{ fontSize:14, color:'#fff', fontWeight:600 }}>{pick.titulo || 'Entrenamiento'}</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:4 }}>
        📅 {fmtDate(pick.fecha)} · ⏱ {pick.duracionMin || 60} min
      </div>
      {pick.lugar && (
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>
          📍 {pick.lugar}
        </div>
      )}
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:6 }}>
        {(pick.playerIds||[]).length} jugador(es) · Coach: {pick.coachName || '—'}
      </div>
      <button onClick={()=>onGoTab && onGoTab('trainings')}
        style={{ marginTop:10, padding:'6px 12px', fontSize:10, borderRadius:9999,
          background:'rgba(0,255,151,0.08)', border:'1px solid rgba(0,255,151,0.25)',
          color:'#00ff97', cursor:'pointer', fontFamily:'Audiowide', letterSpacing:1,
          textTransform:'uppercase' }}>Ver todos</button>
    </div>
  );
}

function MyEvaluationWidget({ user, players }) {
  const linked = findLinkedPlayer(user, players);
  if (!linked) return <EmptyLine text="Sin jugador vinculado"/>;
  const evals = typeof getEvaluationsForPlayer === 'function'
    ? getEvaluationsForPlayer(linked.id) : [];
  const e = evals[0];
  if (!e) return <EmptyLine text="Aún no hay evaluaciones"/>;
  const entries = Object.entries(e.attrs || {}).slice(0, 4);
  return (
    <div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>
        {fmtDate(e.fecha)} · {e.coachName || 'Coach'}
      </div>
      <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
        {entries.map(([k,v]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)',
              textTransform:'capitalize', width:70 }}>{k}</div>
            <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.08)',
              borderRadius:9999, overflow:'hidden' }}>
              <div style={{ width:`${(v||0)*10}%`, height:'100%',
                background:'#00ff97' }}/>
            </div>
            <div style={{ fontFamily:'Audiowide', fontSize:10, color:'#00ff97', width:24 }}>{v}</div>
          </div>
        ))}
      </div>
      {(e.focusAreas || []).length > 0 && (
        <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:4 }}>
          {e.focusAreas.slice(0, 4).map((f,i)=>(
            <span key={i} style={{ fontSize:9, padding:'2px 8px', borderRadius:9999,
              background:'rgba(0,255,151,0.08)', color:'#00ff97',
              border:'1px solid rgba(0,255,151,0.25)' }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Top5Widget({ players, matches }) {
  // Use player.rating directly (kept in sync by match recording)
  const rows = [...(players||[])].sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0, 5);
  if (rows.length === 0) return <EmptyLine text="Sin jugadores"/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {rows.map((p,i) => {
        const colors = ['#FFD700','#C0C0C0','#CD7F32'];
        return (
          <div key={p.id} style={{ display:'grid',
            gridTemplateColumns:'22px 26px 1fr auto', gap:8, alignItems:'center' }}>
            <div style={{ fontFamily:'Audiowide', fontSize:12,
              color: colors[i] || 'rgba(255,255,255,0.5)' }}>#{i+1}</div>
            {p.foto
              ? <img src={p.foto} alt="" style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover' }}/>
              : <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(0,255,151,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>🎾</div>}
            <div style={{ fontSize:12, color:'#fff', overflow:'hidden',
              textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</div>
            <div style={{ fontFamily:'Audiowide', fontSize:12, color:'#00ff97' }}>
              {Math.round(p.rating||0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentMatchesWidget({ players, matches }) {
  const rows = [...(matches||[])].sort((a,b)=>b.date-a.date).slice(0, 5);
  if (rows.length === 0) return <EmptyLine text="Sin partidos"/>;
  const nameOf = (id) => players.find(p => p.id === id)?.nombre || '—';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {rows.map(m => {
        const a = nameOf(m.playerAId), b = nameOf(m.playerBId);
        const aw = m.winnerId === m.playerAId;
        return (
          <div key={m.id} style={{ fontSize:11, display:'flex',
            alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ color:'rgba(255,255,255,0.7)', overflow:'hidden',
              textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
              <span style={{ color: aw ? '#00ff97' : 'rgba(255,255,255,0.7)', fontWeight: aw?600:400 }}>{a}</span>
              {' vs '}
              <span style={{ color: !aw ? '#00ff97' : 'rgba(255,255,255,0.7)', fontWeight: !aw?600:400 }}>{b}</span>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{fmtDate(m.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

function NewsWidget() {
  let posts = [];
  try { posts = JSON.parse(localStorage.getItem('petunias-news') || '[]'); } catch {}
  const rows = [...posts].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0, 4);
  if (rows.length === 0) return <EmptyLine text="Sin publicaciones"/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {rows.map(p => (
        <div key={p.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)',
          paddingBottom:6 }}>
          <div style={{ fontSize:9, color:'#00ff97', fontFamily:'Audiowide',
            letterSpacing:1, textTransform:'uppercase' }}>
            {p.tipo || 'Noticia'} · {fmtDate(p.createdAt)}
          </div>
          <div style={{ fontSize:12, color:'#fff', marginTop:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {p.titulo || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthMedalsWidget({ players, matches }) {
  if (typeof computeMonthlyMedals !== 'function') return <EmptyLine text="No disponible"/>;
  const key = typeof getMonthKey === 'function' ? getMonthKey(Date.now()) : null;
  if (!key) return <EmptyLine text="—"/>;
  const data = computeMonthlyMedals(key, players, matches);
  const items = [
    { label:'Más partidos', rows:data.medals.mostPlayed,   unit:'played'     },
    { label:'Más victorias',rows:data.medals.mostWins,     unit:'wins'       },
    { label:'Mejor racha',  rows:data.medals.bestStreak,   unit:'bestStreak' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {items.map(it => {
        const top = it.rows[0];
        return (
          <div key={it.label} style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', gap:8, fontSize:11 }}>
            <div style={{ color:'rgba(255,255,255,0.55)' }}>{it.label}</div>
            <div style={{ color:'#fff', fontSize:11, display:'flex', gap:6 }}>
              {top ? (<>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis',
                  whiteSpace:'nowrap', maxWidth:100 }}>{top.nombre}</span>
                <span style={{ fontFamily:'Audiowide', color:'#00ff97' }}>{top[it.unit] ?? 0}</span>
              </>) : <span style={{ color:'rgba(255,255,255,0.3)' }}>—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TotalsWidget({ players, matches, tournaments }) {
  const trainings = typeof getTrainings === 'function' ? getTrainings() : [];
  const rows = [
    { label:'Jugadores',     val:(players||[]).length,     icon:'👥' },
    { label:'Partidos',      val:(matches||[]).length,     icon:'⚔️' },
    { label:'Torneos',       val:(tournaments||[]).length, icon:'🏆' },
    { label:'Entrenamientos',val:trainings.length,         icon:'🎾' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
      {rows.map(r => (
        <div key={r.label} style={{ padding:10, borderRadius:8,
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize:16 }}>{r.icon}</div>
          <div style={{ fontFamily:'Audiowide', fontSize:20, color:'#00ff97' }}>{r.val}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)',
            textTransform:'uppercase', letterSpacing:1 }}>{r.label}</div>
        </div>
      ))}
    </div>
  );
}

function AdminQuickWidget({ onGoTab }) {
  const actions = [
    { label:'+ Jugador',   tab:'add' },
    { label:'+ Partido',   tab:'matches' },
    { label:'+ Torneo',    tab:'torneos' },
    { label:'+ Entreno',   tab:'trainings' },
    { label:'+ Evaluación',tab:'evaluations' },
  ];
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {actions.map(a => (
        <button key={a.tab} onClick={()=>onGoTab && onGoTab(a.tab)}
          style={{ padding:'6px 12px', borderRadius:9999,
            background:'rgba(0,255,151,0.08)',
            border:'1px solid rgba(0,255,151,0.25)', color:'#fff',
            fontSize:10, cursor:'pointer', fontFamily:'Audiowide',
            letterSpacing:1 }}>{a.label}</button>
      ))}
    </div>
  );
}

function CoachTasksWidget({ user }) {
  const all = typeof getTrainings === 'function' ? getTrainings() : [];
  const now = Date.now();
  const mine = all.filter(t => (!user?.id || t.coachId === user.id) && t.fecha >= now)
    .sort((a,b)=>a.fecha-b.fecha).slice(0, 4);
  if (mine.length === 0) return <EmptyLine text="Sin entrenamientos a cargo"/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {mine.map(t => (
        <div key={t.id} style={{ fontSize:11, padding:'6px 8px', borderRadius:6,
          background:'rgba(255,255,255,0.03)' }}>
          <div style={{ color:'#fff' }}>{t.titulo || 'Entreno'}</div>
          <div style={{ color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:2 }}>
            📅 {fmtDate(t.fecha)} · {(t.playerIds||[]).length} jugador(es)
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceWidget({ players }) {
  const att = typeof getAttendance === 'function' ? getAttendance() : [];
  const recent = [...att].sort((a,b)=>b.recordedAt-a.recordedAt).slice(0, 5);
  if (recent.length === 0) return <EmptyLine text="Sin asistencias aún"/>;
  const nameOf = (id) => players.find(p=>p.id===id)?.nombre || '—';
  const icon = (s) => s==='presente' ? '✅' : s==='justificado' ? '🟡' : '❌';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {recent.map((a,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between', fontSize:11, gap:8 }}>
          <div style={{ color:'#fff', overflow:'hidden', textOverflow:'ellipsis',
            whiteSpace:'nowrap' }}>{icon(a.status)} {nameOf(a.playerId)}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>
            {fmtDate(a.recordedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget({ tournaments }) {
  const trainings = typeof getTrainings === 'function' ? getTrainings() : [];
  const now = Date.now();
  const upT = (tournaments||[]).filter(t=>t.fecha && t.fecha>=now)
    .map(t=>({ kind:'torneo', label:t.nombre || 'Torneo', ts:t.fecha }));
  const upTr = trainings.filter(t=>t.fecha>=now)
    .map(t=>({ kind:'entreno', label:t.titulo || 'Entreno', ts:t.fecha }));
  const all = [...upT, ...upTr].sort((a,b)=>a.ts-b.ts).slice(0, 5);
  if (all.length === 0) return <EmptyLine text="Agenda vacía"/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {all.map((e,i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between',
          gap:8, fontSize:11 }}>
          <div style={{ color:'#fff', overflow:'hidden', textOverflow:'ellipsis',
            whiteSpace:'nowrap' }}>
            <span style={{ fontSize:10, color:'#00ff97', marginRight:6 }}>
              {e.kind==='torneo'?'🏆':'🎾'}
            </span>
            {e.label}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{fmtDate(e.ts)}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyLine({ text }) {
  return (
    <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontStyle:'italic',
      padding:'8px 0' }}>{text}</div>
  );
}

Object.assign(window, { DashboardView });
