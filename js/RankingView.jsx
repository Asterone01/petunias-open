// ─── Ranking View ─────────────────────────────────────────────────────────────

function RankingView({ players, matches }) {
  const [categoria, setCategoria] = React.useState('ALL');
  const [genero, setGenero]       = React.useState('ALL');

  const ranked = getRanking(players, {
    categoria: categoria === 'ALL' ? null : categoria,
    genero: genero === 'ALL' ? null : genero,
  });

  return (
    <div>
      <div style={{ fontFamily:'Audiowide', color:'#00ff97', fontSize:18,
        textTransform:'uppercase', letterSpacing:2, marginBottom:20 }}>
        Ranking
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding:16, marginBottom:20,
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className2="two-col-form">
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Categoría</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {['ALL','A','B','C','D','E'].map(c => (
              <button key={c} onClick={()=>setCategoria(c)}
                style={chipStyle(categoria === c)}>
                {c === 'ALL' ? 'Todas' : c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="label-neon" style={{ marginBottom:6 }}>Género</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {[{k:'ALL',l:'Todos'},{k:'M',l:'♂ Hombres'},{k:'F',l:'♀ Mujeres'},{k:'O',l:'Otro'}].map(g => (
              <button key={g.k} onClick={()=>setGenero(g.k)}
                style={chipStyle(genero === g.k)}>
                {g.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && categoria === 'ALL' && genero === 'ALL' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
          {[ranked[1], ranked[0], ranked[2]].map((p, i) => {
            const places = [2, 1, 3];
            const place = places[i];
            const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
            const heights = { 1: 180, 2: 150, 3: 130 };
            return (
              <div key={p.id} className="glass-card"
                style={{ padding:16, textAlign:'center', height: heights[place],
                  border:`1px solid ${colors[place]}55`, display:'flex', flexDirection:'column',
                  justifyContent:'flex-end' }}>
                <div style={{ fontFamily:'Audiowide', fontSize:32, color: colors[place] }}>
                  #{place}
                </div>
                {p.foto && <img src={p.foto} alt="" style={{ width:50, height:50, borderRadius:'50%',
                  objectFit:'cover', margin:'4px auto', border:`2px solid ${colors[place]}` }} />}
                <div style={{ fontSize:12, fontWeight:'bold', color:'#fff', marginTop:4 }}>{p.nombre}</div>
                <div style={{ fontFamily:'Audiowide', fontSize:14, color:colors[place] }}>{p.rating}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {ranked.length === 0 ? (
        <div className="glass-card" style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.4)' }}>
          Sin jugadores para este filtro.
        </div>
      ) : ranked.map(p => {
        const stats = getPlayerStats(p, matches);
        return (
          <div key={p.id} className="glass-card" style={{
            padding:14, marginBottom:8,
            display:'grid', gridTemplateColumns:'40px 50px 1fr auto auto', gap:12, alignItems:'center',
            border: p.rank <= 3 ? '1px solid rgba(0,255,151,0.3)' : undefined
          }}>
            <div style={{ fontFamily:'Audiowide', fontSize:16,
              color: p.rank === 1 ? '#FFD700' : p.rank === 2 ? '#C0C0C0' : p.rank === 3 ? '#CD7F32' : '#00ff97',
              textAlign:'center' }}>
              #{p.rank}
            </div>
            {p.foto
              ? <img src={p.foto} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} />
              : <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(0,255,151,0.1)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎾</div>
            }
            <div>
              <div style={{ color:'#fff', fontWeight:'bold', fontSize:14 }}>{p.nombre}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>
                Cat. {p.categoria} · {stats.wins}V / {stats.losses}D · {stats.winRate}% win
                {stats.streak > 0 && <span style={{ color:'#00ff97' }}>  🔥 {stats.streak}</span>}
                {stats.streak < 0 && <span style={{ color:'#ff6b6b' }}>  ❄ {Math.abs(stats.streak)}</span>}
              </div>
            </div>
            <div style={{ fontFamily:'Audiowide', fontSize:18, color:'#00ff97' }}>
              {p.rating}
            </div>
            <div style={{ fontSize:10, padding:'3px 8px', borderRadius:5,
              background:'rgba(0,255,151,0.1)', color:'#00ff97', fontFamily:'Audiowide',
              letterSpacing:1 }}>
              {p.categoria}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const chipStyle = (active) => ({
  padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:11,
  background: active ? 'rgba(0,255,151,0.15)' : 'rgba(255,255,255,0.03)',
  border: `1px solid ${active ? '#00ff97' : 'rgba(255,255,255,0.1)'}`,
  color: active ? '#00ff97' : 'rgba(255,255,255,0.6)',
  fontFamily:'Audiowide', letterSpacing:1, textTransform:'uppercase',
});
