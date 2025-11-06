import { html, escapeRegExp } from './util.js';

export class UI{
  constructor(state){
    this.state = state;
    this.elements = {};
  }
  mount(){
    this.cache();
    this.renderSkeleton(6);
    setTimeout(()=>{ // simulate loading for skeleton
      this.bind();
      this.renderList();
      this.elements.listWrap.setAttribute('aria-busy','false');
      this.elements.skeleton.replaceChildren();
    }, 350);
  }
  cache(){
    this.elements = {
      form: document.getElementById('taskForm'),
      title: document.getElementById('taskTitle'),
      desc: document.getElementById('taskDesc'),
      priority: document.getElementById('taskPriority'),
      due: document.getElementById('taskDue'),
      tags: document.getElementById('taskTags'),
      tagColor: document.getElementById('tagColor'),

      filterStatus: document.getElementById('filterStatus'),
      filterPriority: document.getElementById('filterPriority'),
      filterDate: document.getElementById('filterDate'),
      search: document.getElementById('searchInput'),

      list: document.getElementById('taskList'),
      listWrap: document.querySelector('.list-wrap'),
      skeleton: document.getElementById('skeleton'),

      toast: document.getElementById('toastContainer'),
    }
  }
  bind(){
    this.elements.form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = this.elements.title.value.trim();
      if(!title) return;
      const tags = this.parseTags(this.elements.tags.value, this.elements.tagColor.value);
      this.state.tasks.add({
        title,
        description: this.elements.desc.value.trim(),
        priority: this.elements.priority.value,
        due: this.elements.due.value || null,
        tags,
      });
      this.elements.form.reset();
      this.renderList();
      this.toast('??? ????? ??????');
    });

    ['change','input'].forEach(ev=>{
      this.elements.filterStatus.addEventListener(ev, ()=> this.renderList());
      this.elements.filterPriority.addEventListener(ev, ()=> this.renderList());
      this.elements.filterDate.addEventListener(ev, ()=> this.renderList());
      this.elements.search.addEventListener(ev, ()=> this.renderList());
    });

    // keyboard reordering
    this.elements.list.addEventListener('keydown', (e)=>{
      const li = e.target.closest('li.task');
      if(!li) return;
      if(e.altKey && (e.key==='ArrowUp' || e.key==='ArrowDown')){
        e.preventDefault();
        const items = Array.from(this.elements.list.querySelectorAll('li.task'));
        const idx = items.indexOf(li);
        const to = e.key==='ArrowUp' ? Math.max(0, idx-1) : Math.min(items.length-1, idx+1);
        this.state.tasks.reorder(li.dataset.id, to);
        this.renderList();
        items[to]?.focus();
      }
    });
  }
  parseTags(text, fallbackColor){
    const parts = (text||'').split(',').map(t=> t.trim()).filter(Boolean);
    return [...new Set(parts)].map((name, idx)=>({ name, color: this.state.tags.colorFor(name, fallbackColor, idx) }));
  }
  showView(id){
    document.querySelectorAll('.view').forEach(v=>{
      const active = v.id===id;
      v.toggleAttribute('hidden', !active);
      v.classList.toggle('view--active', active);
    })
  }
  renderSkeleton(n){
    this.elements.skeleton.replaceChildren(...Array.from({length:n}).map(()=>{
      const div = document.createElement('div');
      div.className='skeleton-item';
      return div;
    }))
  }
  renderList(){
    const all = this.state.tasks.getAll();
    const filtered = this.state.filters.apply(all, {
      status: this.elements.filterStatus.value,
      priority: this.elements.filterPriority.value,
      date: this.elements.filterDate.value,
    });
    const q = this.elements.search.value.trim();
    const searched = this.state.search.apply(filtered, q);

    this.elements.list.replaceChildren(...searched.map(t=> this.renderItem(t, q)));

    // attach drag & drop after DOM items exist
    import('./dragdrop.js').then(({ DragDrop })=>{
      DragDrop.bindList(this.elements.list, this.state.tasks, ()=> this.renderList());
    })
  }
  markText(text, q){
    if(!q) return text;
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    return text.replace(re, '<mark>$1</mark>');
  }
  renderItem(task, q){
    const li = document.createElement('li');
    li.className = 'task';
    li.setAttribute('draggable','true');
    li.dataset.id = task.id;
    li.tabIndex = 0;

    const overdue = task.due && new Date(task.due) < new Date() && task.status!== 'done';

    li.innerHTML = html`
      <div class="task__status">
        <input class="checkbox" type="checkbox" ${task.status==='done'?'checked':''} aria-label="????? ??????" />
      </div>
      <div class="task__content">
        <h3 class="task__title">${this.markText(task.title, q)}</h3>
        <div class="task__meta">
          <span class="badge ${task.priority==='high'?'badge--danger': task.priority==='low'?'badge--ok':'badge--warn'}">??????: ${task.priority}</span>
          ${task.due? `<span class="badge ${overdue?'badge--danger':''}">?????: ${task.due}</span>`: ''}
          ${task.tags.map(t=> `<span class="badge tag" style="--tag:${t.color}; background: color-mix(in oklab, var(--tag-bg), ${t.color} 18%)">#${t.name}</span>`).join('')}
        </div>
      </div>
      <div class="task__actions">
        <button class="action action--edit" aria-label="?????">??</button>
        <button class="action action--danger action--delete" aria-label="???">???</button>
      </div>
    `;

    // bind item actions
    li.querySelector('.checkbox').addEventListener('change', (e)=>{
      this.state.tasks.update(task.id, { status: e.target.checked? 'done':'todo' });
      this.renderList();
    });
    li.querySelector('.action--delete').addEventListener('click', ()=>{
      this.state.tasks.remove(task.id); this.toast('?? ??? ??????'); this.renderList();
    });
    li.querySelector('.action--edit').addEventListener('click', ()=>{
      this.editTaskDialog(task);
    });

    return li;
  }
  editTaskDialog(task){
    const title = prompt('????? ??????', task.title);
    if(title===null) return;
    const description = prompt('?????', task.description || '') ?? '';
    const due = prompt('????? ????????? (YYYY-MM-DD)', task.due || '') || null;
    const priority = prompt('???????? (low|medium|high)', task.priority) || task.priority;
    this.state.tasks.update(task.id, { title: title.trim()||task.title, description, due, priority });
    this.renderList();
    this.toast('?? ????? ??????');
  }
  toast(message){
    const div = document.createElement('div');
    div.className = 'toast';
    div.role = 'status';
    div.textContent = message;
    this.elements.toast.appendChild(div);
    setTimeout(()=> div.remove(), 2500);
  }
}
