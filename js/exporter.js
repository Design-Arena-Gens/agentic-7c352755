function download(filename, text, type){
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 0);
}

export const Exporter = {
  downloadJSON(tasks){
    download('tasks.json', JSON.stringify(tasks, null, 2), 'application/json');
  },
  downloadCSV(tasks){
    const esc = (v)=> '"'+String(v??'').replaceAll('"','""')+'"';
    const header = ['id','title','description','priority','status','due','tags','createdAt','updatedAt','order'];
    const rows = tasks.map(t=> [t.id,t.title,t.description,t.priority,t.status,t.due,(t.tags||[]).map(x=>x.name).join('|'),t.createdAt,t.updatedAt,t.order].map(esc).join(','));
    download('tasks.csv', [header.join(','), ...rows].join('\n'), 'text/csv');
  }
}
