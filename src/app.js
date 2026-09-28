const STORAGE_KEY = 'f001-tareas';
let tasks = [];
let filter = 'all';
let storageAvailable = true;

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const message = document.querySelector('#form-message');
const recurringInput = document.querySelector('#task-recurrent');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');
const warning = document.querySelector('#storage-warning');

function readTasks() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    tasks = Array.isArray(parsed) ? parsed.map(normalizeTask) : [];
  } catch { storageAvailable = false; warning.hidden = false; tasks = []; }
}

function normalizeTask(task) {
  if (!task || typeof task !== 'object') return task;
  if (task.recurrence === 'daily') return { ...task, completedOn: typeof task.completedOn === 'string' ? task.completedOn : null };
  const { recurrence, completedOn, ...nonRecurring } = task;
  return nonRecurring;
}

function todayKey() {
  const now = globalThis.__F002_TEST_NOW__ ? new Date(globalThis.__F002_TEST_NOW__) : new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function effectiveTask(task) {
  return task.recurrence === 'daily' ? { ...task, effectiveCompleted: task.completedOn === todayKey() } : { ...task, effectiveCompleted: Boolean(task.completed) };
}

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  catch { storageAvailable = false; warning.hidden = false; }
}

function validateTitle(value) {
  const title = value.trim();
  if (!title) return 'Escribe un título para la tarea.';
  if (title.length > 120) return 'El título no puede superar los 120 caracteres.';
  return '';
}

function visibleTasks() {
  return tasks.map(effectiveTask).filter(task => filter === 'all' || (filter === 'completed' ? task.effectiveCompleted : !task.effectiveCompleted));
}

function render() {
  const visible = visibleTasks();
  list.replaceChildren();
  count.textContent = `${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'}`;
  emptyState.hidden = visible.length !== 0;
  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = `task${task.effectiveCompleted ? ' completed' : ''}`;
    item.dataset.id = task.id;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = task.effectiveCompleted;
    checkbox.setAttribute('aria-label', `${task.effectiveCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}: ${task.title}`);
    checkbox.addEventListener('change', () => updateTask(task.id, { completed: checkbox.checked }));
    const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
    if (task.recurrence === 'daily') { const recurring = document.createElement('span'); recurring.className = 'recurring-label'; recurring.textContent = 'Recurrente diariamente'; title.append(' ', recurring); }
    const actions = document.createElement('div'); actions.className = 'task-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Editar'; edit.addEventListener('click', () => startEdit(item, task));
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Eliminar'; remove.className = 'danger'; remove.addEventListener('click', () => { tasks = tasks.filter(candidate => candidate.id !== task.id); saveTasks(); render(); });
    actions.append(edit, remove); item.append(checkbox, title, actions); list.append(item);
  });
}

function updateTask(id, changes) {
  tasks = tasks.map(task => task.id === id && task.recurrence === 'daily' && Object.hasOwn(changes, 'completed')
    ? { ...task, completedOn: changes.completed ? todayKey() : null }
    : task.id === id ? { ...task, ...changes } : task);
  saveTasks(); render();
}

function startEdit(item, task) {
  const editForm = document.createElement('form'); editForm.className = 'task-edit';
  const editInput = document.createElement('input'); editInput.type = 'text'; editInput.value = task.title; editInput.setAttribute('aria-label', 'Editar título');
  const recurringLabel = document.createElement('label'); recurringLabel.className = 'checkbox-label';
  const recurring = document.createElement('input'); recurring.type = 'checkbox'; recurring.checked = task.recurrence === 'daily'; recurring.setAttribute('aria-label', 'Recurrente diariamente');
  recurringLabel.append(recurring, ' Recurrente diariamente');
  const save = document.createElement('button'); save.type = 'submit'; save.textContent = 'Guardar';
  editForm.append(editInput, recurringLabel, save); item.replaceChildren(editForm); editInput.focus();
  editForm.addEventListener('submit', event => {
    event.preventDefault(); const error = validateTitle(editInput.value);
    if (error) { editInput.setCustomValidity(error); editInput.reportValidity(); return; }
    const changes = { title: editInput.value.trim() };
    if (recurring.checked && task.recurrence !== 'daily') Object.assign(changes, { recurrence: 'daily', completedOn: null, completed: false });
    else if (!recurring.checked && task.recurrence === 'daily') {
      tasks = tasks.map(candidate => {
        if (candidate.id !== task.id) return candidate;
        const { recurrence, completedOn, ...nonRecurring } = candidate;
        return { ...nonRecurring, ...changes, completed: false };
      });
      saveTasks(); render(); return;
    }
    updateTask(task.id, changes);
  });
}

form.addEventListener('submit', event => { event.preventDefault(); const error = validateTitle(input.value); message.textContent = error; if (error) { input.setAttribute('aria-invalid', 'true'); return; } input.removeAttribute('aria-invalid'); const task = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title: input.value.trim(), completed: false }; if (recurringInput.checked) Object.assign(task, { recurrence: 'daily', completedOn: null }); tasks.push(task); saveTasks(); input.value = ''; recurringInput.checked = false; message.textContent = ''; render(); input.focus(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); }); render(); }));

readTasks(); render();
