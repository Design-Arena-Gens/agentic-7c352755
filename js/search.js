export class Search{
  apply(tasks, q){
    if(!q) return tasks;
    const s = q.toLowerCase();
    return tasks.filter(t=> (t.title+t.description).toLowerCase().includes(s) || t.tags?.some(tag=> tag.name.toLowerCase().includes(s)));
  }
}
