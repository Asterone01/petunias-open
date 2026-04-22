function PlayerCard({ player, onDelete }) {
  const [expanded, setExpanded] = React.useState(false);
  const rating = getFifaRating(player);
  const tier = getTier(rating);
  const chartData = getChartData(player);

  return (
    <div className="player-card" style={{
      borderRadius:14, overflow:'hidden',
      border:'1px solid rgba(0,255,151,0.15)',
      background:'linear-gradient(160deg,#0f1628,#0a0e1f)',
      transition:'all .3s', display:'flex', flexDirection:'column'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,255,151,0.5)'; e.currentTarget.style.boxShadow='0 0 30px rgba(0,255,151,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(0,255,151,0.15)'; e.currentTarget.style.boxShadow='none'; }}
    >
      {/* Photo area */}
      <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', background:'#060a18' }}>
        {player.foto ? (
          <img src={player.foto} alt={player.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        ) : (
          <div style={{
            width:'100%', height:'100%', display:'flex', alignItems:'center',
            justifyContent:'center', background:'linear-gradient(135deg,#0f1a30,#0a0e1f)'
          }}>
            <svg viewBox="0 0 190.86 186.58" width="80" height="78" style={{ opacity:.18 }}>
              <polygon fill="#00ff97" points="103.34 86.54 112.1 74.58 180.44 62.6 190.86 78.82 168.13 143.76 163.35 124.71 103.34 86.54"/>
              <polygon fill="#00ff97" points="108.61 105.73 122.69 110.37 155.21 171.65 142.99 186.58 74.22 185.03 90.85 174.6 108.61 105.73"/>
              <polygon fill="#00ff97" points="91.99 116.67 91.93 131.5 43.69 181.35 25.72 174.35 5.94 108.47 21 121.06 91.99 116.67"/>
              <polygon fill="#00ff97" points="76.44 104.24 62.32 108.77 0 78.3 1.1 59.04 57.66 19.87 50.34 38.09 76.44 104.24"/>
              <polygon fill="#00ff97" points="83.46 85.62 74.79 73.59 84.51 4.9 103.17 0 157.9 41.68 138.31 40.35 83.46 85.62"/>
            </svg>
          </div>
        )}
        {/* Top gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,.7) 0%, transparent 40%, rgba(0,0,0,.75) 70%, #0a0e1f 100%)' }}/>
        
        {/* Rating badge */}
        <div style={{
          position:'absolute', top:12, left:12,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
          border:`2px solid ${tier.color}`, borderRadius:10,
          padding:'8px 12px', textAlign:'center',
          boxShadow:`0 0 16px ${tier.color}55`
        }}>
          <div style={{ fontSize:32, fontWeight:700, fontFamily:'Audiowide', color:tier.color, lineHeight:1 }}>{rating}</div>
          <div style={{ fontSize:8, textTransform:'uppercase', letterSpacing:2, color:tier.color, marginTop:2 }}>{tier.label}</div>
        </div>

        {/* Category badge */}
        <div style={{
          position:'absolute', top:12, right:12,
          background:'#00ff97', color:'#000',
          borderRadius:8, padding:'6px 14px',
          fontWeight:700, fontSize:22, fontFamily:'Audiowide',
          boxShadow:'0 0 16px #00ff97'
        }}>{player.categoria}</div>

        {/* Name + info */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px' }}>
          <div style={{
            fontSize:18, fontWeight:700, fontFamily:'Audiowide',
            color:'#00ff97', textTransform:'uppercase', letterSpacing:1,
            textShadow:'0 0 10px #00ff97', marginBottom:4,
            textWrap:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
          }}>{player.nombre}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'flex', gap:12 }}>
            <span>{player.genero === 'M' ? '♂ Hombre' : player.genero === 'F' ? '♀ Mujer' : '⚥ Otro'}</span>
            {player.edad && <span>{player.edad} años</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:'16px 20px', flex:1 }}>
        {!expanded ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ATTRIBUTES.slice().sort((a,b) => (player[b.key]||0)-(player[a.key]||0)).slice(0,4).map(attr => (
              <div key={attr.key} style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                <span style={{ color:'rgba(255,255,255,0.6)', width:90, display:'flex', alignItems:'center', gap:6 }}>
                  <span>{attr.icon}</span>{attr.name}
                </span>
                <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', width:`${(player[attr.key]||0)*10}%`,
                    background:'#00ff97', borderRadius:4,
                    boxShadow:'0 0 6px #00ff97'
                  }}/>
                </div>
                <span style={{ color:'#00ff97', fontWeight:700, fontFamily:'Audiowide', fontSize:13, width:18, textAlign:'right' }}>
                  {player[attr.key]||0}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {ATTRIBUTES.map(attr => (
                <div key={attr.key} style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                  <span style={{ color:'rgba(255,255,255,0.6)', width:90, display:'flex', alignItems:'center', gap:6 }}>
                    <span>{attr.icon}</span>{attr.name}
                  </span>
                  <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width:`${(player[attr.key]||0)*10}%`,
                      background:'#00ff97', borderRadius:4, boxShadow:'0 0 6px #00ff97'
                    }}/>
                  </div>
                  <span style={{ color:'#00ff97', fontWeight:700, fontFamily:'Audiowide', fontSize:13, width:18, textAlign:'right' }}>
                    {player[attr.key]||0}
                  </span>
                </div>
              ))}
            </div>
            <RadarChartComponent data={chartData} />
          </div>
        )}

        <div style={{ textAlign:'center', color:'rgba(0,255,151,0.2)', fontSize:9,
          textTransform:'uppercase', letterSpacing:3, marginTop:12, fontFamily:'Audiowide' }}>
          PETUNIAS OPEN
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(0,255,151,0.1)',
        background:'rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:8 }}>
        <button className="btn-outline" style={{ fontSize:12, padding:'8px' }}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Ocultar detalles' : '▼ Ver perfil completo'}
        </button>
        <button onClick={() => { if(confirm(`¿Eliminar a ${player.nombre}?`)) onDelete(player.id); }}
          style={{
            padding:'8px', background:'rgba(192,57,43,0.15)',
            border:'1px solid rgba(192,57,43,0.4)', color:'#e74c3c',
            borderRadius:8, cursor:'pointer', fontSize:12,
            textTransform:'uppercase', letterSpacing:1, fontWeight:700,
            transition:'all .2s'
          }}>
          ✕ Eliminar
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PlayerCard });
