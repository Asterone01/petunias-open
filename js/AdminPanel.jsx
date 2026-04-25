// ─── Admin Panel ─────────────────────────────────────────────────────────────

// ─── Modal: Invitar / Crear Jugador (Admin Only) ─────────────────────────────
function InvitePlayerModal({ onClose }) {
  const [form, setForm] = React.useState({ email: '', nombre: '', password: '', confirm: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.nombre.trim()) { setError('Ingresá el nombre del jugador.'); return; }
    if (!form.email.trim()) { setError('Ingresá un email válido.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return; }

    setLoading(true);
    try {
      if (!window.db) throw new Error('No hay conexión con Supabase.');
      const { data, error: authError } = await window.db.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { nombre: form.nombre.trim() } },
      });
      if (authError) throw authError;

      if (data?.user?.identities?.length === 0) {
        setError('Ya existe una cuenta con ese email.');
      } else {
        setSuccess(`✓ Cuenta creada para ${form.nombre}. Se le enviará un email de confirmación.`);
        setForm({ email: '', nombre: '', password: '', confirm: '' });
      }
    } catch (err) {
      const msg = err.message || 'Error desconocido';
      if (msg.includes('User already registered') || msg.includes('already been registered')) {
        setError('Ya existe una cuenta con ese email.');
      } else if (msg.includes('Password should be')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#181818', border: '1px solid rgba(0,255,151,0.25)', borderRadius: 20,
        padding: 36, width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,151,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'Audiowide', color: '#00ff97', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
              Invitar / Crear Jugador
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              Solo el administrador puede crear cuentas.
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nombre */}
          <div>
            <div className="label-neon">Nombre Completo</div>
            <input className="inp" type="text" value={form.nombre}
              onChange={e => set('nombre', e.target.value)} placeholder="Ej: Carlos García" required />
          </div>

          {/* Email */}
          <div>
            <div className="label-neon">Email</div>
            <input className="inp" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="jugador@email.com" required />
          </div>

          {/* Contraseña */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="label-neon">Contraseña</div>
              <input className="inp" type="password" value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <div className="label-neon">Confirmar</div>
              <input className="inp" type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} placeholder="••••••••" required />
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10,
              background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)',
              color: '#ff6b6b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', borderRadius: 10,
              background: 'rgba(0,255,151,0.08)', border: '1px solid rgba(0,255,151,0.25)',
              color: '#00ff97', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              {success}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ fontSize: 12 }}>Cancelar</button>
            <button type="submit" className="btn-neon" disabled={loading} style={{ fontSize: 12 }}>
              {loading ? '...' : '✓ Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
function AdminPanel({ players, tournaments, onPlayersChange, onTournamentsChange, onClose }) {
  const [tab, setTab] = React.useState('users');
  const [users, setUsers] = React.useState(() => getAllUsers());
  const [showInvite, setShowInvite] = React.useState(false);

  const refreshUsers = () => setUsers(getAllUsers());

  const TABS = [
    { key:'users',       label:'Usuarios' },
    { key:'players',     label:'Jugadores' },
    { key:'historico',   label:'Histórico' },
    { key:'tournaments', label:'Torneos' },
    { key:'backup',      label:'Backup' },
  ];

  return (
    <>
      <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:190,
        display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="glass-card" style={{ width:'100%',maxWidth:800,maxHeight:'92vh',
          overflow:'hidden',display:'flex',flexDirection:'column',
          border:'1px solid rgba(255,215,0,0.2)' }}>

          {/* Header */}
          <div style={{ padding:'20px 24px',borderBottom:'1px solid rgba(255,215,0,0.15)',
            display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <span style={{ fontSize:20 }}>⚙</span>
              <span style={{ fontFamily:'Audiowide',color:'#FFD700',fontSize:14,
                textTransform:'uppercase',letterSpacing:2 }}>Panel Admin</span>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              {/* ── BOTÓN PRINCIPAL: INVITAR/CREAR JUGADOR ── */}
              <button
                onClick={() => setShowInvite(true)}
                style={{
                  padding:'8px 16px',
                  background:'rgba(0,255,151,0.1)',
                  border:'1px solid rgba(0,255,151,0.4)',
                  color:'#00ff97',
                  borderRadius:20,
                  cursor:'pointer',
                  fontFamily:'Audiowide',
                  fontSize:11,
                  textTransform:'uppercase',
                  letterSpacing:1.5,
                  transition:'all .15s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,151,0.2)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,255,151,0.1)';}}
              >
                + Invitar / Crear Jugador
              </button>
              <button onClick={onClose}
                style={{ background:'none',border:'none',color:'rgba(255,255,255,0.4)',
                  cursor:'pointer',fontSize:20,lineHeight:1 }}>✕</button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display:'flex',gap:0,borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                style={{ flex:1,padding:'12px',border:'none',cursor:'pointer',
                  fontFamily:'Audiowide',fontSize:11,textTransform:'uppercase',letterSpacing:1,
                  background: tab===t.key?'rgba(255,215,0,0.08)':'transparent',
                  color: tab===t.key?'#FFD700':'rgba(255,255,255,0.4)',
                  borderBottom: tab===t.key?'2px solid #FFD700':'2px solid transparent',
                  transition:'all .15s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex:1,overflowY:'auto',padding:24 }}>

            {/* USERS */}
            {tab === 'users' && (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)',
                  textTransform:'uppercase',letterSpacing:2,marginBottom:4 }}>
                  {users.length} usuarios registrados
                </div>
                {users.map(u=>(
                  <div key={u.id} style={{ display:'flex',alignItems:'center',gap:12,
                    padding:'12px 16px',borderRadius:10,
                    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                    {u.avatar
                      ? <img src={u.avatar} alt="" style={{ width:40,height:40,borderRadius:'50%',objectFit:'cover' }}/>
                      : <div style={{ width:40,height:40,borderRadius:'50%',
                          background:'rgba(255,255,255,0.06)',display:'flex',
                          alignItems:'center',justifyContent:'center',fontSize:18 }}>👤</div>
                    }
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600,fontSize:13,
                        color: u.isAdmin?'#FFD700':u.isCoach?'#3b82f6':'#fff' }}>
                        {u.nombre} {u.isAdmin&&'⭐'} {u.isCoach&&'🎾'}
                      </div>
                      <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)' }}>{u.email}</div>
                    </div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.2)',
                      textTransform:'uppercase' }}>
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </div>
                    {!u.isAdmin && (
                      <button onClick={()=>{ setUserCoach(u.id, !u.isCoach); refreshUsers(); }}
                        title={u.isCoach?'Quitar rol coach':'Marcar como coach'}
                        style={{ padding:'5px 10px',
                          background: u.isCoach?'rgba(59,130,246,0.15)':'rgba(59,130,246,0.04)',
                          border:`1px solid ${u.isCoach?'#3b82f6':'rgba(59,130,246,0.2)'}`,
                          color:u.isCoach?'#3b82f6':'rgba(59,130,246,0.5)',
                          borderRadius:6,cursor:'pointer',fontSize:11 }}>
                        {u.isCoach?'✓ Coach':'+ Coach'}
                      </button>
                    )}
                    {!u.isAdmin && (
                      <button onClick={()=>{
                        if(!confirm(`¿Eliminar usuario ${u.nombre}?`)) return;
                        deleteUserById(u.id); refreshUsers();
                      }}
                        style={{ padding:'5px 10px',background:'rgba(192,57,43,0.1)',
                          border:'1px solid rgba(192,57,43,0.3)',color:'#e74c3c',
                          borderRadius:6,cursor:'pointer',fontSize:11 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PLAYERS */}
            {tab === 'players' && (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)',
                  textTransform:'uppercase',letterSpacing:2,marginBottom:4 }}>
                  {players.length} jugadores guardados
                </div>
                {players.map(p=>(
                  <div key={p.id} style={{ display:'flex',alignItems:'center',gap:12,
                    padding:'10px 14px',borderRadius:10,
                    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                    {p.foto
                      ? <img src={p.foto} alt="" style={{ width:40,height:40,borderRadius:'50%',objectFit:'cover' }}/>
                      : <div style={{ width:40,height:40,borderRadius:'50%',
                          background:'rgba(0,255,151,0.06)',display:'flex',
                          alignItems:'center',justifyContent:'center',fontSize:18 }}>🎾</div>
                    }
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600,fontSize:13 }}>{p.nombre}</div>
                      <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)' }}>
                        Cat. {p.categoria} · OVR {getFifaRating(p)}
                        {p.edad?` · ${p.edad} años`:''}
                      </div>
                    </div>
                    <button onClick={()=>{
                      if(!confirm(`¿Eliminar a ${p.nombre}?`)) return;
                      onPlayersChange(players.filter(x=>x.id!==p.id));
                    }}
                      style={{ padding:'5px 10px',background:'rgba(192,57,43,0.1)',
                        border:'1px solid rgba(192,57,43,0.3)',color:'#e74c3c',
                        borderRadius:6,cursor:'pointer',fontSize:11 }}>✕ Eliminar</button>
                  </div>
                ))}
              </div>
            )}

            {/* HISTORICO */}
            {tab === 'historico' && (
              <HistoricoTab players={players} onPlayersChange={onPlayersChange}/>
            )}

            {/* TOURNAMENTS */}
            {tab === 'tournaments' && (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)',
                  textTransform:'uppercase',letterSpacing:2,marginBottom:4 }}>
                  {tournaments.length} torneos
                </div>
                {tournaments.map(t=>(
                  <div key={t.id} style={{ display:'flex',alignItems:'center',gap:12,
                    padding:'12px 16px',borderRadius:10,
                    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:22 }}>
                      {t.status==='finished'?'🏆':t.status==='active'?'⚡':'📋'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600,fontSize:13 }}>{t.nombre}</div>
                      <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)' }}>
                        {t.fecha} · {t.players.length} jugadores ·{' '}
                        <span style={{ color:t.status==='finished'?'#00ff97':'#ffaa00' }}>
                          {t.status==='finished'?'Finalizado':'En curso'}
                        </span>
                      </div>
                    </div>
                    <button onClick={()=>{
                      if(!confirm(`¿Eliminar torneo "${t.nombre}"?`)) return;
                      onTournamentsChange(tournaments.filter(x=>x.id!==t.id));
                    }}
                      style={{ padding:'5px 10px',background:'rgba(192,57,43,0.1)',
                        border:'1px solid rgba(192,57,43,0.3)',color:'#e74c3c',
                        borderRadius:6,cursor:'pointer',fontSize:11 }}>✕ Eliminar</button>
                  </div>
                ))}
              </div>
            )}

            {/* BACKUP */}
            {tab === 'backup' && (
              <BackupPanel players={players} tournaments={tournaments}
                onPlayersChange={onPlayersChange} onTournamentsChange={onTournamentsChange}/>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal — rendered outside the AdminPanel overlay so z-index stacks correctly */}
      {showInvite && <InvitePlayerModal onClose={() => setShowInvite(false)} />}
    </>
  );
}

// ─── Histórico Tab (seed de datos pasados) ───────────────────────────────────
function HistoricoTab({ players, onPlayersChange }) {
  const [drafts, setDrafts] = React.useState(() =>
    players.map(p => {
      const pe = ensurePlayerRating({ ...p });
      return {
        id: p.id, nombre: p.nombre, categoria: pe.categoria,
        rating: pe.rating, wins: pe.wins, losses: pe.losses, streak: pe.streak,
      };
    })
  );
  const [quickCat, setQuickCat] = React.useState('');
  const [quickRating, setQuickRating] = React.useState('');

  const setField = (id, k, v) => setDrafts(ds => ds.map(d => d.id === id ? { ...d, [k]: v } : d));

  const applyQuick = () => {
    if (!quickCat || !quickRating) return alert('Elegí categoría y rating inicial');
    const r = Number(quickRating);
    setDrafts(ds => ds.map(d => d.categoria === quickCat ? { ...d, rating: r } : d));
  };

  const saveAll = () => {
    if (!confirm('Esto sobrescribirá rating, victorias, derrotas y racha de los jugadores modificados. ¿Continuar?')) return;
    const now = Date.now();
    const updated = players.map(p => {
      const d = drafts.find(x => x.id === p.id);
      if (!d) return p;
      const cur = ensurePlayerRating({ ...p });
      const nR = Number(d.rating) || cur.rating;
      const nW = Number(d.wins) || 0;
      const nL = Number(d.losses) || 0;
      const nS = Number(d.streak) || 0;
      const changed = nR !== cur.rating || nW !== cur.wins || nL !== cur.losses || nS !== cur.streak;
      if (!changed) return p;
      return {
        ...cur,
        rating: nR, wins: nW, losses: nL, streak: nS,
        categoria: getCategoryFromRating(nR),
        ratingHistory: [
          ...cur.ratingHistory,
          { date: now, rating: nR, reason: 'ajuste-historico', wins: nW, losses: nL },
        ],
      };
    });
    onPlayersChange(updated);
    alert('✓ Datos históricos aplicados');
  };

  const cellStyle = {
    width: '100%', padding: '6px 8px', borderRadius: 6,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,255,151,0.15)',
    color: '#fff', fontSize: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: 14, borderRadius: 10,
        background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <div style={{ fontSize: 11, color: '#FFD700', textTransform: 'uppercase',
          letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>
          Importar datos históricos
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Editá directamente el rating ELO, victorias, derrotas y racha de cada jugador
          para reflejar los últimos 2 años sin cargar partido por partido. La categoría
          se recalcula automática. Queda registrado como <b>ajuste-histórico</b>.
        </div>
      </div>

      {/* Seed rápido por categoría */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
        <div>
          <div className="label-neon" style={{ marginBottom: 4 }}>Aplicar a categoría</div>
          <select value={quickCat} onChange={e => setQuickCat(e.target.value)} style={cellStyle}>
            <option value="">—</option>
            {['A','B','C','D','E'].map(c => <option key={c} value={c}>Categoría {c}</option>)}
          </select>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom: 4 }}>Rating sugerido</div>
          <input type="number" value={quickRating} onChange={e => setQuickRating(e.target.value)}
            placeholder="ej. 1500" style={cellStyle}/>
        </div>
        <button onClick={applyQuick} className="btn-outline"
          style={{ fontSize: 11, padding: '8px 14px' }}>Aplicar</button>
      </div>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 70px 70px 70px',
        gap: 8, padding: '0 4px', fontSize: 10, color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase', letterSpacing: 1.5 }}>
        <div>Jugador</div>
        <div>Cat.</div>
        <div>Rating</div>
        <div>V</div>
        <div>D</div>
        <div>Racha</div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {drafts.map(d => {
          const newCat = getCategoryFromRating(Number(d.rating) || 1000);
          return (
            <div key={d.id} style={{ display: 'grid',
              gridTemplateColumns: '2fr 80px 80px 70px 70px 70px',
              gap: 8, padding: '8px', alignItems: 'center',
              background: 'rgba(255,255,255,0.02)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{d.nombre}</div>
              <div style={{ fontFamily: 'Audiowide', fontSize: 12, color: '#00ff97', textAlign: 'center' }}>
                {newCat}
              </div>
              <input type="number" value={d.rating}
                onChange={e => setField(d.id, 'rating', e.target.value)} style={cellStyle}/>
              <input type="number" value={d.wins}
                onChange={e => setField(d.id, 'wins', e.target.value)} style={cellStyle}/>
              <input type="number" value={d.losses}
                onChange={e => setField(d.id, 'losses', e.target.value)} style={cellStyle}/>
              <input type="number" value={d.streak}
                onChange={e => setField(d.id, 'streak', e.target.value)} style={cellStyle}/>
            </div>
          );
        })}
      </div>

      <button onClick={saveAll} className="btn-neon"
        style={{ marginTop: 8, padding: '12px', fontSize: 12 }}>
        ✓ Guardar cambios históricos
      </button>
    </div>
  );
}

Object.assign(window, { AdminPanel, HistoricoTab, InvitePlayerModal });
