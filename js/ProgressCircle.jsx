function ProgressCircle({ rating, size = 'large' }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rating / 99) * circ;
  const tier = getTier(rating);
  const dim = size === 'large' ? 176 : 128;
  const rSize = size === 'large' ? 56 : 40;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ position:'relative', width:dim, height:dim }}>
        <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="50" cy="50" r={r} fill="none"
            stroke={tier.color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 0.5s ease', filter:`drop-shadow(0 0 10px ${tier.color})` }}
          />
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center'
        }}>
          <div style={{
            fontSize:rSize, fontWeight:700, fontFamily:'Audiowide, monospace',
            color:tier.color, filter:`drop-shadow(0 0 8px ${tier.color})`,
            lineHeight:1
          }}>{rating}</div>
          <div style={{
            fontSize:9, textTransform:'uppercase', letterSpacing:3,
            fontWeight:700, color:tier.color, marginTop:4
          }}>{tier.label}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProgressCircle });
