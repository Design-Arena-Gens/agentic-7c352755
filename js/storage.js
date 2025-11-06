export const Storage = {
  key: 'tasks-v1',
  save(tasks){
    localStorage.setItem(this.key, JSON.stringify(tasks));
  },
  load(){
    try{
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    }catch{ return []; }
  }
}
