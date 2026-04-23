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
    <motion.form 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit} 
      className="bg-mid-bg p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      <h2 className="text-brand-green font-audiowide text-2xl mb-2 text-center md:text-left">Agregar Nuevo Jugador</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {/* Photo */}
          <div className="bg-dark-bg/50 border border-gray-800 rounded-xl p-6">
            <label className="text-sm font-medium text-text-muted mb-3 block">Foto del jugador</label>
            {form.fotoPreview ? (
              <div className="relative mb-3">
                <img src={form.fotoPreview} alt="preview" className="w-full h-56 object-cover rounded-xl border-2 border-brand-green" />
                <button type="button" onClick={() => { set('foto',null); set('fotoPreview',null); }}
                  className="absolute top-2 right-2 bg-red-600 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer text-xs font-semibold hover:bg-red-700 transition-colors">
                  ✕ Quitar
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="w-full h-56 border-2 border-dashed border-brand-green/40 rounded-xl flex flex-col items-center justify-center mb-3 bg-brand-green/5 hover:bg-brand-green/10 transition-colors">
                  <div className="text-4xl mb-2 opacity-50">📷</div>
                  <div className="text-brand-green/50 text-xs uppercase tracking-widest font-semibold">
                    Subir foto
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>

          {/* Basic info */}
          <div className="bg-dark-bg/50 border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-text-muted mb-1.5 block">Nombre</label>
              <input className="w-full bg-dark-bg border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-green focus:ring-1 focus:ring-brand-green focus:outline-none transition-all font-bold" type="text" value={form.nombre}
                onChange={e => set('nombre', e.target.value)} placeholder="Nombre del jugador" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-muted mb-1.5 block">Edad</label>
                <input className="w-full bg-dark-bg border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-green focus:ring-1 focus:ring-brand-green focus:outline-none transition-all" type="number" value={form.edad}
                  onChange={e => set('edad', e.target.value)} placeholder="Edad" min={5} max={99}/>
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted mb-1.5 block">Género</label>
                <select className="w-full bg-dark-bg border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-green focus:ring-1 focus:ring-brand-green focus:outline-none transition-all" value={form.genero} onChange={e => set('genero', e.target.value)}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted mb-1.5 block">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => set('categoria', cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-audiowide uppercase tracking-wider transition-colors ${form.categoria === cat ? 'bg-brand-green text-dark-bg' : 'bg-gray-800 text-text-muted hover:bg-gray-700'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <div className="bg-dark-bg/50 border border-gray-800 rounded-xl p-6 flex justify-center">
            <ProgressCircle rating={rating} size="large" />
          </div>

          <div className="bg-dark-bg/50 border border-gray-800 rounded-xl p-6">
            <label className="text-sm font-medium text-text-muted mb-4 block border-b border-gray-700 pb-2">Atributos</label>
            <div className="flex flex-col gap-4">
              {ATTRIBUTES.map(attr => (
                <div key={attr.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm flex gap-2 items-center text-gray-300">
                      <span className="text-lg">{attr.icon}</span> {attr.name}
                    </span>
                    <span className="text-brand-green font-bold font-audiowide text-sm">
                      {form[attr.key]}
                    </span>
                  </div>
                  <input type="range" min={1} max={10} value={form[attr.key]}
                    onChange={e => set(attr.key, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-green" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="bg-dark-bg/50 border border-gray-800 rounded-xl p-6">
        <label className="text-sm font-medium text-text-muted mb-2 block text-center uppercase tracking-widest">Radar de Rendimiento</label>
        <RadarChartComponent data={chartData} />
      </div>

      {/* Submit */}
      <div className="flex gap-4 mt-4 justify-end border-t border-gray-800 pt-6">
        <button type="button" className="text-text-muted hover:text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors" onClick={() =>
          setForm({ nombre:'', edad:'', genero:'M', categoria:'C', foto:null, fotoPreview:null, ...initAttrs() })
        }>↺ Resetear</button>
        <button type="submit" className="bg-brand-green text-dark-bg font-semibold rounded-lg px-8 py-3 text-sm hover:bg-brand-teal transition-colors">✓ Guardar Jugador</button>
      </div>
    </motion.form>
  );
}

Object.assign(window, { PlayerForm });
