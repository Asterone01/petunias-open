function RadarChartComponent({ data, color = '#00ff97', label = 'Skills' }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label,
          data: data.map(d => d.value),
          borderColor: color,
          backgroundColor: color + '26',
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#0a0e17',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: color,
            bodyColor: '#fff',
            borderColor: color,
            borderWidth: 1,
          }
        },
        scales: {
          r: {
            beginAtZero: true, max: 10,
            ticks: { color: 'rgba(255,255,255,0.4)', font:{ size:9 }, stepSize:2, backdropColor:'transparent' },
            grid: { color: color + '1a' },
            pointLabels: { color: '#ffffff', font:{ size:11, weight:'bold', family:'Audiowide' } },
            angleLines: { color: color + '20' }
          }
        }
      }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, color, label]);

  return (
    <div style={{ display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:380, height:300 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

Object.assign(window, { RadarChartComponent });
