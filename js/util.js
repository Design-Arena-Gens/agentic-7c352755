export function uid(){
  return Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}
export function html(parts, ...vals){
  let out='';
  parts.forEach((p,i)=>{ out += p + (vals[i]??''); });
  return out;
}
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
