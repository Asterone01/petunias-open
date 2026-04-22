const ComparisonView = ({ players }) => {
  const [p1Id, setP1Id] = React.useState('');
  const [p2Id, setP2Id] = React.useState('');
  const [matches, setMatches] = React.useState([]);

  // Cargamos los partidos para calcular el historial directo
  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('petunias-matches')) || [];
      setMatches(stored);
    } catch (e) {
      console.error("Error cargando partidos:", e);
    }
  }, []);

  const p1 = players.find(p => p.id == p1Id);
  const p2 = players.find(p => p.id == p2Id);

  // Filtramos partidos entre ellos
  const h2h = matches.filter(m => 
    (m.playerAId == p1Id && m.playerBId == p2Id) || 
    (m.playerAId == p2Id && m.playerBId == p1Id)
  );

  const p1Wins = h2h.filter(m => m.winnerId == p1Id).length;
  const p2Wins = h2h.filter(m => m.winnerId == p2Id).length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={{ color: '#00ff97', fontFamily: 'Audiowide', marginBottom: 20 }}>⇄ Comparar Jugadores</h2>
      
      {/* ── SELECTORES ── */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="two-col-form">
          <div>
            <label className="label-neon">Jugador 1</label>
            <select className="inp" value={p1Id} onChange={e => setP1Id(e.target.value)}>
              <option value="">-- Seleccionar Jugador --</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-neon">Jugador 2</label>
            <select className="inp" value={p2Id} onChange={e => setP2Id(e.target.value)}>
              <option value="">-- Seleccionar Rival --</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.nombre || p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {p1 && p2 && p1Id === p2Id && (
        <div className="glass-card" style={{ padding: 20, textAlign: 'center', color: '#ffc107' }}>
          Debes seleccionar dos jugadores diferentes para comparar.
        </div>
      )}

      {p1 && p2 && p1Id !== p2Id && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* ── HEADER VS (Marcador Historial) ── */}
          <div className="glass-card dialog-elev" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontFamily: 'Audiowide', fontSize: 32, margin: 0 }}>
              <span style={{ color: p1Wins > p2Wins ? '#00ff97' : p1Wins === p2Wins ? '#fff' : '#7c7c7c' }}>{p1Wins}</span> 
              <span style={{ color: '#4d4d4d', margin: '0 20px' }}>-</span> 
              <span style={{ color: p2Wins > p1Wins ? '#00ff97' : p1Wins === p2Wins ? '#fff' : '#7c7c7c' }}>{p2Wins}</span>
            </h3>
            <p style={{ color: '#7c7c7c', fontSize: 12, marginTop: 8, fontFamily: 'Audiowide', textTransform: 'uppercase' }}>
              Victorias Frente a Frente
            </p>
          </div>

          {/* ── CARDS DE LOS JUGADORES ── */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 20, 
            alignItems: 'start' 
          }}>
            {/* Renderizamos tu componente PlayerCard para el jugador 1 */}
            <div style={{ border: p1Wins > p2Wins ? '2px solid #00ff97' : '2px solid transparent', borderRadius: 10, padding: 4 }}>
               <PlayerCard player={p1} />
            </div>
            
            {/* Renderizamos tu componente PlayerCard para el jugador 2 */}
            <div style={{ border: p2Wins > p1Wins ? '2px solid #00ff97' : '2px solid transparent', borderRadius: 10, padding: 4 }}>
               <PlayerCard player={p2} />
            </div>
          </div>

          {/* ── HISTORIAL DE PARTIDOS ── */}
          <div className="glass-card" style={{ textAlign: 'left', padding: '24px 16px' }}>
            <h4 className="label-neon" style={{ borderBottom: '1px solid #4d4d4d', paddingBottom: 10, marginBottom: 15 }}>
              Historial de Partidos ({h2h.length})
            </h4>
            
            {h2h.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {h2h.map((m, i) => {
                  const winner = players.find(p => p.id == m.winnerId);
                  const loser = players.find(p => p.id == (m.playerAId == m.winnerId ? m.playerBId : m.playerAId));
                  return (
                    <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <strong style={{ color: '#00ff97' }}>{winner?.nombre || winner?.name}</strong> 
                        <span style={{ color: '#7c7c7c', margin: '0 6px' }}>venció a</span> 
                        <span style={{ color: '#cbcbcb' }}>{loser?.nombre || loser?.name}</span>
                        {m.score && <span style={{ marginLeft: 8, color: '#fff', fontWeight: 'bold' }}>({m.score})</span>}
                      </div>
                      <div style={{ color: '#7c7c7c', fontSize: 11, fontFamily: 'Audiowide' }}>
                        {new Date(m.date || m.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#7c7c7c' }}>
                <p>Aún no se han enfrentado en la cancha.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}