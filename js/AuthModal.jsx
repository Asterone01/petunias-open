// ─── Auth Modal: Login / Register / Profile ───────────────────────────────────

function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = React.useState('login'); // login | register
  const [form, setForm] = React.useState({ email:'', nombre:'', password:'', confirm:'' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (mode === 'login') {
        const res = loginUser({ email: form.email, password: form.password });
        if (res.error) { setError(res.error); setLoading(false); return; }
        onAuth(res.user);
      } else {
        if (!form.nombre.trim()) { setError('Ingresa tu nombre.'); setLoading(false); return; }
        if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); setLoading(false); return; }
        const res = registerUser({ email: form.email, nombre: form.nombre, password: form.password });
        if (res.error) { setError(res.error); setLoading(false); return; }
        onAuth(res.user);
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="glass-card" style={{ padding:36,width:'100%',maxWidth:420,
        border:'1px solid rgba(0,255,151,0.2)' }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <svg viewBox="0 0 190.86 186.58" width="48" style={{ display:'block',margin:'0 auto 12px' }}>
            <polygon fill="#00ff97" points="103.34 86.54 112.1 74.58 180.44 62.6 190.86 78.82 168.13 143.76 163.35 124.71 103.34 86.54"/>
            <polygon fill="#00ff97" points="108.61 105.73 122.69 110.37 155.21 171.65 142.99 186.58 74.22 185.03 90.85 174.6 108.61 105.73"/>
            <polygon fill="#00ff97" points="91.99 116.67 91.93 131.5 43.69 181.35 25.72 174.35 5.94 108.47 21 121.06 91.99 116.67"/>
            <polygon fill="#00ff97" points="76.44 104.24 62.32 108.77 0 78.3 1.1 59.04 57.66 19.87 50.34 38.09 76.44 104.24"/>
            <polygon fill="#00ff97" points="83.46 85.62 74.79 73.59 84.51 4.9 103.17 0 157.9 41.68 138.31 40.35 83.46 85.62"/>
          </svg>
          <div style={{ fontFamily:'Audiowide',fontSize:18,color:'#00ff97',
            textTransform:'uppercase',letterSpacing:3,textShadow:'0 0 12px rgba(0,255,151,0.5)' }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,
          borderRadius:9,overflow:'hidden',border:'1px solid rgba(0,255,151,0.2)',marginBottom:24 }}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError('');}}
              style={{ padding:'10px',border:'none',cursor:'pointer',fontFamily:'Audiowide',
                fontSize:11,textTransform:'uppercase',letterSpacing:1,transition:'all .2s',
                background:mode===m?'#00ff97':'transparent',
                color:mode===m?'#000':'rgba(0,255,151,0.6)' }}>
              {m==='login'?'Ingresar':'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {mode === 'register' && (
            <div>
              <div className="label-neon">Nombre</div>
              <input className="inp" type="text" value={form.nombre}
                onChange={e=>set('nombre',e.target.value)} placeholder="Tu nombre completo" required/>
            </div>
          )}
          <div>
            <div className="label-neon">Email</div>
            <input className="inp" type="email" value={form.email}
              onChange={e=>set('email',e.target.value)} placeholder="tu@email.com" required/>
          </div>
          <div>
            <div className="label-neon">Contraseña</div>
            <input className="inp" type="password" value={form.password}
              onChange={e=>set('password',e.target.value)} placeholder="••••••••" required/>
          </div>
          {mode === 'register' && (
            <div>
              <div className="label-neon">Confirmar Contraseña</div>
              <input className="inp" type="password" value={form.confirm}
                onChange={e=>set('confirm',e.target.value)} placeholder="••••••••" required/>
            </div>
          )}

          {error && (
            <div style={{ padding:'10px 14px',borderRadius:8,
              background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.3)',
              color:'#e74c3c',fontSize:12 }}>{error}</div>
          )}

          <button type="submit" className="btn-neon" disabled={loading}
            style={{ marginTop:4,opacity:loading?0.7:1 }}>
            {loading ? '...' : mode==='login' ? '→ Ingresar' : '✓ Crear Cuenta'}
          </button>
        </form>

        {mode==='login' && (
          <div style={{ marginTop:16,textAlign:'center',fontSize:11,
            color:'rgba(255,255,255,0.3)' }}>
            ¿No tenés cuenta?{' '}
            <span onClick={()=>setMode('register')}
              style={{ color:'#00ff97',cursor:'pointer',textDecoration:'underline' }}>
              Registrate
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User Profile Modal ───────────────────────────────────────────────────────
function ProfileModal({ user, players, onClose, onUpdate, onLogout }) {
  const [tab, setTab] = React.useState('profile');
  const [nombre, setNombre] = React.useState(user.nombre);
  const [linkedId, setLinkedId] = React.useState(user.linkedPlayerId || '');
  const [avatar, setAvatar] = React.useState(user.avatar || null);
  const [saved, setSaved] = React.useState(false);
  // Password change
  const [pwCurrent, setPwCurrent] = React.useState('');
  const [pwNew, setPwNew] = React.useState('');
  const [pwConfirm, setPwConfirm] = React.useState('');
  const [pwError, setPwError] = React.useState('');
  const [pwSaved, setPwSaved] = React.useState(false);

  const handlePasswordChange = () => {
    setPwError('');
    const users = getUsers();
    const u = users.find(x => x.id === user.id);
    if (!u) return;
    if (u.password !== btoa(unescape(encodeURIComponent(pwCurrent + '_petunias_salt')))) {
      return setPwError('Contraseña actual incorrecta.');
    }
    if (pwNew.length < 6) return setPwError('La nueva contraseña debe tener al menos 6 caracteres.');
    if (pwNew !== pwConfirm) return setPwError('Las contraseñas no coinciden.');
    users[users.findIndex(x=>x.id===user.id)].password = btoa(unescape(encodeURIComponent(pwNew + '_petunias_salt')));
    localStorage.setItem('petunias-users', JSON.stringify(users));
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwSaved(true); setTimeout(()=>setPwSaved(false), 2500);
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => setAvatar(ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated = updateUserProfile(user.id, {
      nombre, linkedPlayerId: linkedId||null, avatar
    });
    onUpdate(updated);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const linkedPlayer = players.find(p=>p.id==linkedId);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="glass-card" style={{ padding:32,width:'100%',maxWidth:500,
        maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div style={{ fontFamily:'Audiowide',color:'#00ff97',fontSize:15,
            textTransform:'uppercase',letterSpacing:2 }}>Mi Perfil</div>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            {user.isAdmin && (
              <div style={{ padding:'3px 10px',borderRadius:20,background:'rgba(255,215,0,0.15)',
                border:'1px solid rgba(255,215,0,0.4)',color:'#FFD700',fontSize:10,
                textTransform:'uppercase',letterSpacing:2,fontWeight:700 }}>Admin</div>
            )}
          </div>
        </div>

        {/* Profile / Password tabs */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',borderRadius:8,overflow:'hidden',
          border:'1px solid rgba(0,255,151,0.15)',marginBottom:20 }}>
          {['profile','password'].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'9px',border:'none',cursor:'pointer',fontFamily:'Audiowide',
                fontSize:10,textTransform:'uppercase',letterSpacing:1,transition:'all .15s',
                background:tab===t?'#00ff97':'transparent',
                color:tab===t?'#000':'rgba(0,255,151,0.55)' }}>
              {t==='profile'?'Perfil':'Contraseña'}
            </button>
          ))}
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {tab === 'profile' && (
            <>
              {/* Avatar */}
              <div style={{ textAlign:'center',marginBottom:4 }}>
                <label style={{ cursor:'pointer' }}>
                  {avatar
                    ? <img src={avatar} alt="" style={{ width:88,height:88,borderRadius:'50%',
                        objectFit:'cover',border:'3px solid #00ff97',boxShadow:'0 0 16px rgba(0,255,151,0.4)',
                        display:'block',margin:'0 auto 8px'}}/>
                    : <div style={{ width:88,height:88,borderRadius:'50%',background:'rgba(0,255,151,0.06)',
                        border:'3px solid rgba(0,255,151,0.3)',display:'flex',alignItems:'center',
                        justifyContent:'center',margin:'0 auto 8px',fontSize:32 }}>👤</div>
                  }
                  <div style={{ fontSize:11,color:'rgba(0,255,151,0.5)',textTransform:'uppercase',letterSpacing:1 }}>
                    Cambiar foto
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatar} style={{ display:'none' }}/>
                </label>
              </div>
              <div>
                <div className="label-neon">Nombre</div>
                <input className="inp" value={nombre} onChange={e=>setNombre(e.target.value)}/>
              </div>
              <div>
                <div className="label-neon">Email</div>
                <input className="inp" value={user.email} disabled style={{ opacity:.5,cursor:'not-allowed' }}/>
              </div>
              <div>
                <div className="label-neon">Vincular con jugador</div>
                <select className="inp" value={linkedId} onChange={e=>setLinkedId(e.target.value)}>
                  <option value="">— Sin vincular —</option>
                  {players.map(p=>(
                    <option key={p.id} value={p.id}>{p.nombre} (Cat. {p.categoria})</option>
                  ))}
                </select>
              </div>
              {linkedPlayer && (
                <div style={{ padding:'12px 16px',borderRadius:10,
                  background:'rgba(0,255,151,0.06)',border:'1px solid rgba(0,255,151,0.2)',
                  display:'flex',alignItems:'center',gap:12 }}>
                  {linkedPlayer.foto
                    ? <img src={linkedPlayer.foto} alt="" style={{ width:44,height:44,borderRadius:'50%',objectFit:'cover' }}/>
                    : <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(0,255,151,0.1)',
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>🎾</div>
                  }
                  <div>
                    <div style={{ fontWeight:700,color:'#00ff97',fontFamily:'Audiowide',fontSize:13 }}>{linkedPlayer.nombre}</div>
                    <div style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>OVR {getFifaRating(linkedPlayer)} · Cat. {linkedPlayer.categoria}</div>
                  </div>
                </div>
              )}
              <button className="btn-neon" onClick={handleSave} style={{ fontSize:12 }}>
                {saved ? '✓ Guardado!' : 'Guardar cambios'}
              </button>
              <button onClick={onLogout}
                style={{ padding:'12px',background:'rgba(192,57,43,0.1)',
                  border:'1px solid rgba(192,57,43,0.3)',color:'#e74c3c',
                  borderRadius:9,cursor:'pointer',fontFamily:'Audiowide',
                  fontSize:11,textTransform:'uppercase',letterSpacing:1 }}>
                Cerrar Sesión
              </button>
            </>
          )}

          {tab === 'password' && (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {[
                { label:'Contraseña actual', val:pwCurrent, set:setPwCurrent },
                { label:'Nueva contraseña',  val:pwNew,     set:setPwNew     },
                { label:'Confirmar nueva',   val:pwConfirm, set:setPwConfirm },
              ].map(f=>(
                <div key={f.label}>
                  <div className="label-neon">{f.label}</div>
                  <input className="inp" type="password" value={f.val}
                    onChange={e=>f.set(e.target.value)} placeholder="••••••••"/>
                </div>
              ))}
              {pwError && (
                <div style={{ padding:'9px 14px',borderRadius:8,fontSize:12,
                  background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.3)',
                  color:'#e74c3c' }}>{pwError}</div>
              )}
              <button className="btn-neon" onClick={handlePasswordChange} style={{ fontSize:12 }}>
                {pwSaved ? '✓ Contraseña actualizada!' : 'Cambiar contraseña'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthModal, ProfileModal });
