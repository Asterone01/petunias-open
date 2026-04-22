// ─── Backup / Restore Panel ───────────────────────────────────────────────────

function BackupPanel({ players, tournaments, onPlayersChange, onTournamentsChange }) {
  const [status, setStatus] = React.useState('');
  const [importing, setImporting] = React.useState(false);

  const exportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      players,
      tournaments,
      news: (() => { try { return JSON.parse(localStorage.getItem('petunias-news')) || []; } catch { return []; } })(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `petunias-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('✓ Backup descargado correctamente');
    setTimeout(() => setStatus(''), 3000);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.version) throw new Error('Formato inválido');
        if (!confirm(`¿Restaurar backup del ${new Date(data.exportedAt).toLocaleDateString('es-AR')}?\n\nEsto REEMPLAZA todos los datos actuales.`)) return;
        if (data.players)     onPlayersChange(data.players);
        if (data.tournaments) onTournamentsChange(data.tournaments);
        if (data.news)        localStorage.setItem('petunias-news', JSON.stringify(data.news));
        setStatus('✓ Datos restaurados correctamente');
        setTimeout(() => setStatus(''), 4000);
      } catch {
        setStatus('✕ Error: archivo inválido');
        setTimeout(() => setStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAll = () => {
    if (!confirm('⚠️ ¿Borrar TODOS los datos?\n\nEsta acción no se puede deshacer.')) return;
    onPlayersChange([]);
    onTournamentsChange([]);
    localStorage.removeItem('petunias-news');
    setStatus('✓ Datos borrados');
    setTimeout(() => setStatus(''), 3000);
  };

  const stats = [
    { label: 'Jugadores',  value: players.length,                      color: '#00ff97' },
    { label: 'Torneos',    value: tournaments.length,                   color: '#FFD700' },
    { label: 'Noticias',   value: (() => { try { return JSON.parse(localStorage.getItem('petunias-news'))?.length || 0; } catch { return 0; } })(), color: '#3b82f6' },
    { label: 'Usuarios',   value: getAllUsers().length,                  color: '#ff6b9d' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ padding:'14px', borderRadius:10, textAlign:'center',
            background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}20` }}>
            <div style={{ fontSize:28, fontWeight:700, fontFamily:'Audiowide', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:2,
              color:'rgba(255,255,255,0.35)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Export */}
      <div style={{ padding:'20px', borderRadius:12,
        background:'rgba(0,255,151,0.04)', border:'1px solid rgba(0,255,151,0.15)' }}>
        <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:12,
          textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>Exportar datos</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:14, lineHeight:1.6 }}>
          Descarga un archivo <strong style={{ color:'rgba(255,255,255,0.7)' }}>.json</strong> con todos tus jugadores, torneos y noticias. Guardalo como backup o para mover los datos a otro dispositivo.
        </div>
        <button className="btn-neon" onClick={exportData} style={{ fontSize:12, padding:'10px 20px' }}>
          ↓ Descargar Backup
        </button>
      </div>

      {/* Import */}
      <div style={{ padding:'20px', borderRadius:12,
        background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.15)' }}>
        <div style={{ fontFamily:'Audiowide', color:'#3b82f6', fontSize:12,
          textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>Restaurar backup</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:14, lineHeight:1.6 }}>
          Seleccioná un archivo <strong style={{ color:'rgba(255,255,255,0.7)' }}>.json</strong> exportado anteriormente. <span style={{ color:'#ffaa00' }}>⚠ Reemplaza los datos actuales.</span>
        </div>
        <label>
          <div className="btn-outline" style={{ fontSize:12, padding:'10px 20px',
            display:'inline-block', cursor:'pointer',
            borderColor:'#3b82f6', color:'#3b82f6' }}>
            ↑ Cargar archivo de backup
          </div>
          <input type="file" accept=".json" onChange={importData} style={{ display:'none' }}/>
        </label>
      </div>

      {/* Danger zone */}
      <div style={{ padding:'20px', borderRadius:12,
        background:'rgba(192,57,43,0.04)', border:'1px solid rgba(192,57,43,0.2)' }}>
        <div style={{ fontFamily:'Audiowide', color:'#e74c3c', fontSize:12,
          textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>Zona de peligro</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:14 }}>
          Borra absolutamente todos los datos de la app. Hacé un backup antes.
        </div>
        <button onClick={clearAll}
          style={{ padding:'10px 20px', background:'rgba(192,57,43,0.12)',
            border:'1px solid rgba(192,57,43,0.4)', color:'#e74c3c',
            borderRadius:8, cursor:'pointer', fontFamily:'Audiowide',
            fontSize:11, textTransform:'uppercase', letterSpacing:1 }}>
          ✕ Borrar todos los datos
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={{ padding:'12px 16px', borderRadius:9, textAlign:'center',
          background: status.startsWith('✓') ? 'rgba(0,255,151,0.1)' : 'rgba(231,76,60,0.1)',
          border: `1px solid ${status.startsWith('✓') ? 'rgba(0,255,151,0.3)' : 'rgba(231,76,60,0.3)'}`,
          color: status.startsWith('✓') ? '#00ff97' : '#e74c3c',
          fontFamily:'Audiowide', fontSize:12, letterSpacing:1 }}>
          {status}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BackupPanel });
