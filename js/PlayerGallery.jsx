const PlayerGallery = ({ players, onDelete }) => {
  // Estados para nuestros nuevos filtros
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('All');

  // Lógica para filtrar a los jugadores en tiempo real
  const filteredPlayers = players.filter(p => {
    // 1. Filtro por nombre (ignorando mayúsculas y minúsculas)
    const matchesSearch = (p.nombre || p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    // 2. Filtro por categoría
    const matchesCat = filterCat === 'All' || p.categoria === filterCat;
    
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
        <h2 style={{ color: '#00ff97', fontFamily: 'Audiowide', fontSize: 22, margin: 0 }}>
          Galería de Jugadores ({filteredPlayers.length})
        </h2>
      </div>
      
      {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: 24, display: 'flex', gap: 15, flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Buscador de texto */}
        <div style={{ flex: '1 1 250px' }}>
          <input 
            type="text" 
            className="inp" 
            placeholder="🔍 Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Botones de Categoría */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'A', 'B', 'C', 'D', 'Infantil'].map(cat => (
            <button 
              key={cat}
              className={`cat-btn ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat === 'All' ? 'Todas las Cat.' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* ── GRILLA DE JUGADORES ── */}
      {filteredPlayers.length > 0 ? (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredPlayers.map(p => (
            /* Asumimos que PlayerCard ya existe en tu archivo js/PlayerCard.jsx */
            <PlayerCard key={p.id} player={p} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7c7c7c', border: '1px dashed #4d4d4d', borderRadius: 8 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎾</div>
          <p style={{ fontFamily: 'Audiowide', letterSpacing: 1 }}>No se encontraron jugadores con esos filtros.</p>
          <button className="btn-outline" style={{ marginTop: 15 }} onClick={() => {setSearchTerm(''); setFilterCat('All');}}>
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};