export class Notifier{
  constructor(){
    this.interval = null;
  }
  initPermission(){
    if('Notification' in window && Notification.permission==='default'){
      Notification.requestPermission().catch(()=>{});
    }
  }
  startDueCheck(getTasks){
    const check = ()=>{
      const now = new Date();
      const dueSoon = getTasks().filter(t=> t.status!=='done' && t.due && new Date(t.due) <= new Date(now.getTime()+60*60*1000));
      if(dueSoon.length){
        this.notify(`???? ${dueSoon.length} ???? ?????? ??????`);
      }
    }
    this.stop();
    check();
    this.interval = setInterval(check, 60*1000);
  }
  stop(){ if(this.interval) clearInterval(this.interval); }
  notify(message){
    if('Notification' in window && Notification.permission==='granted'){
      new Notification(message);
    }else{
      const div = document.createElement('div');
      div.className='toast'; div.textContent=message; div.role='status';
      document.getElementById('toastContainer').appendChild(div);
      setTimeout(()=> div.remove(), 3000);
    }
  }
}
