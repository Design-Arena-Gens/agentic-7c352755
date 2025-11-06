export class Tags{
  constructor(){
    this.palette = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#10b981'];
  }
  colorFor(name, fallback, idx){
    const hash = Array.from(name).reduce((a,c)=> a + c.charCodeAt(0), 0);
    return this.palette[hash % this.palette.length] || fallback || this.palette[idx % this.palette.length];
  }
}
