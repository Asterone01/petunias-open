// ─── Monthly Medals View ─────────────────────────────────────────────────────

function MedalsView({ players, matches }) {
  const trainings  = typeof getTrainings  === 'function' ? getTrainings()  : [];
  const attendance = typeof getAttendance === 'function' ? getAttendance() : [];

  const months = React.useMemo(
    () => listAvailableMonths(matches, trainings, attendance),
    [matches, trainings.length, attendance.length]
  );
  const [monthKey, setMonthKey] = React.useState(months[0] || getMonthKey(Date.now()));

  const data = React.useMemo(
    () => computeMonthlyMedals(monthKey, players, matches),
    [monthKey, players, matches]
  );

  const formatMonth = (k) => {
    const [y,m] = k.split('-').map(Number);
    const d = new Date(y, m-1, 1);
    return d.toLocaleDateString('es-AR', { month:'long', year:'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  };

  const Podium = ({ title, icon, rows, unit }) => (
    <div className="glass-card" style={{ padding:18 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <span style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:12,
          textTransform:'uppercase', letterSpacing:2 }}>{title}</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, padding:'12px 0', textAlign:'center' }}>
          Sin datos este mes
        </div>
      ) : rows.map((r,i) => {
        const colors = ['#FFD700','#C0C0C0','#CD7F32'];
        return (
          <div key={r.playerId} style={{ display:'grid', gridTemplateColumns:'30px 32px 1fr auto',
            gap:10, alignItems:'center', padding:'6px 0',
            borderBottom: i<rows.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
            <div style={{ fontFamily:'Audiowide', fontSize:16, color:colors[i]||'#fff', textAlign:'center' }}>
              #{i+1}
            </div>
            {r.foto
              ? <img src={r.foto} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }}/>
              : <div style={{ width:28, height:28, borderRadius:'50%',
                  background:'rgba(0,255,151,0.06)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12 }}>🎾</div>
            }
            <div>
              <div style={{ fontSize:12, color:'#fff', fontWeight:600 }}>{r.nombre}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Cat. {r.categoria}</div>
            </div>
            <div style={{ fontFamily:'Audiowide', fontSize:14, color:'#00ff97' }}>
              {unit === 'delta'
                ? `${r.ratingDelta>=0?'+':''}${r.ratingDelta}`
                : r[unit] ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:18,
          textTransform:'uppercase', letterSpacing:2 }}>
          Medallas del mes
        </div>
        <select value={monthKey} onChange={e=>setMonthKey(e.target.value)}
          style={{ padding:'8px 12px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,255,151,0.2)',
            color:'#fff', fontSize:12, cursor:'pointer' }}>
          {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
        padding:'12px 16px', borderRadius:10,
        background:'rgba(0,255,151,0.04)', border:'1px solid rgba(0,255,151,0.12)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:20 }}>{data.totalMatches}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)',
            textTransform:'uppercase', letterSpacing:1.5 }}>Partidos</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:20 }}>{data.totalAttendance}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)',
            textTransform:'uppercase', letterSpacing:1.5 }}>Asistencias</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:20 }}>
            {Object.values(data.medals).reduce((s,rs)=>s+rs.length,0)}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)',
            textTransform:'uppercase', letterSpacing:1.5 }}>Ganadores</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        <Podium title="Más partidos"   icon="⚔️" rows={data.medals.mostPlayed}    unit="played"/>
        <Podium title="Más victorias"  icon="🏆" rows={data.medals.mostWins}      unit="wins"/>
        <Podium title="Mejor subida ELO" icon="📈" rows={data.medals.ratingGain}   unit="delta"/>
        <Podium title="Mejor racha"    icon="🔥" rows={data.medals.bestStreak}    unit="bestStreak"/>
        <Podium title="Más presentes"  icon="🎾" rows={data.medals.mostPresentes} unit="presentes"/>
      </div>
    </div>
  );
}

Object.assign(window, { MedalsView });
