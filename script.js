(function(){
  // ---------- Icons ----------
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_CLOCK = '<svg viewBox="0 0 24 24" width="12" height="12"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const ICON_EDIT = '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- State ----------
  let tasks = []; // { id, title, date, time, completed, createdAt }
  let filter = 'all'; // all | active | completed
  let editingId = null;
  let idCounter = 1;

  // ---------- Elements ----------
  const addForm = document.getElementById('addForm');
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const clearDoneBtn = document.getElementById('clearDoneBtn');
  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');
  const statDone = document.getElementById('statDone');
  const ringFill = document.getElementById('ringFill');
  const ringPercent = document.getElementById('ringPercent');
  const toast = document.getElementById('toast');

  const modalOverlay = document.getElementById('modalOverlay');
  const editTaskInput = document.getElementById('editTaskInput');
  const editDateInput = document.getElementById('editDateInput');
  const editTimeInput = document.getElementById('editTimeInput');
  const editCancelBtn = document.getElementById('editCancelBtn');
  const editSaveBtn = document.getElementById('editSaveBtn');

  // ---------- Helpers ----------
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function dueTimestamp(task){
    if(!task.date) return null;
    return new Date(task.date + 'T' + (task.time || '23:59')).getTime();
  }

  function isOverdue(task){
    if(task.completed) return false;
    const due = dueTimestamp(task);
    if(due === null) return false;
    return due < Date.now();
  }

  function formatDue(task){
    if(!task.date) return null;
    const d = new Date(task.date + 'T' + (task.time || '00:00'));
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if(task.time){
      const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      return dateStr + ' · ' + timeStr;
    }
    return dateStr;
  }

  function sortedTasks(list){
    return [...list].sort((a, b) => {
      if(a.completed !== b.completed) return a.completed ? 1 : -1;
      const da = dueTimestamp(a);
      const db = dueTimestamp(b);
      if(da === null && db === null) return a.createdAt - b.createdAt;
      if(da === null) return 1;
      if(db === null) return -1;
      return da - db;
    });
  }

  // ---------- Rendering ----------
  function render(){
    let visible = tasks;
    if(filter === 'active') visible = tasks.filter(t => !t.completed);
    if(filter === 'completed') visible = tasks.filter(t => t.completed);
    visible = sortedTasks(visible);

    taskList.innerHTML = '';

    if(visible.length === 0){
      const msg = tasks.length === 0
        ? 'Nothing here yet — add your first task above.'
        : (filter === 'completed' ? 'No completed tasks yet.' : 'No active tasks — nice work.');
      const empty = emptyState.cloneNode(true);
      empty.removeAttribute('id');
      empty.querySelector('p').textContent = msg;
      taskList.appendChild(empty);
    } else {
      visible.forEach(task => taskList.appendChild(renderTaskItem(task)));
    }

    updateStats();
  }

  function renderTaskItem(task){
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const overdue = isOverdue(task);
    const due = formatDue(task);

    li.innerHTML = `
      <button class="task-check" aria-label="Toggle complete">${ICON_CHECK}</button>
      <div class="task-body">
        <div class="task-title"></div>
        ${due ? `<div class="task-meta${overdue ? ' overdue' : ''}">${ICON_CLOCK}<span>${overdue ? 'Overdue · ' : ''}${due}</span></div>` : ''}
      </div>
      <div class="task-actions">
        <button class="icon-btn edit-btn" aria-label="Edit task">${ICON_EDIT}</button>
        <button class="icon-btn delete-btn" aria-label="Delete task">${ICON_TRASH}</button>
      </div>
    `;

    li.querySelector('.task-title').textContent = task.title;

    li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    return li;
  }

  function updateStats(){
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const active = total - done;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    statTotal.textContent = total;
    statActive.textContent = active;
    statDone.textContent = done;
    ringPercent.textContent = pct + '%';

    const circumference = 100.5;
    ringFill.style.strokeDashoffset = (circumference - (circumference * pct / 100)).toFixed(2);
  }

  // ---------- Actions ----------
  function addTask(title, date, time){
    tasks.push({
      id: idCounter++,
      title: title.trim(),
      date: date || null,
      time: time || null,
      completed: false,
      createdAt: Date.now()
    });
    render();
    showToast('Task added');
  }

  function toggleTask(id){
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    task.completed = !task.completed;
    render();
  }

  function deleteTask(id){
    tasks = tasks.filter(t => t.id !== id);
    render();
    showToast('Task deleted');
  }

  function clearCompleted(){
    const hadCompleted = tasks.some(t => t.completed);
    if(!hadCompleted) return;
    tasks = tasks.filter(t => !t.completed);
    render();
    showToast('Completed tasks cleared');
  }

  // ---------- Edit modal ----------
  function openEditModal(id){
    const task = tasks.find(t => t.id === id);
    if(!task) return;
    editingId = id;
    editTaskInput.value = task.title;
    editDateInput.value = task.date || '';
    editTimeInput.value = task.time || '';
    modalOverlay.classList.add('show');
    setTimeout(() => editTaskInput.focus(), 50);
  }

  function closeEditModal(){
    modalOverlay.classList.remove('show');
    editingId = null;
  }

  function saveEdit(){
    const task = tasks.find(t => t.id === editingId);
    if(!task) return;
    const newTitle = editTaskInput.value.trim();
    if(!newTitle){
      showToast('Task title cannot be empty');
      return;
    }
    task.title = newTitle;
    task.date = editDateInput.value || null;
    task.time = editTimeInput.value || null;
    closeEditModal();
    render();
    showToast('Task updated');
  }

  // ---------- Filters ----------
  function setFilter(newFilter){
    filter = newFilter;
    filterBtns.forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    render();
  }

  // ---------- Wire up ----------
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value;
    if(!title.trim()) return;
    addTask(title, dateInput.value, timeInput.value);
    taskInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
    taskInput.focus();
  });

  filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  clearDoneBtn.addEventListener('click', clearCompleted);

  editCancelBtn.addEventListener('click', closeEditModal);
  editSaveBtn.addEventListener('click', saveEdit);
  modalOverlay.addEventListener('click', (e) => {
    if(e.target === modalOverlay) closeEditModal();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modalOverlay.classList.contains('show')) closeEditModal();
  });

  // refresh overdue highlighting once a minute
  setInterval(render, 60000);

  render();
})();
                            
