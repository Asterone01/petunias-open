// ─── Dashboard View v2.0 (Modular & Role-Based con Reorder) ─────────────────
// Implementa un sistema modular estilo monday.com con Framer Motion y Tailwind CSS.

const { Reorder } = window.Motion; // Extraemos Reorder del CDN de Framer Motion

function Widget({ title, size = 'col-span-1', children }) {
  return (
    <div className={`bg-mid-bg border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-full`}>
      {title && (
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
          <h3 className="text-brand-green font-audiowide text-sm uppercase tracking-widest">
            {title}
          </h3>
          <div className="cursor-grab active:cursor-grabbing text-text-muted hover:text-white" title="Arrastrar para reordenar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
          </div>
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function DashboardView({ players, matches, userRole }) {
  // === ESTADOS PARA EL REORDENAMIENTO ===
  // Manejamos dos listas de órdenes distintas para no mezclar las vistas
  const [adminOrder, setAdminOrder] = React.useState(['w_admin_total', 'w_admin_top3', 'w_admin_stats']);
  const [playerOrder, setPlayerOrder] = React.useState(['w_player_rank', 'w_player_stats', 'w_player_next']);

  // === VISTA ADMINISTRADOR ===
  if (userRole === 'admin') {
    const totalPlayers = (players || []).length;
    const top3 = [...(players || [])].sort((a,b) => (b.rating||0) - (a.rating||0)).slice(0, 3);
    const avgRating = totalPlayers > 0 ? Math.round(players.reduce((acc, p) => acc + (p.rating||0), 0) / totalPlayers) : 0;
    const totalMatches = (matches || []).length;

    // Objeto con el contenido de los widgets de Admin
    const adminWidgets = {
      w_admin_total: (
        <Reorder.Item key="w_admin_total" value="w_admin_total" className="md:col-span-1" layout>
          <Widget title="Total Jugadores">
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-4xl">👥</span>
              <span className="text-5xl font-audiowide text-brand-green">{totalPlayers}</span>
              <span className="text-xs text-text-muted uppercase tracking-widest">Registrados</span>
            </div>
          </Widget>
        </Reorder.Item>
      ),
      w_admin_top3: (
        <Reorder.Item key="w_admin_top3" value="w_admin_top3" className="md:col-span-3" layout>
          <Widget title="Top 3 Ranking Global">
            {top3.length === 0 ? (
              <div className="text-center text-text-muted py-4">No hay jugadores registrados</div>
            ) : (
              <div className="flex flex-col md:flex-row justify-around items-center h-full gap-6">
                {top3.map((p, i) => {
                  const colors = ['text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]'];
                  const borderColors = ['border-[#FFD700]', 'border-[#C0C0C0]', 'border-[#CD7F32]'];
                  return (
                    <div 
                      key={p.id}
                      className="flex flex-col items-center gap-3 bg-dark-bg/50 p-4 rounded-xl border border-gray-800 w-full md:w-1/3"
                    >
                      <div className={`font-audiowide text-2xl ${colors[i]}`}>#{i+1}</div>
                      {p.foto ? (
                        <img src={p.foto} className={`w-16 h-16 rounded-full object-cover border-2 ${borderColors[i]}`} alt="Avatar" />
                      ) : (
                        <div className={`w-16 h-16 rounded-full bg-dark-bg flex items-center justify-center text-2xl border-2 ${borderColors[i]}`}>
                          👤
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-white font-bold text-lg truncate w-full max-w-[150px]">{p.nombre || p.name}</div>
                        <div className="text-brand-green font-audiowide">{Math.round(p.rating || 0)} ELO</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Widget>
        </Reorder.Item>
      ),
      w_admin_stats: (
        <Reorder.Item key="w_admin_stats" value="w_admin_stats" className="md:col-span-4" layout>
          <Widget title="Estadísticas Generales del Equipo">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-dark-bg/50 p-6 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
                <span className="text-sm text-text-muted uppercase tracking-wider mb-2">ELO Promedio</span>
                <span className="text-3xl font-audiowide text-white">{avgRating}</span>
              </div>
              <div className="bg-dark-bg/50 p-6 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
                <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Partidos Jugados</span>
                <span className="text-3xl font-audiowide text-white">{totalMatches}</span>
              </div>
              <div className="bg-dark-bg/50 p-6 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
                <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Jugador Destacado</span>
                <span className="text-xl font-bold text-brand-green truncate">{top3[0]?.nombre || '—'}</span>
              </div>
              <div className="bg-dark-bg/50 p-6 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
                <span className="text-sm text-text-muted uppercase tracking-wider mb-2">Salud del Sistema</span>
                <span className="text-xl font-bold text-green-500">Optima 🟢</span>
              </div>
            </div>
          </Widget>
        </Reorder.Item>
      )
    };

    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-audiowide text-white mb-1">Panel Administrativo</h2>
            <p className="text-text-muted text-sm">Vista global del rendimiento del equipo.</p>
          </div>
        </div>

        <Reorder.Group 
          axis="y" 
          values={adminOrder} 
          onReorder={setAdminOrder} 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {adminOrder.map(id => adminWidgets[id])}
        </Reorder.Group>

        {/* ── Feed en tiempo real ── */}
        <div className="bg-mid-bg border border-gray-800 rounded-2xl p-6 shadow-xl">
          {typeof NewsFeed === 'function' && <NewsFeed currentUser={window.__dashboardCurrentUser} />}
        </div>
      </div>
    );
  }

  // === VISTA JUGADOR ===
  // Simulamos usando el primer jugador, o un dummy si no hay jugadores
  const me = players && players.length > 0 ? players[0] : null;
  const rank = me ? [...players].sort((a,b) => (b.rating||0) - (a.rating||0)).findIndex(p => p.id === me.id) + 1 : '-';
  
  // Estadisticas dummy si el jugador no las tiene
  const stats = me?.stats || { derecha: 70, reves: 65, saque: 80, fisico: 75, mentalidad: 85 };

  const playerWidgets = {
    w_player_rank: (
      <Reorder.Item key="w_player_rank" value="w_player_rank" className="md:col-span-1" layout>
        <Widget title="Mi Ranking">
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-brand-green flex items-center justify-center bg-dark-bg shadow-[0_0_15px_rgba(0,255,151,0.2)]">
              <span className="text-4xl font-audiowide text-white">#{rank}</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-text-muted uppercase tracking-widest block mb-1">ELO Actual</span>
              <span className="text-2xl font-bold text-brand-green">{me ? Math.round(me.rating || 0) : '—'}</span>
            </div>
          </div>
        </Widget>
      </Reorder.Item>
    ),
    w_player_stats: (
      <Reorder.Item key="w_player_stats" value="w_player_stats" className="md:col-span-2" layout>
        <Widget title="Mis Estadísticas Base">
          {!me ? (
             <div className="text-center text-text-muted py-4 h-full flex items-center justify-center">Información no disponible</div>
          ) : (
            <div className="flex flex-col justify-center h-full gap-5 px-4">
              {['ataque', 'defensa', 'saque', 'fisico', 'mentalidad'].map((statName) => {
                const val = stats[statName] || Math.floor(Math.random() * 40) + 50; 
                return (
                  <div key={statName} className="flex items-center gap-4">
                    <span className="text-sm text-text-muted capitalize w-20">{statName}</span>
                    <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div style={{ width: `${val}%` }} className="h-full bg-brand-green transition-all duration-1000 ease-out" />
                    </div>
                    <span className="text-white font-audiowide text-sm w-8 text-right">{val}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Widget>
      </Reorder.Item>
    ),
    w_player_next: (
      <Reorder.Item key="w_player_next" value="w_player_next" className="md:col-span-1" layout>
        <Widget title="Próximos Retos">
          <div className="flex flex-col justify-center h-full gap-4 text-center">
            <span className="text-3xl">🎾</span>
            <span className="text-text-muted text-sm px-2">No tienes partidos programados para esta semana.</span>
            <button className="mt-2 bg-brand-green/10 border border-brand-green text-brand-green text-xs uppercase tracking-widest px-4 py-2 rounded-lg font-bold hover:bg-brand-green hover:text-dark-bg transition-colors">
              Buscar Retador
            </button>
          </div>
        </Widget>
      </Reorder.Item>
    )
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        {me?.foto ? (
          <img src={me.foto} className="w-12 h-12 rounded-full border-2 border-brand-green object-cover" alt="Perfil" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green border-2 border-brand-green flex items-center justify-center text-xl">👤</div>
        )}
        <div>
          <h2 className="text-2xl font-audiowide text-white mb-1">¡Hola, {me ? (me.nombre || me.name).split(' ')[0] : 'Jugador'}!</h2>
          <p className="text-text-muted text-sm">Aquí tienes el resumen de tu rendimiento.</p>
        </div>
      </div>

      <Reorder.Group 
        axis="y" 
        values={playerOrder} 
        onReorder={setPlayerOrder} 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {playerOrder.map(id => playerWidgets[id])}
      </Reorder.Group>

      {/* ── Feed en tiempo real ── */}
      <div className="bg-mid-bg border border-gray-800 rounded-2xl p-6 shadow-xl">
        {typeof NewsFeed === 'function' && <NewsFeed currentUser={window.__dashboardCurrentUser} />}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView });
