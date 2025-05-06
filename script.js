let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex = null;

document.getElementById('taskForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const dueTime = document.getElementById('dueTime').value;
  const category = document.getElementById('category').value;
  const repeat = category === 'Daily';


  if (!title) return;

  const task = {
    title, description, dueDate, dueTime,
    category, repeat,
    isDone: false
  };
  

  if (editIndex === null) {
    tasks.push(task);
  } else {
    tasks[editIndex] = task;
    editIndex = null;
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));
  this.reset();
  renderTasks();
});
function renderTasks() {
  const tbody = document.getElementById('taskTableBody');
  tbody.innerHTML = '';
  const now = new Date();

  // Step 1: Categorize with status & attach metadata
  const tasksWithMeta = tasks.map((task, index) => {
    const taskDateTime = task.dueDate && task.dueTime
      ? new Date(`${task.dueDate}T${task.dueTime}`)
      : null;

    let status = 'Default';
    let statusClass = 'status-default';
    let priority = 4;

    if (task.isDone) {
      status = 'Done';
      statusClass = 'status-done';
      priority = 5;
    } else if (taskDateTime) {
      const diffMin = (taskDateTime - now) / 60000;

      if (diffMin < 0) {
        status = 'Due';
        statusClass = 'status-due';
        priority = 1;
      } else if (diffMin <= 5) {
        status = "It's Time";
        statusClass = 'status-its-time';
        priority = 2;
      } else if (diffMin <= 30) {
        status = 'Coming Soon';
        statusClass = 'status-coming';
        priority = 3;
      }
    }

    return { ...task, index, status, statusClass, priority };
  });

  // Step 2: Group by dueDate
  const grouped = {};
  for (const t of tasksWithMeta) {
    const key = t.dueDate || 'No Date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  // Step 3: Sort date groups (latest date first)
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(b) - new Date(a);
  });

  // Step 4: Render each group
  for (const date of sortedDates) {
    const group = grouped[date];

    // Sort tasks by priority
    group.sort((a, b) => a.priority - b.priority);

    // Optional group header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <td colspan="7" class="table-secondary fw-bold text-center">
        ${date === 'No Date' ? 'Unscheduled Tasks' : `📅 ${date}`}
      </td>`;
    tbody.appendChild(headerRow);

    // Render each task in group
    group.forEach(task => {
      const row = document.createElement('tr');
      row.classList.add(task.statusClass);
      row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.description || ''}</td>
        <td>${task.dueDate || ''}</td>
        <td>${task.dueTime || ''}</td>
        <td>${task.category || ''}</td>
        <td>${task.status}</td>
        <td>
          ${!task.isDone ? `<button class="btn btn-success btn-sm me-2" onclick="markDone(${task.index})">Done</button>` : ''}
          <button class="btn btn-warning btn-sm me-2" onclick="editTask(${task.index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.index})">Delete</button>
        </td>`;
      tbody.appendChild(row);
    });
  }
}

  


function markDone(index) {
  tasks[index].isDone = true;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('dueDate').value = task.dueDate;
  document.getElementById('dueTime').value = task.dueTime;
  document.getElementById('category').value = task.category;
  editIndex = index;
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
}

window.onload = renderTasks;
