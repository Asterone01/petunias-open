// ─── News Section ─────────────────────────────────────────────────────────────

const NEWS_TYPES = [
  { key:'noticia',    label:'Noticia',    color:'#00ff97',  icon:'📰' },
  { key:'torneo',     label:'Torneo',     color:'#FFD700',  icon:'🏆' },
  { key:'resultado',  label:'Resultado',  color:'#3b82f6',  icon:'🎾' },
  { key:'galeria',    label:'Galería',    color:'#ff6b9d',  icon:'📸' },
];

function getNews() {
  try { return JSON.parse(localStorage.getItem('petunias-news')) || []; } catch { return []; }
}
function saveNews(news) { localStorage.setItem('petunias-news', JSON.stringify(news)); }

// ─── Create / Edit Post Modal ─────────────────────────────────────────────────
function PostModal({ post, onSave, onClose }) {
  const editing = !!post;
  const [form, setForm] = React.useState(post || {
    titulo:'', tipo:'noticia', contenido:'', imagen:null, destacado:false, meta:{}
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const setMeta = (k,v) => setForm(p=>({...p, meta:{...(p.meta||{}), [k]:v}}));
  const meta = form.meta || {};

  const handleImg = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => set('imagen', ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.titulo.trim()) return alert('Ingresá un título');
    onSave(form);
  };

  const tipo = NEWS_TYPES.find(t=>t.key===form.tipo) || NEWS_TYPES[0];

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="glass-card" style={{ padding:32,width:'100%',maxWidth:600,
        maxHeight:'92vh',overflowY:'auto',border:'1px solid rgba(0,255,151,0.2)' }}>
        <div style={{ fontFamily:'Audiowide',color:'#00ff97',fontSize:14,
          textTransform:'uppercase',letterSpacing:2,marginBottom:24 }}>
          {editing ? 'Editar Publicación' : 'Nueva Publicación'}
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {/* Type selector */}
          <div>
            <div className="label-neon">Tipo</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
              {NEWS_TYPES.map(t=>(
                <button key={t.key} onClick={()=>set('tipo',t.key)}
                  style={{ padding:'10px 6px',borderRadius:8,cursor:'pointer',textAlign:'center',
                    border:`1.5px solid ${form.tipo===t.key?t.color:'rgba(255,255,255,0.1)'}`,
                    background: form.tipo===t.key?`${t.color}18`:'transparent',
                    transition:'all .15s' }}>
                  <div style={{ fontSize:18 }}>{t.icon}</div>
                  <div style={{ fontSize:9,color:form.tipo===t.key?t.color:'rgba(255,255,255,0.4)',
                    textTransform:'uppercase',letterSpacing:1,marginTop:3,fontWeight:700 }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-neon">
              {form.tipo==='torneo'?'Nombre del torneo':form.tipo==='resultado'?'Título del resultado':'Título'}
            </div>
            <input className="inp" value={form.titulo} onChange={e=>set('titulo',e.target.value)}
              placeholder={form.tipo==='torneo'?'ej. Copa PETUNIAS Otoño 2026':form.tipo==='resultado'?'ej. Final Cat. A':'Título de la publicación'}/>
          </div>

          {/* ─── Torneo ─── */}
          {form.tipo==='torneo' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div>
                <div className="label-neon">Fecha</div>
                <input type="date" className="inp" value={meta.fecha||''}
                  onChange={e=>setMeta('fecha',e.target.value)}/>
              </div>
              <div>
                <div className="label-neon">Lugar</div>
                <input className="inp" value={meta.lugar||''}
                  onChange={e=>setMeta('lugar',e.target.value)}
                  placeholder="Club / Dirección"/>
              </div>
              <div>
                <div className="label-neon">Categoría</div>
                <select className="inp" value={meta.categoria||''}
                  onChange={e=>setMeta('categoria',e.target.value)}>
                  <option value="">—</option>
                  {['A','B','C','D','E','Mixto','Libre'].map(c=>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="label-neon">Tipo de torneo</div>
                <select className="inp" value={meta.formato||''}
                  onChange={e=>setMeta('formato',e.target.value)}>
                  <option value="">—</option>
                  <option value="Eliminación directa">Eliminación directa</option>
                  <option value="Round Robin">Round Robin</option>
                  <option value="Grupos + Eliminación">Grupos + Eliminación</option>
                  <option value="Dobles">Dobles</option>
                </select>
              </div>
              <div>
                <div className="label-neon">Premio</div>
                <input className="inp" value={meta.premio||''}
                  onChange={e=>setMeta('premio',e.target.value)}
                  placeholder="ej. $50.000 + trofeo"/>
              </div>
              <div>
                <div className="label-neon">Costo</div>
                <input className="inp" value={meta.costo||''}
                  onChange={e=>setMeta('costo',e.target.value)}
                  placeholder="ej. $5.000 por jugador"/>
              </div>
              <div style={{ gridColumn:'1 / -1' }}>
                <div className="label-neon">Inscripciones hasta</div>
                <input type="date" className="inp" value={meta.cierre||''}
                  onChange={e=>setMeta('cierre',e.target.value)}/>
              </div>
            </div>
          )}

          {/* ─── Resultado ─── */}
          {form.tipo==='resultado' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div>
                <div className="label-neon">Jugador A</div>
                <input className="inp" value={meta.jugadorA||''}
                  onChange={e=>setMeta('jugadorA',e.target.value)}
                  placeholder="Nombre"/>
              </div>
              <div>
                <div className="label-neon">Jugador B</div>
                <input className="inp" value={meta.jugadorB||''}
                  onChange={e=>setMeta('jugadorB',e.target.value)}
                  placeholder="Nombre"/>
              </div>
              <div style={{ gridColumn:'1 / -1' }}>
                <div className="label-neon">Marcador</div>
                <input className="inp" value={meta.marcador||''}
                  onChange={e=>setMeta('marcador',e.target.value)}
                  placeholder="6-3, 6-4"/>
              </div>
              <div>
                <div className="label-neon">Ganador</div>
                <select className="inp" value={meta.ganador||''}
                  onChange={e=>setMeta('ganador',e.target.value)}>
                  <option value="">—</option>
                  <option value="A">{meta.jugadorA||'Jugador A'}</option>
                  <option value="B">{meta.jugadorB||'Jugador B'}</option>
                </select>
              </div>
              <div>
                <div className="label-neon">Ronda / Fase</div>
                <input className="inp" value={meta.ronda||''}
                  onChange={e=>setMeta('ronda',e.target.value)}
                  placeholder="Final, Semifinal, Octavos..."/>
              </div>
              <div style={{ gridColumn:'1 / -1' }}>
                <div className="label-neon">Torneo (opcional)</div>
                <input className="inp" value={meta.torneo||''}
                  onChange={e=>setMeta('torneo',e.target.value)}
                  placeholder="Nombre del torneo"/>
              </div>
            </div>
          )}

          {/* ─── Noticia ─── */}
          {form.tipo==='noticia' && (
            <div>
              <div className="label-neon">Resumen / Aviso corto</div>
              <input className="inp" value={meta.resumen||''}
                onChange={e=>setMeta('resumen',e.target.value)}
                placeholder="Una línea que aparece destacada arriba del contenido"/>
            </div>
          )}

          <div>
            <div className="label-neon">
              {form.tipo==='torneo'?'Bases / Detalles':form.tipo==='resultado'?'Crónica (opcional)':form.tipo==='galeria'?'Descripción':'Contenido'}
            </div>
            <textarea className="inp" value={form.contenido} onChange={e=>set('contenido',e.target.value)}
              placeholder={form.tipo==='torneo'?'Reglamento, formato, premios, requisitos...':form.tipo==='resultado'?'Cómo se dio el partido...':'Escribí el contenido aquí...'}
              style={{ minHeight:form.tipo==='resultado'?80:120,resize:'vertical',lineHeight:1.6 }}/>
          </div>

          {/* Image upload */}
          <div>
            <div className="label-neon">
              {form.tipo==='torneo'?'Flyer del torneo':form.tipo==='galeria'?'Imagen':'Imagen de portada'}
            </div>
            {form.imagen ? (
              <div style={{ position:'relative' }}>
                <img src={form.imagen} alt="" style={{ width:'100%',height:200,
                  objectFit:'cover',borderRadius:10,border:'1px solid rgba(0,255,151,0.2)' }}/>
                <button onClick={()=>set('imagen',null)}
                  style={{ position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.7)',
                    border:'none',color:'#fff',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12 }}>
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <label style={{ cursor:'pointer' }}>
                <div style={{ border:'2px dashed rgba(0,255,151,0.25)',borderRadius:10,
                  height:100,display:'flex',alignItems:'center',justifyContent:'center',
                  background:'rgba(0,255,151,0.02)' }}>
                  <span style={{ color:'rgba(0,255,151,0.4)',fontSize:13,textTransform:'uppercase',letterSpacing:2 }}>
                    + Subir imagen
                  </span>
                </div>
                <input type="file" accept="image/*" onChange={handleImg} style={{ display:'none' }}/>
              </label>
            )}
          </div>

          {/* Destacado toggle */}
          <label style={{ display:'flex',alignItems:'center',gap:12,cursor:'pointer' }}>
            <div onClick={()=>set('destacado',!form.destacado)}
              style={{ width:44,height:24,borderRadius:12,transition:'all .2s',
                background:form.destacado?'#00ff97':'rgba(255,255,255,0.1)',
                position:'relative',cursor:'pointer' }}>
              <div style={{ position:'absolute',top:3,
                left:form.destacado?22:3,width:18,height:18,
                borderRadius:'50%',background:'#fff',transition:'left .2s',
                boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </div>
            <span style={{ fontSize:13,color:'rgba(255,255,255,0.7)' }}>Publicación destacada</span>
          </label>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4 }}>
            <button className="btn-outline" onClick={onClose} style={{ fontSize:12 }}>Cancelar</button>
            <button className="btn-neon" onClick={handleSave} style={{ fontSize:12 }}>
              {editing ? '✓ Guardar cambios' : '✓ Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single News Card (Hero style) ───────────────────────────────────────────
function NewsCard({ post, isAdmin, onEdit, onDelete, currentUser }) {
  const [expanded, setExpanded] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState(post.comments || []);
  const tipo = NEWS_TYPES.find(t=>t.key===post.tipo) || NEWS_TYPES[0];

  const addComment = () => {
    if (!comment.trim() || !currentUser) return;
    const newComments = [...comments, {
      id: Date.now(), text: comment.trim(),
      autor: currentUser.nombre, autorId: currentUser.id,
      avatar: currentUser.avatar, fecha: new Date().toLocaleDateString('es-AR')
    }];
    setComments(newComments);
    setComment('');
    // persist
    const allNews = getNews();
    const idx = allNews.findIndex(n=>n.id===post.id);
    if (idx !== -1) { allNews[idx].comments = newComments; saveNews(allNews); }
  };

  const delComment = (cid) => {
    const nc = comments.filter(c=>c.id!==cid);
    setComments(nc);
    const allNews = getNews();
    const idx = allNews.findIndex(n=>n.id===post.id);
    if (idx !== -1) { allNews[idx].comments = nc; saveNews(allNews); }
  };

  return (
    <div className="glass-card" style={{ overflow:'hidden',
      border: post.destacado?`1px solid ${tipo.color}40`:'1px solid rgba(0,255,151,0.12)' }}>
      {/* Hero image */}
      {post.imagen && (
        <div style={{ position:'relative',height:240,overflow:'hidden' }}>
          <img src={post.imagen} alt={post.titulo} style={{
            width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s'
          }}
          onMouseEnter={e=>e.target.style.transform='scale(1.03)'}
          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          <div style={{ position:'absolute',inset:0,
            background:'linear-gradient(to top,rgba(7,11,24,0.92) 0%,transparent 50%)' }}/>
          {/* Type badge */}
          <div style={{ position:'absolute',top:14,left:14,
            padding:'4px 12px',borderRadius:20,
            background:`${tipo.color}22`,border:`1px solid ${tipo.color}60`,
            color:tipo.color,fontSize:11,fontWeight:700,
            textTransform:'uppercase',letterSpacing:1.5,backdropFilter:'blur(8px)' }}>
            {tipo.icon} {tipo.label}
          </div>
          {post.destacado && (
            <div style={{ position:'absolute',top:14,right:14,
              padding:'4px 12px',borderRadius:20,
              background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.4)',
              color:'#FFD700',fontSize:11,fontWeight:700,letterSpacing:1 }}>
              ★ Destacado
            </div>
          )}
        </div>
      )}

      <div style={{ padding:'20px 24px' }}>
        {/* No image: show badge inline */}
        {!post.imagen && (
          <div style={{ display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' }}>
            <div style={{ padding:'3px 10px',borderRadius:20,
              background:`${tipo.color}18`,border:`1px solid ${tipo.color}50`,
              color:tipo.color,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1 }}>
              {tipo.icon} {tipo.label}
            </div>
            {post.destacado && (
              <div style={{ padding:'3px 10px',borderRadius:20,
                background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',
                color:'#FFD700',fontSize:10,fontWeight:700 }}>★ Destacado</div>
            )}
          </div>
        )}

        <div style={{ fontFamily:'Audiowide',fontSize:17,color:'#fff',
          fontWeight:700,lineHeight:1.3,marginBottom:8,
          textShadow: post.destacado?`0 0 20px ${tipo.color}40`:undefined }}>
          {post.titulo}
        </div>

        <div style={{ fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:12 }}>
          {post.fecha} · {post.autorNombre || 'Admin'}
        </div>

        {/* Meta fields per tipo */}
        {post.tipo==='torneo' && post.meta && (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',
            gap:10,marginBottom:12,padding:12,
            background:'rgba(255,215,0,0.04)',borderRadius:8,
            border:'1px solid rgba(255,215,0,0.12)' }}>
            {post.meta.fecha && <MetaItem label="Fecha" value={new Date(post.meta.fecha).toLocaleDateString('es-AR')}/>}
            {post.meta.lugar && <MetaItem label="Lugar" value={post.meta.lugar}/>}
            {post.meta.categoria && <MetaItem label="Categoría" value={post.meta.categoria}/>}
            {post.meta.formato && <MetaItem label="Formato" value={post.meta.formato}/>}
            {post.meta.premio && <MetaItem label="Premio" value={post.meta.premio} color="#FFD700"/>}
            {post.meta.costo && <MetaItem label="Costo" value={post.meta.costo}/>}
            {post.meta.cierre && <MetaItem label="Cierre insc." value={new Date(post.meta.cierre).toLocaleDateString('es-AR')}/>}
          </div>
        )}

        {post.tipo==='resultado' && post.meta && (post.meta.jugadorA || post.meta.jugadorB) && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:12,alignItems:'center',
            marginBottom:12,padding:'14px 16px',background:'rgba(59,130,246,0.05)',
            borderRadius:8,border:'1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13,fontWeight:700,
                color:post.meta.ganador==='A'?'#00ff97':'rgba(255,255,255,0.7)' }}>
                {post.meta.ganador==='A' && '🏆 '}{post.meta.jugadorA||'—'}
              </div>
            </div>
            <div style={{ fontFamily:'Audiowide',fontSize:14,color:'#3b82f6',
              padding:'6px 14px',border:'1px solid rgba(59,130,246,0.3)',borderRadius:6 }}>
              {post.meta.marcador||'VS'}
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,
                color:post.meta.ganador==='B'?'#00ff97':'rgba(255,255,255,0.7)' }}>
                {post.meta.ganador==='B' && '🏆 '}{post.meta.jugadorB||'—'}
              </div>
            </div>
            {(post.meta.ronda||post.meta.torneo) && (
              <div style={{ gridColumn:'1 / -1',textAlign:'center',fontSize:10,
                color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:1.5 }}>
                {[post.meta.torneo,post.meta.ronda].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        )}

        {post.tipo==='noticia' && post.meta?.resumen && (
          <div style={{ fontSize:13,fontStyle:'italic',color:'#00ff97',
            padding:'10px 14px',marginBottom:12,
            background:'rgba(0,255,151,0.05)',borderLeft:'3px solid #00ff97',borderRadius:4 }}>
            {post.meta.resumen}
          </div>
        )}

        {post.contenido && (
          <div style={{ fontSize:14,color:'rgba(255,255,255,0.7)',lineHeight:1.7,
            maxHeight:expanded?undefined:72,overflow:'hidden',
            maskImage:expanded?undefined:'linear-gradient(to bottom,#fff 50%,transparent 100%)',
            WebkitMaskImage:expanded?undefined:'linear-gradient(to bottom,#fff 50%,transparent 100%)' }}>
            {post.contenido}
          </div>
        )}

        {post.contenido && post.contenido.length > 120 && (
          <button onClick={()=>setExpanded(!expanded)}
            style={{ background:'none',border:'none',color:'#00ff97',cursor:'pointer',
              fontSize:12,marginTop:6,padding:0,textDecoration:'underline' }}>
            {expanded?'Ver menos':'Leer más'}
          </button>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ display:'flex',gap:8,marginTop:14,paddingTop:14,
            borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={()=>onEdit(post)}
              style={{ padding:'6px 14px',background:'rgba(0,255,151,0.08)',
                border:'1px solid rgba(0,255,151,0.3)',color:'#00ff97',
                borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700,
                textTransform:'uppercase',letterSpacing:1 }}>✎ Editar</button>
            <button onClick={()=>onDelete(post.id)}
              style={{ padding:'6px 14px',background:'rgba(192,57,43,0.08)',
                border:'1px solid rgba(192,57,43,0.3)',color:'#e74c3c',
                borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700,
                textTransform:'uppercase',letterSpacing:1 }}>✕ Eliminar</button>
          </div>
        )}

        {/* Comments */}
        <div style={{ marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          {comments.length > 0 && (
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:12 }}>
              {comments.map(c=>(
                <div key={c.id} style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                  {c.avatar
                    ? <img src={c.avatar} alt="" style={{ width:28,height:28,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/>
                    : <div style={{ width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.07)',
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>👤</div>
                  }
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:11,fontWeight:700,color:'#00ff97',marginRight:8 }}>{c.autor}</span>
                    <span style={{ fontSize:10,color:'rgba(255,255,255,0.3)',marginRight:8 }}>{c.fecha}</span>
                    {(isAdmin || currentUser?.id===c.autorId) && (
                      <span onClick={()=>delComment(c.id)}
                        style={{ fontSize:10,color:'rgba(192,57,43,0.6)',cursor:'pointer' }}>✕</span>
                    )}
                    <div style={{ fontSize:13,color:'rgba(255,255,255,0.7)',marginTop:2,lineHeight:1.5 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentUser ? (
            <div style={{ display:'flex',gap:8 }}>
              <input className="inp" value={comment} onChange={e=>setComment(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addComment()}
                placeholder="Escribir comentario..." style={{ flex:1,padding:'8px 12px',fontSize:13 }}/>
              <button onClick={addComment} className="btn-neon"
                style={{ padding:'8px 16px',fontSize:12,whiteSpace:'nowrap' }}>→</button>
            </div>
          ) : (
            <div style={{ fontSize:11,color:'rgba(255,255,255,0.25)',textAlign:'center',padding:'8px 0' }}>
              Iniciá sesión para comentar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── News Feed Page ───────────────────────────────────────────────────────────
function NewsSection({ currentUser }) {
  const [news, setNews] = React.useState(() => getNews());
  const [filter, setFilter] = React.useState('all');
  const [showModal, setShowModal] = React.useState(false);
  const [editPost, setEditPost] = React.useState(null);

  const isAdmin = currentUser?.isAdmin;

  const refresh = () => setNews(getNews());

  const handleSave = (form) => {
    const all = getNews();
    if (editPost) {
      const idx = all.findIndex(n=>n.id===editPost.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...form };
        saveNews(all);
      }
    } else {
      const post = { ...form, id: Date.now(),
        fecha: new Date().toLocaleDateString('es-AR'),
        autorNombre: currentUser?.nombre || 'Admin',
        comments: [] };
      saveNews([post, ...all]);
    }
    setShowModal(false); setEditPost(null); refresh();
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    saveNews(getNews().filter(n=>n.id!==id));
    refresh();
  };

  const filtered = filter==='all' ? news : news.filter(n=>n.tipo===filter);
  const featured = filtered.filter(n=>n.destacado);
  const regular  = filtered.filter(n=>!n.destacado);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div style={{ fontFamily:'Audiowide',color:'#00ff97',fontSize:16,
          textTransform:'uppercase',letterSpacing:3 }}>Noticias & Torneos</div>
        {isAdmin && (
          <button className="btn-neon" onClick={()=>{setEditPost(null);setShowModal(true);}}
            style={{ fontSize:12,padding:'10px 20px' }}>+ Nueva Publicación</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
        {[{key:'all',label:'Todo'}, ...NEWS_TYPES.map(t=>({key:t.key,label:t.label}))].map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)}
            className={filter===f.key?'cat-btn active':'cat-btn'} style={{ fontSize:11 }}>
            {f.label}
          </button>
        ))}
      </div>

      {news.length === 0 ? (
        <div className="glass-card" style={{ padding:64,textAlign:'center' }}>
          <div style={{ fontSize:48,opacity:.2,marginBottom:16 }}>📰</div>
          <div style={{ color:'rgba(255,255,255,0.25)',textTransform:'uppercase',
            letterSpacing:3,fontSize:13 }}>
            {isAdmin ? 'Creá la primera publicación' : 'No hay publicaciones aún'}
          </div>
        </div>
      ) : (
        <>
          {/* Featured posts */}
          {featured.length > 0 && (
            <div style={{ display:'grid',
              gridTemplateColumns:featured.length===1?'1fr':'1fr 1fr',gap:20 }}>
              {featured.map(p=>(
                <NewsCard key={p.id} post={p} isAdmin={isAdmin}
                  onEdit={p=>{setEditPost(p);setShowModal(true);}}
                  onDelete={handleDelete} currentUser={currentUser}/>
              ))}
            </div>
          )}

          {/* Regular posts */}
          {regular.length > 0 && (
            <div style={{ display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20 }}>
              {regular.map(p=>(
                <NewsCard key={p.id} post={p} isAdmin={isAdmin}
                  onEdit={p=>{setEditPost(p);setShowModal(true);}}
                  onDelete={handleDelete} currentUser={currentUser}/>
              ))}
            </div>
          )}
        </>
      )}

      {(showModal || editPost) && (
        <PostModal post={editPost} onSave={handleSave}
          onClose={()=>{setShowModal(false);setEditPost(null);}}/>
      )}
    </div>
  );
}

// ─── Meta Item (small field pill used inside NewsCard) ──────────────────────
function MetaItem({ label, value, color='#fff' }) {
  return (
    <div>
      <div style={{ fontSize:9,color:'rgba(255,255,255,0.35)',
        textTransform:'uppercase',letterSpacing:1.5,marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:12,color,fontWeight:600 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { NewsSection, getNews, saveNews });
