// 1. Buscamos los elementos del HTML que necesitamos usar
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counter = document.getElementById('counter');
const clearDoneBtn = document.getElementById('clearDoneBtn');

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

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('span');
    editBtn.textContent = '✎';
    editBtn.className = 'edit-btn';

    const deleteBtn = document.createElement('span');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';

    span.addEventListener('click', function () {
      const t = tasks.find(function (t) { return t.id === task.id; });
      t.done = !t.done;
      saveTasks();
      render();
    });

    editBtn.addEventListener('click', function () {
      // Reemplazamos el <span> por un <input> editable con el texto actual
      const input = document.createElement('input');
      input.type = 'text';
      input.value = task.text;
      input.className = 'edit-input';

      li.replaceChild(input, span);
      input.focus();
      input.select();

      function saveEdit() {
        const newText = input.value.trim();
        if (newText !== '') {
          const t = tasks.find(function (t) { return t.id === task.id; });
          t.text = newText;
          saveTasks();
        }
        render();
      }

      function cancelEdit() {
        // Quitamos el listener de "blur" antes de redibujar: si no, al sacar
        // el input del DOM se dispararía blur y guardaría igual el cambio
        input.removeEventListener('blur', saveEdit);
        render();
      }

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          saveEdit();
        }
        if (event.key === 'Escape') {
          cancelEdit();
        }
      });

      input.addEventListener('blur', saveEdit);
    });

    deleteBtn.addEventListener('click', function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);
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

clearDoneBtn.addEventListener('click', function () {
  tasks = tasks.filter(function (t) { return !t.done; });
  saveTasks();
  render();
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
