const CATEGORIES = ['A','B','C','D','E'];

function PlayerForm({ onAdd }) {
  const initAttrs = () => Object.fromEntries(ATTRIBUTES.map(a => [a.key, 5]));
  const [form, setForm] = React.useState({
    nombre:'', edad:'', genero:'M', categoria:'C',
    foto:null, fotoPreview:null, ...initAttrs()
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { set('foto', ev.target.result); set('fotoPreview', ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return alert('Por favor ingresa un nombre');
    onAdd({ ...form });
    setForm({ nombre:'', edad:'', genero:'M', categoria:'C', foto:null, fotoPreview:null, ...initAttrs() });
  };

  const rating = getFifaRating(form);
  const chartData = getChartData(form);

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:32 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Photo */}
          <div className="glass-card" style={{ padding:24 }}>
            <div className="label-neon">Foto del jugador</div>
            {form.fotoPreview ? (
              <div style={{ position:'relative', marginBottom:12 }}>
                <img src={form.fotoPreview} alt="preview" style={{
                  width:'100%', height:220, objectFit:'cover',
                  borderRadius:10, border:'2px solid #00ff97'
                }}/>
                <button type="button" onClick={() => { set('foto',null); set('fotoPreview',null); }}
                  style={{ position:'absolute',top:8,right:8, background:'#c0392b', color:'#fff',
                    border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:12 }}>
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <label style={{ display:'block', cursor:'pointer' }}>
                <div style={{
                  width:'100%', height:220, border:'2px dashed rgba(0,255,151,0.4)',
                  borderRadius:10, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', marginBottom:12,
                  background:'rgba(0,255,151,0.03)', transition:'all .2s'
                }}>
                  <div style={{ fontSize:36, marginBottom:8, opacity:.5 }}>📷</div>
                  <div style={{ color:'rgba(0,255,151,0.5)', fontSize:13, textTransform:'uppercase', letterSpacing:2 }}>
                    Subir foto
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
              </label>
            )}
          </div>

          {/* Basic info */}
          <div className="glass-card" style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div className="label-neon">Nombre</div>
              <input className="inp" type="text" value={form.nombre}
                onChange={e => set('nombre', e.target.value)} placeholder="Nombre del jugador" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div className="label-neon">Edad</div>
                <input className="inp" type="number" value={form.edad}
                  onChange={e => set('edad', e.target.value)} placeholder="Edad" min={5} max={99}/>
              </div>
              <div>
                <div className="label-neon">Género</div>
                <select className="inp" value={form.genero} onChange={e => set('genero', e.target.value)}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <div className="label-neon">Categoría</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => set('categoria', cat)}
                    className={form.categoria === cat ? 'cat-btn active' : 'cat-btn'}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="glass-card" style={{ padding:24, display:'flex', justifyContent:'center' }}>
            <ProgressCircle rating={rating} size="large" />
          </div>

          <div className="glass-card" style={{ padding:24 }}>
            <div className="label-neon" style={{ marginBottom:16 }}>Atributos</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {ATTRIBUTES.map(attr => (
                <div key={attr.key}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:13, display:'flex', gap:8, alignItems:'center', color:'rgba(255,255,255,0.85)' }}>
                      <span style={{ fontSize:16 }}>{attr.icon}</span> {attr.name}
                    </span>
                    <span style={{ color:'#00ff97', fontWeight:700, fontFamily:'Audiowide', fontSize:14 }}>
                      {form[attr.key]}
                    </span>
                  </div>
                  <input type="range" min={1} max={10} value={form[attr.key]}
                    onChange={e => set(attr.key, parseInt(e.target.value))}
                    className="slider" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="glass-card" style={{ padding:28 }}>
        <div className="label-neon" style={{ marginBottom:8, textAlign:'center' }}>Radar de Rendimiento</div>
        <RadarChartComponent data={chartData} />
      </div>

      {/* Submit */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <button type="submit" className="btn-neon">✓ Guardar Jugador</button>
        <button type="button" className="btn-outline" onClick={() =>
          setForm({ nombre:'', edad:'', genero:'M', categoria:'C', foto:null, fotoPreview:null, ...initAttrs() })
        }>↺ Resetear</button>
      </div>
    </form>
  );
}

Object.assign(window, { PlayerForm });
