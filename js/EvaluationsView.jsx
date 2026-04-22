// ─── Evaluations View ────────────────────────────────────────────────────────

const EVAL_FOCUS_OPTIONS = [
  'Derecha', 'Revés', 'Saque', 'Volea', 'Velocidad',
  'Mentalidad', 'Slice', 'Técnica', 'Físico', 'Táctica', 'Consistencia',
];

function EvaluationForm({ players, evaluation, currentUser, onSave, onCancel }) {
  const editing = !!evaluation;
  const [form, setForm] = React.useState(evaluation || {
    playerId: players[0]?.id || null,
    fecha: new Date().toISOString().slice(0,10),
    attrs: ATTRIBUTES.reduce((a,x) => ({ ...a, [x.key]: 5 }), {}),
    focusAreas: [],
    fortalezas: '', debilidades: '', notas: '',
  });
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));
  const setAttr = (k,v) => setForm(p => ({ ...p, attrs: { ...p.attrs, [k]: Number(v) }}));
  const toggleFocus = (f) => set('focusAreas',
    form.focusAreas.includes(f) ? form.focusAreas.filter(x=>x!==f) : [...form.focusAreas, f]);

  const handleSave = () => {
    if (!form.playerId) return alert('Elegí un jugador');
    onSave({
      ...form,
      fecha: typeof form.fecha === 'string' ? new Date(form.fecha).getTime() : form.fecha,
      coachId: currentUser?.id,
      coachName: currentUser?.nombre || '',
    });
  };

  const inp = {
    width:'100%', padding:'10px 12px', borderRadius:8,
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(59,130,246,0.2)',
    color:'#fff', fontSize:13,
  };

  return (
    <div className="glass-card" style={{ padding:28, borderColor:'rgba(59,130,246,0.25)' }}>
      <div style={{ fontFamily:'Audiowide', color:'#3b82f6', fontSize:14,
        textTransform:'uppercase', letterSpacing:2, marginBottom:22 }}>
        {editing?'Editar evaluación':'Nueva evaluación'}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Jugador</div>
          <select value={form.playerId||''} onChange={e=>set('playerId', Number(e.target.value))} style={inp}>
            {players.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>)}
          </select>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Fecha</div>
          <input type="date" value={typeof form.fecha==='string'?form.fecha:new Date(form.fecha).toISOString().slice(0,10)}
            onChange={e=>set('fecha',e.target.value)} style={inp}/>
        </div>
      </div>

      {/* Sliders per attribute */}
      <div style={{ marginBottom:14 }}>
        <div className="label-neon" style={{ marginBottom:8 }}>Atributos (0-10)</div>
        {ATTRIBUTES.map(a => (
          <div key={a.key} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11,
              color:'rgba(255,255,255,0.55)', marginBottom:3 }}>
              <span>{a.icon} {a.name}</span>
              <span style={{ fontFamily:'Audiowide', color:'#3b82f6' }}>{form.attrs[a.key]}</span>
            </div>
            <input type="range" min="0" max="10" step="1"
              value={form.attrs[a.key]} onChange={e=>setAttr(a.key, e.target.value)}
              style={{ width:'100%', accentColor:'#3b82f6' }}/>
          </div>
        ))}
      </div>

      {/* Focus areas */}
      <div style={{ marginBottom:14 }}>
        <div className="label-neon" style={{ marginBottom:8 }}>Áreas a trabajar</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {EVAL_FOCUS_OPTIONS.map(f => {
            const sel = form.focusAreas.includes(f);
            return (
              <button key={f} onClick={()=>toggleFocus(f)}
                style={{ padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:11,
                  background: sel?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.03)',
                  border: `1px solid ${sel?'#3b82f6':'rgba(255,255,255,0.1)'}`,
                  color: sel?'#3b82f6':'rgba(255,255,255,0.6)' }}>
                {sel?'✓ ':''}{f}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Fortalezas</div>
          <textarea value={form.fortalezas} onChange={e=>set('fortalezas',e.target.value)}
            placeholder="Qué hace bien..."
            style={{ ...inp, minHeight:70, resize:'vertical' }}/>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>A mejorar</div>
          <textarea value={form.debilidades} onChange={e=>set('debilidades',e.target.value)}
            placeholder="Qué necesita trabajar..."
            style={{ ...inp, minHeight:70, resize:'vertical' }}/>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="label-neon" style={{ marginBottom:6 }}>Notas del coach</div>
        <textarea value={form.notas} onChange={e=>set('notas',e.target.value)}
          placeholder="Observaciones, objetivos para el próximo mes..."
          style={{ ...inp, minHeight:80, resize:'vertical' }}/>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={handleSave} className="btn-neon" style={{ flex:1, background:'#3b82f6', borderColor:'#3b82f6', boxShadow:'0 0 12px rgba(59,130,246,0.4)' }}>
          {editing?'Guardar':'Crear evaluación'}
        </button>
        <button onClick={onCancel} className="btn-outline" style={{ flex:1 }}>Cancelar</button>
      </div>
    </div>
  );
}

function EvaluationCard({ evalRec, player, canManage, onEdit, onDelete }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div className="glass-card" style={{ padding:18, border:'1px solid rgba(59,130,246,0.18)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {player?.foto
            ? <img src={player.foto} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }}/>
            : <div style={{ width:36, height:36, borderRadius:'50%',
                background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:14 }}>🎾</div>
          }
          <div>
            <div style={{ fontSize:13, color:'#fff', fontWeight:700 }}>{player?.nombre || '—'}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>
              {new Date(evalRec.fecha).toLocaleDateString('es-AR')} · Coach {evalRec.coachName||'—'}
            </div>
          </div>
        </div>
        <button onClick={()=>setExpanded(!expanded)} className="btn-outline" style={{ fontSize:11, padding:'5px 12px' }}>
          {expanded?'Ocultar':'Ver detalle'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
            {ATTRIBUTES.map(a => (
              <div key={a.key} style={{ padding:8, borderRadius:6,
                background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.1)',
                textAlign:'center' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)',
                  textTransform:'uppercase', letterSpacing:1 }}>{a.name}</div>
                <div style={{ fontFamily:'Audiowide', fontSize:16, color:'#3b82f6' }}>
                  {evalRec.attrs[a.key] ?? '—'}
                </div>
              </div>
            ))}
          </div>

          {evalRec.focusAreas?.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div className="label-neon" style={{ marginBottom:6 }}>Áreas a trabajar</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {evalRec.focusAreas.map(f => (
                  <span key={f} style={{ padding:'4px 10px', borderRadius:4,
                    background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)',
                    color:'#3b82f6', fontSize:11 }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {(evalRec.fortalezas || evalRec.debilidades) && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              {evalRec.fortalezas && (
                <div style={{ padding:10, borderRadius:8, background:'rgba(0,255,151,0.04)',
                  border:'1px solid rgba(0,255,151,0.15)' }}>
                  <div style={{ fontSize:10, color:'#00ff97', textTransform:'uppercase',
                    letterSpacing:1, marginBottom:4, fontWeight:700 }}>Fortalezas</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>{evalRec.fortalezas}</div>
                </div>
              )}
              {evalRec.debilidades && (
                <div style={{ padding:10, borderRadius:8, background:'rgba(255,107,107,0.04)',
                  border:'1px solid rgba(255,107,107,0.15)' }}>
                  <div style={{ fontSize:10, color:'#ff6b6b', textTransform:'uppercase',
                    letterSpacing:1, marginBottom:4, fontWeight:700 }}>A mejorar</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>{evalRec.debilidades}</div>
                </div>
              )}
            </div>
          )}

          {evalRec.notas && (
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)',
              padding:10, borderRadius:8,
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
              lineHeight:1.5, whiteSpace:'pre-wrap' }}>
              {evalRec.notas}
            </div>
          )}

          {canManage && (
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={onEdit} className="btn-outline" style={{ fontSize:11, padding:'5px 12px' }}>
                Editar
              </button>
              <button onClick={onDelete} style={{ padding:'5px 12px', background:'transparent',
                border:'1px solid rgba(192,57,43,0.3)', color:'#e74c3c',
                borderRadius:6, cursor:'pointer', fontSize:11 }}>
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EvaluationsView({ players, currentUser }) {
  const [evals, setEvals] = React.useState(() => getEvaluations());
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing]   = React.useState(null);
  const [filterId, setFilterId] = React.useState('');

  const canManage = currentUser?.isAdmin || currentUser?.isCoach;
  const refresh = () => setEvals(getEvaluations());

  const handleSave = (form) => {
    const all = getEvaluations();
    if (editing) {
      const idx = all.findIndex(e => e.id === editing.id);
      all[idx] = { ...all[idx], ...form };
      saveEvaluations(all);
    } else {
      saveEvaluations([createEvaluation(form), ...all]);
    }
    setShowForm(false); setEditing(null); refresh();
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    saveEvaluations(getEvaluations().filter(e => e.id !== id));
    refresh();
  };

  const filtered = (filterId ? evals.filter(e => e.playerId === Number(filterId)) : evals)
    .sort((a,b) => b.fecha - a.fecha);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontFamily:'Audiowide', color:'#3b82f6', fontSize:18,
          textTransform:'uppercase', letterSpacing:2 }}>
          Evaluaciones ({evals.length})
        </div>
        {canManage && !showForm && (
          <button onClick={()=>{ setEditing(null); setShowForm(true); }} className="btn-neon"
            style={{ background:'#3b82f6', borderColor:'#3b82f6', boxShadow:'0 0 12px rgba(59,130,246,0.4)' }}>
            + Nueva evaluación
          </button>
        )}
      </div>

      <select value={filterId} onChange={e=>setFilterId(e.target.value)}
        style={{ padding:'10px 12px', borderRadius:8,
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(59,130,246,0.2)',
          color:'#fff', fontSize:13 }}>
        <option value="">Todos los jugadores</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>

      {showForm && canManage && (
        <EvaluationForm players={players} evaluation={editing} currentUser={currentUser}
          onSave={handleSave}
          onCancel={()=>{ setShowForm(false); setEditing(null); }}/>
      )}

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
          Sin evaluaciones aún.
        </div>
      ) : filtered.map(e => (
        <EvaluationCard key={e.id} evalRec={e}
          player={players.find(p => p.id === e.playerId)}
          canManage={canManage && (currentUser.isAdmin || currentUser.id === e.coachId)}
          onEdit={()=>{ setEditing(e); setShowForm(true); }}
          onDelete={()=>handleDelete(e.id)}/>
      ))}
    </div>
  );
}

Object.assign(window, { EvaluationsView, EvaluationForm, EvaluationCard });
