export function mount(state, ui){
  const canvas1 = document.getElementById('chartCompletion');
  const canvas2 = document.getElementById('chartTags');
  if(!canvas1 || !canvas2) return;

  const render = ()=>{
    drawCompletion(canvas1, state.tasks.getAll());
    drawTags(canvas2, state.tasks.getAll());
  };
  render();
  // re-render on list changes (simple hook via debounce resize)
  window.addEventListener('resize', render);
}

function drawCompletion(canvas, tasks){
  const ctx = canvas.getContext('2d');
  const done = tasks.filter(t=> t.status==='done').length;
  const todo = tasks.length - done;
  const total = Math.max(1, tasks.length);

  ctx.clearRect(0,0,canvas.width, canvas.height);

  // donut chart
  const cx = canvas.width/2, cy = canvas.height/2, r=100, th=28;
  const pct = done/total;
  arcRing(ctx, cx, cy, r, th, 0, Math.PI*2, '#334155');
  arcRing(ctx, cx, cy, r, th, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct, '#22c55e');

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 28px ui-sans-serif, system-ui';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(Math.round(pct*100)+'%', cx, cy);

  legend(ctx, 30, canvas.height-50, [ ['?????', '#22c55e'], ['??? ???????', '#f59e0b'] ]);
}

function drawTags(canvas, tasks){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width, canvas.height);
  const map = new Map();
  tasks.forEach(t=> (t.tags||[]).forEach(tag=> map.set(tag.name, (map.get(tag.name)||0)+1)));
  const entries = [...map.entries()].sort((a,b)=> b[1]-a[1]).slice(0,6);
  const max = Math.max(1, ...entries.map(e=> e[1]));

  const left=60, right=40, top=30, bottom=40;
  const w = canvas.width - left - right;
  const h = canvas.height - top - bottom;

  // axes
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1; ctx.strokeRect(left, top, w, h);

  // bars
  const gap = 14; const barW = (w - gap*(entries.length-1))/entries.length;
  entries.forEach((e, i)=>{
    const x = left + i*(barW+gap);
    const y = top + h - (e[1]/max)*h;
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x, y, barW, (e[1]/max)*h);

    ctx.fillStyle='#cbd5e1';
    ctx.font='12px ui-sans-serif, system-ui';
    ctx.textAlign='center';
    ctx.fillText(e[0], x+barW/2, top+h+14);
  })
}

function arcRing(ctx, cx, cy, r, th, a1, a2, color){
  ctx.beginPath();
  ctx.arc(cx,cy,r,a1,a2);
  ctx.arc(cx,cy,r-th,a2,a1,true);
  ctx.closePath();
  ctx.fillStyle=color; ctx.fill();
}

function legend(ctx, x, y, items){
  items.forEach((it, i)=>{
    ctx.fillStyle = it[1];
    ctx.fillRect(x, y + i*22, 14, 14);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px ui-sans-serif, system-ui';
    ctx.textBaseline='top';
    ctx.fillText(it[0], x+20, y + i*22);
  })
}
