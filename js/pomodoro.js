export function mount(state, ui){
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');
  const startBtn = document.getElementById('startTimer');
  const pauseBtn = document.getElementById('pauseTimer');
  const resetBtn = document.getElementById('resetTimer');
  const modeSel = document.getElementById('timerMode');
  const logEl = document.querySelector('.session-log');

  const presets = { pomodoro:25, short:5, long:15 };
  let remaining = presets.pomodoro*60;
  let timer = null;

  function update(){
    const m = Math.floor(remaining/60), s = remaining%60;
    minutesEl.textContent = String(m).padStart(2,'0');
    secondsEl.textContent = String(s).padStart(2,'0');
  }
  function tick(){
    if(remaining>0){ remaining--; update(); }
    else { stop(); ui.toast('????? ??????!'); log('???? ??????'); notify(); }
  }
  function start(){ if(timer) return; timer = setInterval(tick, 1000); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  function reset(){ stop(); remaining = presets[modeSel.value]*60; update(); }
  function log(msg){ logEl.textContent = msg; }
  function notify(){ if(document.hidden){ new Notification('????? ??????').catch?.(()=>{}); } }

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', stop);
  resetBtn.addEventListener('click', reset);
  modeSel.addEventListener('change', ()=>{ reset(); log(''); })

  update();
}
