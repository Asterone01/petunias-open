// ─── AuthView: Full-screen Supabase Auth (Login / Signup) ─────────────────────
// Replaces the old localStorage-based AuthModal with real Supabase Auth.
// Blocks the entire UI until the user has a valid session.

function AuthView({ onSession }) {
  const [mode, setMode] = React.useState('login'); // 'login' | 'register'
  const [form, setForm] = React.useState({ email: '', nombre: '', password: '', confirm: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // ── Sign In ──
        const { data, error: authError } = await window.db.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (authError) throw authError;
        // onAuthStateChange will fire and App will update session
      } else {
        // ── Sign Up ──
        if (!form.nombre.trim()) { setError('Ingresa tu nombre.'); setLoading(false); return; }
        if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }
        if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); setLoading(false); return; }

        const { data, error: authError } = await window.db.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { nombre: form.nombre.trim() }
          }
        });
        if (authError) throw authError;

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          setError('Ya existe una cuenta con ese email.');
        } else if (data?.session) {
          // Auto-confirmed — session fires via listener
        } else {
          setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Translate common Supabase errors to Spanish
      const msg = err.message || 'Error desconocido';
      if (msg.includes('Invalid login credentials')) setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      else if (msg.includes('Email not confirmed')) setError('Tu email no ha sido confirmado. Revisa tu bandeja de entrada.');
      else if (msg.includes('User already registered')) setError('Ya existe una cuenta con ese email.');
      else if (msg.includes('Password should be')) setError('La contraseña debe tener al menos 6 caracteres.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'radial-gradient(circle at center, #0a192f 0%, #070b18 70%, #000000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <style>{`
        @keyframes authFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes authFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes authGlow { 0%,100%{filter:drop-shadow(0 0 12px rgba(0,255,151,0.35))} 50%{filter:drop-shadow(0 0 30px rgba(0,255,151,0.7))} }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .auth-card {
          background: rgba(18,18,18,0.85);
          border: 1px solid rgba(0,255,151,0.15);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,151,0.06);
          animation: authFadeUp 0.6s ease-out forwards;
          animation-delay: 0.3s;
          opacity: 0;
          width: 100%;
          max-width: 420px;
        }
        .auth-input {
          width: 100%;
          padding: 12px 18px;
          background: rgba(30,30,30,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }
        .auth-input:focus {
          border-color: #00ff97;
          box-shadow: 0 0 0 3px rgba(0,255,151,0.12);
          background: rgba(36,36,36,0.95);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #00ff97 0%, #00cc7a 100%);
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-family: 'Audiowide', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,255,151,0.3);
        }
        .auth-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: linear-gradient(90deg, rgba(0,255,151,0.4), rgba(0,255,151,0.7), rgba(0,255,151,0.4));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .auth-tab {
          padding: 11px;
          border: none;
          cursor: pointer;
          font-family: 'Audiowide', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.25s ease;
          flex: 1;
        }
      `}</style>

      {/* Logo */}
      <div style={{ animation: 'authFloat 4s ease-in-out infinite, authGlow 3s ease-in-out infinite', marginBottom: 32 }}>
        <svg viewBox="0 0 190.86 186.58" width="80" height={80 * 186.58 / 190.86}>
          <polygon fill="#00ff97" points="103.34 86.54 112.1 74.58 180.44 62.6 190.86 78.82 168.13 143.76 163.35 124.71 103.34 86.54"/>
          <polygon fill="#00ff97" points="108.61 105.73 122.69 110.37 155.21 171.65 142.99 186.58 74.22 185.03 90.85 174.6 108.61 105.73"/>
          <polygon fill="#00ff97" points="91.99 116.67 91.93 131.5 43.69 181.35 25.72 174.35 5.94 108.47 21 121.06 91.99 116.67"/>
          <polygon fill="#00ff97" points="76.44 104.24 62.32 108.77 0 78.3 1.1 59.04 57.66 19.87 50.34 38.09 76.44 104.24"/>
          <polygon fill="#00ff97" points="83.46 85.62 74.79 73.59 84.51 4.9 103.17 0 157.9 41.68 138.31 40.35 83.46 85.62"/>
        </svg>
      </div>

      {/* Card */}
      <div className="auth-card" style={{ padding: '40px 32px 32px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: 'Audiowide', fontSize: 20, color: '#fff',
            textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6,
          }}>
            <span style={{ color: '#fff' }}>Petunias</span>{' '}
            <span style={{ color: '#00ff97' }}>Open</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(0,255,151,0.5)', letterSpacing: 3, textTransform: 'uppercase' }}>
            Tennis Player Analysis
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex', borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(0,255,151,0.15)', marginBottom: 28,
          background: 'rgba(0,0,0,0.3)',
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              className="auth-tab"
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                background: mode === m ? 'rgba(0,255,151,0.15)' : 'transparent',
                color: mode === m ? '#00ff97' : 'rgba(255,255,255,0.35)',
                borderBottom: mode === m ? '2px solid #00ff97' : '2px solid transparent',
              }}
            >
              {m === 'login' ? '🔑 Ingresar' : '✦ Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#00ff97', fontFamily: 'Audiowide', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                Nombre
              </label>
              <input className="auth-input" type="text" value={form.nombre}
                onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre completo" required />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#00ff97', fontFamily: 'Audiowide', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
              Email
            </label>
            <input className="auth-input" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#00ff97', fontFamily: 'Audiowide', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
              Contraseña
            </label>
            <input className="auth-input" type="password" value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#00ff97', fontFamily: 'Audiowide', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                Confirmar Contraseña
              </label>
              <input className="auth-input" type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} placeholder="••••••••" required />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)',
              color: '#ff6b6b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(0,255,151,0.08)', border: '1px solid rgba(0,255,151,0.25)',
              color: '#00ff97', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✓</span> {success}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? '...' : mode === 'login' ? '→ Iniciar Sesión' : '✓ Crear Cuenta'}
          </button>
        </form>

        {/* Bottom helper */}
        {mode === 'login' && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            ¿No tenés cuenta?{' '}
            <span onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              style={{ color: '#00ff97', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
              Registrate
            </span>
          </div>
        )}
        {mode === 'register' && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            ¿Ya tenés cuenta?{' '}
            <span onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{ color: '#00ff97', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
              Ingresá
            </span>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 32, fontSize: 10, color: 'rgba(255,255,255,0.15)',
        letterSpacing: 2, textTransform: 'uppercase',
        animation: 'authFadeUp 0.6s ease-out forwards', animationDelay: '0.6s', opacity: 0,
      }}>
        Powered by Supabase Auth
      </div>
    </div>
  );
}

// ─── Profile Modal (Updated for Supabase) ─────────────────────────────────────
function ProfileModal({ user, session, players, onClose, onLogout }) {
  const [nombre, setNombre] = React.useState(user?.nombre || session?.user?.user_metadata?.nombre || '');
  const [saved, setSaved] = React.useState(false);
  const avatar = user?.avatar || session?.user?.user_metadata?.avatar_url || null;
  const email = session?.user?.email || '';

  const handleSave = async () => {
    try {
      const { error } = await window.db.auth.updateUser({
        data: { nombre: nombre.trim() }
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Audiowide', color: '#00ff97', fontSize: 15, textTransform: 'uppercase', letterSpacing: 2 }}>
            Mi Perfil
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {user?.isAdmin && (
              <div style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,215,0,0.15)',
                border: '1px solid rgba(255,215,0,0.4)', color: '#FFD700', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Admin</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width: 88, height: 88, borderRadius: '50%',
                  objectFit: 'cover', border: '3px solid #00ff97', boxShadow: '0 0 16px rgba(0,255,151,0.4)',
                  display: 'block', margin: '0 auto 8px' }} />
              : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,255,151,0.06)',
                  border: '3px solid rgba(0,255,151,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 8px', fontSize: 32 }}>👤</div>
            }
          </div>

          <div>
            <div className="label-neon">Nombre</div>
            <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <div className="label-neon">Email</div>
            <input className="inp" value={email} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
          </div>

          <button className="btn-neon" onClick={handleSave} style={{ fontSize: 12 }}>
            {saved ? '✓ Guardado!' : 'Guardar cambios'}
          </button>

          <button onClick={onLogout}
            style={{ padding: '12px', background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.3)', color: '#e74c3c',
              borderRadius: 9, cursor: 'pointer', fontFamily: 'Audiowide',
              fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthView, ProfileModal });
