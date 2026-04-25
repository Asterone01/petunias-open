// ─── NewsFeed Component with Supabase Realtime ───────────────────────────────
// Shows a live feed from the 'posts' table. Works gracefully if the table
// doesn't exist yet (errors are swallowed, feed just stays empty).

function NewsFeed({ currentUser }) {
  const [posts, setPosts] = React.useState([]);
  const [text, setText] = React.useState('');
  const [publishing, setPublishing] = React.useState(false);
  const [realtimeOk, setRealtimeOk] = React.useState(false);
  const channelRef = React.useRef(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    async function loadPosts() {
      if (!window.db) return;
      try {
        const { data, error } = await window.db
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;
        if (data) setPosts(data);
      } catch (err) {
        // Tabla aún no existe — ignorar silenciosamente
        console.warn('[NewsFeed] posts table not available yet:', err.message);
      }
    }
    loadPosts();
  }, []);

  // ── Suscripción Realtime ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!window.db) return;

    // Crear el canal y suscribirse a todos los cambios en 'posts'
    channelRef.current = window.db
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setPosts(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          }
        }
      )
      .subscribe((status) => {
        setRealtimeOk(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) {
        window.db.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // ── Publicar ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!text.trim() || !window.db || !currentUser) return;
    setPublishing(true);
    try {
      const { error } = await window.db.from('posts').insert([{
        content: text.trim(),
        author_name: currentUser.nombre || currentUser.email,
        author_id: currentUser.id,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setText('');
      // El Realtime listener actualizará el estado automáticamente
    } catch (err) {
      console.error('[NewsFeed] Error publicando:', err.message);
      // Fallback optimista: mostrar igual en pantalla aunque falle la DB
      setPosts(prev => [{
        id: Date.now(),
        content: text.trim(),
        author_name: currentUser.nombre || currentUser.email,
        created_at: new Date().toISOString(),
        _local: true,
      }, ...prev]);
      setText('');
    } finally {
      setPublishing(false);
    }
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch { return ''; }
  };

  const isAdmin = currentUser?.isAdmin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ─ Header ─ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'Audiowide', color: '#00ff97', fontSize: 13, textTransform: 'uppercase', letterSpacing: 3 }}>
          📡 Feed en Vivo
        </div>
        {realtimeOk && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(0,255,151,0.08)', border: '1px solid rgba(0,255,151,0.2)',
            fontSize: 10, color: 'rgba(0,255,151,0.7)', fontFamily: 'Audiowide',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#00ff97',
              display: 'inline-block',
              boxShadow: '0 0 6px #00ff97',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            En tiempo real
          </div>
        )}
      </div>

      {/* ─ Composer ─ */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handlePublish(); }}
          placeholder="Escribir una publicación... (Ctrl+Enter para publicar)"
          rows={2}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            color: '#fff', fontSize: 13, padding: '10px 14px',
            fontFamily: 'inherit', resize: 'vertical', outline: 'none',
            transition: 'border-color .15s, box-shadow .15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = '#00ff97'; e.target.style.boxShadow = '0 0 0 2px rgba(0,255,151,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handlePublish}
            disabled={publishing || !text.trim()}
            className="btn-neon"
            style={{ padding: '8px 22px', fontSize: 12, opacity: !text.trim() ? 0.4 : 1 }}
          >
            {publishing ? '...' : '✦ Publicar'}
          </button>
        </div>
      </div>

      {/* ─ Posts list ─ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'rgba(255,255,255,0.2)', fontSize: 13,
            textTransform: 'uppercase', letterSpacing: 2,
          }}>
            No hay publicaciones aún. ¡Sé el primero!
          </div>
        ) : (
          posts.map((post, i) => (
            <NewsFeedPost key={post.id || i} post={post} isAdmin={isAdmin}
              currentUser={currentUser} onDelete={async (id) => {
                if (!confirm('¿Eliminar esta publicación?')) return;
                try {
                  if (window.db && !post._local) {
                    await window.db.from('posts').delete().eq('id', id);
                  } else {
                    setPosts(prev => prev.filter(p => p.id !== id));
                  }
                } catch (err) {
                  console.warn('[NewsFeed] delete error:', err.message);
                  setPosts(prev => prev.filter(p => p.id !== id));
                }
              }}
              formatTime={formatTime}
            />
          ))
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// ─── Single Post Card ─────────────────────────────────────────────────────────
function NewsFeedPost({ post, isAdmin, currentUser, onDelete, formatTime }) {
  const isOwn = currentUser && (currentUser.id === post.author_id);
  const canDelete = isAdmin || isOwn;

  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    // Pequeña pausa para activar la animación de entrada
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,255,151,0.12)',
        border: '1.5px solid rgba(0,255,151,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15,
      }}>
        👤
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00ff97' }}>
            {post.author_name || 'Anónimo'}
          </span>
          {post._local && (
            <span style={{
              fontSize: 9, color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)',
              borderRadius: 8, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: 1,
            }}>local</span>
          )}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
            {formatTime(post.created_at)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, wordBreak: 'break-word' }}>
          {post.content}
        </div>
      </div>

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete(post.id)}
          title="Eliminar publicación"
          style={{
            background: 'none', border: 'none', color: 'rgba(192,57,43,0.5)',
            cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: '2px 4px',
            transition: 'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,57,43,0.5)'}
        >✕</button>
      )}
    </div>
  );
}

Object.assign(window, { NewsFeed, NewsFeedPost });
