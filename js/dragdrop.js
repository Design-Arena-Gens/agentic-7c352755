export const DragDrop = {
  bindList(listEl, tasksModel, onChange){
    let dragEl = null;

    listEl.querySelectorAll('li.task').forEach((item)=>{
      item.addEventListener('dragstart', (e)=>{
        dragEl = item;
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', ()=>{
        item.classList.remove('dragging');
        dragEl = null;
      });
      item.addEventListener('dragover', (e)=>{
        e.preventDefault();
        const siblings = Array.from(listEl.querySelectorAll('li.task'));
        const overIndex = siblings.indexOf(item);
        const dragIndex = siblings.indexOf(dragEl);
        if(dragIndex===-1 || overIndex===-1) return;
        // show visual order during drag
        if(overIndex !== dragIndex){
          if(overIndex > dragIndex) item.after(dragEl); else item.before(dragEl);
        }
      });
      item.addEventListener('drop', ()=>{
        const siblings = Array.from(listEl.querySelectorAll('li.task'));
        const toIndex = siblings.indexOf(dragEl);
        if(toIndex>-1){
          tasksModel.reorder(dragEl.dataset.id, toIndex);
          onChange?.();
        }
      })
    })
  }
}
