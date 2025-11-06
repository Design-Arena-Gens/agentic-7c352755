export class Filters{
  apply(tasks, { status='all', priority='all', date='all' }){
    let out = tasks;
    if(status!=='all') out = out.filter(t=> status==='done'? t.status==='done': t.status!=='done');
    if(priority!=='all') out = out.filter(t=> t.priority===priority);
    if(date!=='all'){
      const now = new Date();
      out = out.filter(t=>{
        if(!t.due) return false;
        const d = new Date(t.due);
        if(date==='today') return d.toDateString() === now.toDateString();
        if(date==='week'){
          const diff = (d - now) / (1000*60*60*24);
          return diff <= 7 && diff >= -1;
        }
        if(date==='overdue') return d < now && t.status!=='done';
        return true;
      })
    }
    return out;
  }
}
