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
        <div className="bg-mid-bg rounded-lg p-10 text-center text-gray-400 shadow-lg">
          Sin jugadores para este filtro.
        </div>
      ) : ranked.map((p, index) => {
        const stats = getPlayerStats(p, matches);
        return (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`bg-mid-bg rounded-lg p-3.5 mb-2 flex items-center gap-3 shadow-lg ${p.rank <= 3 ? 'border border-brand-green/30' : 'border border-transparent'}`}
          >
            <div className={`font-audiowide text-base w-10 text-center ${p.rank === 1 ? 'text-[#FFD700]' : p.rank === 2 ? 'text-[#C0C0C0]' : p.rank === 3 ? 'text-[#CD7F32]' : 'text-brand-green'}`}>
              #{p.rank}
            </div>
            
            {p.foto ? (
              <img src={p.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-lg">
                🎾
              </div>
            )}
            
            <div className="flex-1">
              <div className="text-white font-bold text-sm">{p.nombre}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Cat. {p.categoria} · {stats.wins}V / {stats.losses}D · {stats.winRate}% win
                {stats.streak > 0 && <span className="text-brand-green ml-1">🔥 {stats.streak}</span>}
                {stats.streak < 0 && <span className="text-[#ff6b6b] ml-1">❄ {Math.abs(stats.streak)}</span>}
              </div>
            </div>
            
            <div className="font-audiowide text-lg text-brand-green">
              {p.rating}
            </div>
            
            <div className="text-[10px] px-2 py-1 rounded bg-brand-green/10 text-brand-green font-audiowide tracking-widest hidden sm:block">
              {p.categoria}
            </div>
          </motion.div>
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
