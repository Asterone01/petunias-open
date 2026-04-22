// ─── Trainings View ──────────────────────────────────────────────────────────

function TrainingForm({ players, training, currentUser, onSave, onCancel }) {
  const editing = !!training;
  const [form, setForm] = React.useState(training || {
    titulo: '', fecha: new Date().toISOString().slice(0,10),
    duracionMin: 60, categoria: 'Libre', lugar: '',
    playerIds: [], exercises: [], notas: '',
  });
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));

  const togglePlayer = (id) => {
    const has = form.playerIds.includes(id);
    set('playerIds', has ? form.playerIds.filter(x=>x!==id) : [...form.playerIds, id]);
  };

  const addExercise = () => set('exercises', [...form.exercises, { nombre:'', descripcion:'', duracionMin:15 }]);
  const setExercise = (i,k,v) => {
    const e = [...form.exercises]; e[i] = { ...e[i], [k]: v }; set('exercises', e);
  };
  const removeExercise = (i) => set('exercises', form.exercises.filter((_,j)=>j!==i));

  const handleSave = () => {
    if (!form.titulo.trim()) return alert('Poné un título al entrenamiento');
    if (!form.playerIds.length) return alert('Seleccioná al menos un jugador');
    onSave({
      ...form,
      fecha: new Date(form.fecha).getTime(),
      coachId: currentUser?.id || null,
      coachName: currentUser?.nombre || '',
    });
  };

  const inputStyle = {
    width:'100%', padding:'10px 12px', borderRadius:8,
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,255,151,0.2)',
    color:'#fff', fontSize:13,
  };

  return (
    <div className="glass-card" style={{ padding:28 }}>
      <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:14,
        textTransform:'uppercase', letterSpacing:2, marginBottom:22 }}>
        {editing?'Editar Entrenamiento':'Nuevo Entrenamiento'}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div style={{ gridColumn:'1 / -1' }}>
          <div className="label-neon" style={{ marginBottom:6 }}>Título</div>
          <input value={form.titulo} onChange={e=>set('titulo',e.target.value)} style={inputStyle}
            placeholder="ej. Técnica de derecha y saque"/>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Fecha</div>
          <input type="date" value={form.fecha} onChange={e=>set('fecha',e.target.value)} style={inputStyle}/>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Duración (min)</div>
          <input type="number" value={form.duracionMin} onChange={e=>set('duracionMin',e.target.value)} style={inputStyle}/>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Categoría</div>
          <select value={form.categoria} onChange={e=>set('categoria',e.target.value)} style={inputStyle}>
            {['Libre','A','B','C','D','E','Mixto'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Lugar</div>
          <input value={form.lugar} onChange={e=>set('lugar',e.target.value)} style={inputStyle}
            placeholder="Cancha / Club"/>
        </div>
      </div>

      {/* Player assignment */}
      <div style={{ marginBottom:14 }}>
        <div className="label-neon" style={{ marginBottom:8 }}>
          Jugadores asignados ({form.playerIds.length}/{players.length})
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',
          gap:6, maxHeight:200, overflowY:'auto', padding:8,
          background:'rgba(0,0,0,0.2)', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)' }}>
          {players.map(p => {
            const sel = form.playerIds.includes(p.id);
            return (
              <button key={p.id} onClick={()=>togglePlayer(p.id)}
                style={{ padding:'8px 10px', borderRadius:6, cursor:'pointer', textAlign:'left',
                  background: sel?'rgba(0,255,151,0.12)':'rgba(255,255,255,0.03)',
                  border:`1px solid ${sel?'#00ff97':'rgba(255,255,255,0.1)'}`,
                  color: sel?'#00ff97':'rgba(255,255,255,0.65)',
                  fontSize:11, fontWeight:600 }}>
                {sel?'✓ ':'+ '}{p.nombre} <span style={{ opacity:.6 }}>({p.categoria})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div className="label-neon">Ejercicios ({form.exercises.length})</div>
          <button onClick={addExercise} className="btn-outline" style={{ fontSize:11, padding:'5px 12px' }}>
            + Agregar
          </button>
        </div>
        {form.exercises.map((ex, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 3fr 80px auto', gap:8,
            marginBottom:6, padding:8, borderRadius:8, background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.05)' }}>
            <input value={ex.nombre} onChange={e=>setExercise(i,'nombre',e.target.value)}
              placeholder="Nombre" style={{ ...inputStyle, padding:'6px 10px', fontSize:12 }}/>
            <input value={ex.descripcion} onChange={e=>setExercise(i,'descripcion',e.target.value)}
              placeholder="Descripción" style={{ ...inputStyle, padding:'6px 10px', fontSize:12 }}/>
            <input type="number" value={ex.duracionMin} onChange={e=>setExercise(i,'duracionMin',e.target.value)}
              placeholder="min" style={{ ...inputStyle, padding:'6px 10px', fontSize:12 }}/>
            <button onClick={()=>removeExercise(i)}
              style={{ padding:'6px 10px', background:'rgba(192,57,43,0.1)',
                border:'1px solid rgba(192,57,43,0.3)', color:'#e74c3c',
                borderRadius:6, cursor:'pointer', fontSize:11 }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="label-neon" style={{ marginBottom:6 }}>Notas (opcional)</div>
        <textarea value={form.notas} onChange={e=>set('notas',e.target.value)}
          placeholder="Observaciones, objetivos..."
          style={{ ...inputStyle, minHeight:70, resize:'vertical' }}/>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={handleSave} className="btn-neon" style={{ flex:1 }}>
          {editing?'Guardar cambios':'Crear entrenamiento'}
        </button>
        <button onClick={onCancel} className="btn-outline" style={{ flex:1 }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Attendance Sheet ────────────────────────────────────────────────────────
function AttendanceSheet({ training, players, onClose, onChanged }) {
  const assigned = players.filter(p => training.playerIds.includes(p.id));
  const [records, setRecords] = React.useState(() =>
    getAttendanceForTraining(training.id).reduce((acc,r) => ({ ...acc, [r.playerId]: r }), {})
  );

  const setStatus = (playerId, status) => {
    const r = setPlayerAttendance(training.id, playerId, status);
    setRecords(rs => ({ ...rs, [playerId]: r }));
    onChanged && onChanged();
  };

  const btn = (active, color) => ({
    padding:'5px 10px', borderRadius:6, cursor:'pointer', fontSize:10,
    background: active?`${color}22`:'rgba(255,255,255,0.03)',
    border:`1px solid ${active?color:'rgba(255,255,255,0.1)'}`,
    color: active?color:'rgba(255,255,255,0.55)',
    fontFamily:'Audiowide', letterSpacing:1, textTransform:'uppercase',
  });

  return (
    <div className="glass-card" style={{ padding:24, marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:13,
          textTransform:'uppercase', letterSpacing:2 }}>
          Asistencia · {training.titulo}
        </div>
        <button onClick={onClose} className="btn-outline" style={{ fontSize:11, padding:'6px 12px' }}>
          Cerrar
        </button>
      </div>
      {assigned.length === 0 ? (
        <div style={{ color:'rgba(255,255,255,0.4)', padding:20, textAlign:'center' }}>
          Sin jugadores asignados.
        </div>
      ) : assigned.map(p => {
        const cur = records[p.id]?.status;
        return (
          <div key={p.id} style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', gap:12,
            alignItems:'center', padding:'8px 4px',
            borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            {p.foto
              ? <img src={p.foto} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }}/>
              : <div style={{ width:32, height:32, borderRadius:'50%',
                  background:'rgba(0,255,151,0.06)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:14 }}>🎾</div>
            }
            <div>
              <div style={{ fontSize:13, color:'#fff', fontWeight:600 }}>{p.nombre}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Cat. {p.categoria}</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setStatus(p.id,'presente')} style={btn(cur==='presente','#00ff97')}>Presente</button>
              <button onClick={()=>setStatus(p.id,'ausente')} style={btn(cur==='ausente','#ff6b6b')}>Ausente</button>
              <button onClick={()=>setStatus(p.id,'justificado')} style={btn(cur==='justificado','#FFD700')}>Justif.</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trainings View ──────────────────────────────────────────────────────────
function TrainingsView({ players, currentUser }) {
  const [trainings, setTrainings]  = React.useState(() => getTrainings());
  const [showForm, setShowForm]    = React.useState(false);
  const [editing, setEditing]      = React.useState(null);
  const [sheetFor, setSheetFor]    = React.useState(null); // training id
  const [filter, setFilter]        = React.useState('all'); // all | upcoming | past

  const canManage = currentUser?.isAdmin || currentUser?.isCoach;
  const isAdmin   = currentUser?.isAdmin;

  const refresh = () => setTrainings(getTrainings());

  const handleSave = (form) => {
    const all = getTrainings();
    if (editing) {
      const idx = all.findIndex(t => t.id === editing.id);
      all[idx] = { ...all[idx], ...form };
      saveTrainings(all);
    } else {
      saveTrainings([createTraining(form), ...all]);
    }
    setShowForm(false); setEditing(null); refresh();
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar este entrenamiento y su asistencia?')) return;
    saveTrainings(getTrainings().filter(t => t.id !== id));
    saveAttendance(getAttendance().filter(a => a.trainingId !== id));
    refresh();
  };

  const now = Date.now();
  const sorted = [...trainings].sort((a,b) => b.fecha - a.fecha);
  const filtered = filter==='upcoming' ? sorted.filter(t=>t.fecha>=now)
                 : filter==='past'     ? sorted.filter(t=>t.fecha<now)
                 : sorted;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:18,
          textTransform:'uppercase', letterSpacing:2 }}>
          Entrenamientos ({trainings.length})
        </div>
        {canManage && !showForm && (
          <button onClick={()=>{ setEditing(null); setShowForm(true); }} className="btn-neon">
            + Nuevo entrenamiento
          </button>
        )}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        {[{k:'all',l:'Todos'},{k:'upcoming',l:'Próximos'},{k:'past',l:'Pasados'}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)}
            className={filter===f.k?'cat-btn active':'cat-btn'} style={{ fontSize:11 }}>
            {f.l}
          </button>
        ))}
      </div>

      {showForm && canManage && (
        <TrainingForm players={players} training={editing} currentUser={currentUser}
          onSave={handleSave}
          onCancel={()=>{ setShowForm(false); setEditing(null); }}/>
      )}

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
          Sin entrenamientos en este filtro.
        </div>
      ) : filtered.map(t => {
        const attRecs = getAttendanceForTraining(t.id);
        const present = attRecs.filter(a=>a.status==='presente').length;
        const isPast = t.fecha < now;
        return (
          <React.Fragment key={t.id}>
            <div className="glass-card" style={{ padding:16,
              border: isPast?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(0,255,151,0.25)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:14, alignItems:'center' }}>
                <div style={{ textAlign:'center',
                  padding:'8px 10px', borderRadius:8,
                  background:'rgba(0,255,151,0.06)',
                  border:'1px solid rgba(0,255,151,0.15)' }}>
                  <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:18 }}>
                    {new Date(t.fecha).getDate()}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)',
                    textTransform:'uppercase', letterSpacing:1 }}>
                    {new Date(t.fecha).toLocaleDateString('es-AR',{ month:'short' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'#fff', fontSize:14, marginBottom:2 }}>{t.titulo}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                    {t.duracionMin} min · Cat. {t.categoria}
                    {t.lugar && ` · ${t.lugar}`}
                    {t.coachName && ` · Coach ${t.coachName}`}
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4 }}>
                    {t.playerIds.length} jugadores
                    {attRecs.length>0 && ` · ${present}/${attRecs.length} presentes`}
                    {t.exercises.length>0 && ` · ${t.exercises.length} ejercicios`}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {canManage && (
                    <button onClick={()=>setSheetFor(sheetFor===t.id?null:t.id)}
                      style={{ padding:'6px 12px', background:'rgba(0,255,151,0.1)',
                        border:'1px solid rgba(0,255,151,0.3)', color:'#00ff97',
                        borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                      {sheetFor===t.id?'✕ Cerrar':'Asistencia'}
                    </button>
                  )}
                  {canManage && (
                    <button onClick={()=>{ setEditing(t); setShowForm(true); }}
                      style={{ padding:'4px 12px', background:'transparent',
                        border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.55)',
                        borderRadius:6, cursor:'pointer', fontSize:10 }}>
                      Editar
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={()=>handleDelete(t.id)}
                      style={{ padding:'4px 12px', background:'transparent',
                        border:'1px solid rgba(192,57,43,0.25)', color:'#e74c3c',
                        borderRadius:6, cursor:'pointer', fontSize:10 }}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
            {sheetFor===t.id && (
              <AttendanceSheet training={t} players={players}
                onClose={()=>setSheetFor(null)}
                onChanged={refresh}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, { TrainingsView, TrainingForm, AttendanceSheet });
