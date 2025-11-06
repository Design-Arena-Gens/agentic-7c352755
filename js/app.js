import { Theme } from './theme.js';
import { Storage } from './storage.js';
import { TaskModel } from './tasks.js';
import { UI } from './ui.js';
import { Filters } from './filters.js';
import { DragDrop } from './dragdrop.js';
import { Search } from './search.js';
import { Tags } from './tags.js';
import { Exporter } from './exporter.js';
import { Notifier } from './notifications.js';

const state = {
  tasks: new TaskModel(Storage),
  filters: new Filters(),
  search: new Search(),
  tags: new Tags(),
  notifier: new Notifier(),
};

const ui = new UI(state);

function initParallax(){
  const root = document.querySelector('.parallax');
  if(!root) return;
  const layers = root.querySelectorAll('.parallax__layer');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    layers[0].style.transform = `translateY(${y * 0.15}px)`;
    layers[1].style.transform = `translateY(${y * 0.3}px)`;
    layers[2].style.transform = `translateY(${y * 0.45}px)`;
  }, { passive:true });
}

function setupNavLazyModules(){
  const map = {
    navStats: '/js/charts.js',
    navFocus: '/js/pomodoro.js',
  };
  Object.entries(map).forEach(([id, path]) => {
    const btn = document.getElementById(id);
    btn?.addEventListener('click', async () => {
      const viewId = id === 'navStats' ? 'viewStats' : 'viewFocus';
      ui.showView(viewId);
      if(!btn.dataset.loaded){
        btn.setAttribute('aria-busy','true');
        try{
          const mod = await import(path);
          mod?.mount?.(state, ui);
          btn.dataset.loaded = '1';
        }finally{
          btn.removeAttribute('aria-busy');
        }
      }
    });
  });
}

function setupTheme(){
  const toggle = document.getElementById('themeToggle');
  Theme.applyInitial();
  toggle?.addEventListener('click', Theme.toggle);
}

function setupExport(){
  const btn = document.getElementById('exportBtn');
  const menu = document.getElementById('exportMenu');
  if(!btn || !menu) return;
  let open = false;
  const set = (val)=>{
    open = val;
    menu.classList.toggle('show', open);
    menu.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    set(!open);
  });
  menu.addEventListener('click', (e)=> e.stopPropagation());
  document.addEventListener('click', ()=> set(false));
  menu.querySelectorAll('[data-export]')?.forEach(el=>{
    el.addEventListener('click', ()=>{
      const kind = el.getAttribute('data-export');
      const tasks = state.tasks.getAll();
      if(kind === 'json') Exporter.downloadJSON(tasks);
      if(kind === 'csv') Exporter.downloadCSV(tasks);
      set(false);
      ui.toast('?? ????? ?????');
    });
  })
}

function setupFooterYear(){
  document.getElementById('year').textContent = String(new Date().getFullYear());
}

function setupNav(){
  const tabs = [
    { btn: 'navTasks', view: 'viewTasks' },
    { btn: 'navStats', view: 'viewStats' },
    { btn: 'navFocus', view: 'viewFocus' },
  ];
  tabs.forEach(({btn, view})=>{
    const b = document.getElementById(btn);
    b?.addEventListener('click', ()=>{
      tabs.forEach(({btn:bid, view:vid})=>{
        document.getElementById(bid)?.setAttribute('aria-pressed', String(vid===view));
      })
      ui.showView(view);
    })
  })
}

function init(){
  initParallax();
  setupTheme();
  setupNav();
  setupNavLazyModules();
  setupExport();
  setupFooterYear();
  ui.mount();
  state.notifier.initPermission();
  state.notifier.startDueCheck(()=> state.tasks.getAll());
}

window.addEventListener('DOMContentLoaded', init);
