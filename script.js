// 1. Buscamos los elementos del HTML que necesitamos usar
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counter = document.getElementById('counter');

const STORAGE_KEY = 'tasks';

// 2. "tasks" es nuestra fuente de verdad: un arreglo de objetos { id, text, done }
//    Cada tarea tiene un id único para poder encontrarla aunque la lista esté filtrada
let tasks = loadTasks();
let currentFilter = 'all'; // 'all' | 'pending' | 'done'

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// 3. Devuelve solo las tareas que corresponden al filtro activo
function getVisibleTasks() {
  if (currentFilter === 'pending') {
    return tasks.filter(function (task) { return !task.done; });
  }
  if (currentFilter === 'done') {
    return tasks.filter(function (task) { return task.done; });
  }
  return tasks;
}

function render() {
  taskList.innerHTML = '';

  getVisibleTasks().forEach(function (task) {
    const li = document.createElement('li');
    if (task.done) {
      li.classList.add('done');
    }

    const span = document.createElement('span');
    span.textContent = task.text;

    const deleteBtn = document.createElement('span');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';

    span.addEventListener('click', function () {
      const t = tasks.find(function (t) { return t.id === task.id; });
      t.done = !t.done;
      saveTasks();
      render();
    });

    deleteBtn.addEventListener('click', function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  const pendingCount = tasks.filter(function (task) { return !task.done; }).length;
  counter.textContent = pendingCount === 1
    ? '1 tarea pendiente'
    : pendingCount + ' tareas pendientes';
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    return; // no agregamos tareas vacías
  }

  tasks.push({ id: Date.now(), text: text, done: false });
  saveTasks();
  render();

  taskInput.value = '';
  taskInput.focus();
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

// 4. Al hacer clic en un botón de filtro, lo activamos y volvemos a dibujar la lista
filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    currentFilter = btn.dataset.filter;

    filterBtns.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');

    render();
  });
});

// 5. Dibujamos la lista apenas carga la página, por si había tareas guardadas
render();
