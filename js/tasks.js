import { uid } from './util.js';

export class TaskModel{
  constructor(Storage){
    this.Storage = Storage;
    this.tasks = Storage.load();
    this.ensureOrder();
  }
  ensureOrder(){
    this.tasks.forEach((t,i)=>{ if(typeof t.order !== 'number') t.order = i; });
    this.persist();
  }
  persist(){ this.Storage.save(this.tasks); }
  getAll(){ return [...this.tasks].sort((a,b)=> (a.order??0)-(b.order??0)); }
  add({ title, description='', priority='medium', due=null, tags=[] }){
    const now = new Date().toISOString();
    const task = { id: uid(), title, description, priority, due, status:'todo', tags, createdAt: now, updatedAt: now, order: this.tasks.length };
    this.tasks.push(task); this.persist(); return task;
  }
  update(id, patch){
    const idx = this.tasks.findIndex(t=> t.id===id);
    if(idx===-1) return;
    this.tasks[idx] = { ...this.tasks[idx], ...patch, updatedAt: new Date().toISOString() };
    this.persist(); return this.tasks[idx];
  }
  remove(id){ this.tasks = this.tasks.filter(t=> t.id!==id); this.reindex(); this.persist(); }
  reorder(id, toIndex){
    const list = this.getAll();
    const fromIndex = list.findIndex(t=> t.id===id);
    if(fromIndex===-1) return;
    const [moved] = list.splice(fromIndex,1);
    list.splice(toIndex,0,moved);
    list.forEach((t,i)=> t.order = i);
    this.tasks = list; this.persist();
  }
  reindex(){ this.tasks.forEach((t,i)=> t.order=i); }
}
