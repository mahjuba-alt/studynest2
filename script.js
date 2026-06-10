console.log("script connected");
/* ============================================================
   StudyNest – JavaScript
   Features: Add Goal, To-Do List with delete, localStorage persistence
   ============================================================ */

'use strict';

// ── Element references ────────────────────────────────────────

const goalInput   = document.getElementById('goal-input');
const taskInput   = document.getElementById('task-input');
const taskList    = document.getElementById('task-list');

// Buttons are identified by their section context — no IDs in HTML,
// so we select them relative to their labelled sections.
const focusSection = document.querySelector('#focus-heading')?.closest('section');
const todoSection  = document.querySelector('#todo-heading')?.closest('section');

const addGoalBtn = focusSection.querySelector('button[type="button"]');
const addTaskBtn = todoSection.querySelector('button[type="button"]');

// Goal display: a <p> injected once beneath the goal input
let goalDisplay = null;

// ── localStorage keys ─────────────────────────────────────────

const STORAGE_KEY_GOAL  = 'studynest_goal';
const STORAGE_KEY_TASKS = 'studynest_tasks';

// ── Goal feature ──────────────────────────────────────────────

/**
 * Renders the saved goal beneath the input.
 * Creates or reuses a single <p> element — never duplicates.
 */
function renderGoal(text) {
  if (!goalDisplay) {
    goalDisplay = document.createElement('p');
    goalDisplay.setAttribute('aria-live', 'polite');
    // Insert after the button inside the article
    addGoalBtn.insertAdjacentElement('afterend', goalDisplay);
  }
  goalDisplay.textContent = text ? `🎯 ${text}` : '';
}

/**
 * Handles "Add Goal" click: validates, saves, renders, clears input.
 */
function handleAddGoal() {
  const text = goalInput.value.trim();
  if (!text) {
    shakeInput(goalInput);
    return;
  }
  localStorage.setItem(STORAGE_KEY_GOAL, text);
  renderGoal(text);
  goalInput.value = '';
  goalInput.focus();
}

// ── Task feature ──────────────────────────────────────────────

/**
 * Reads the tasks array from localStorage.
 * @returns {string[]}
 */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || [];
  } catch {
    return [];
  }
}

/**
 * Persists the tasks array to localStorage.
 * @param {string[]} tasks
 */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}

/**
 * Creates a single <li> for a task and appends it to the list.
 * @param {string} text  - The task text
 * @param {number} index - Its index in the tasks array (used for deletion)
 */
function createTaskItem(text, index) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.type        = 'button';
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('aria-label', `Delete task: ${text}`);
  deleteBtn.dataset.index = index;

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

/**
 * Clears the DOM list and re-renders every task from the array.
 * Keeps indices in sync after a deletion.
 * @param {string[]} tasks
 */
function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach((text, index) => createTaskItem(text, index));
}

/**
 * Handles "Add Task" click: validates, saves, renders, clears input.
 */
function handleAddTask() {
  const text = taskInput.value.trim();
  if (!text) {
    shakeInput(taskInput);
    return;
  }
  const tasks = loadTasks();
  tasks.push(text);
  saveTasks(tasks);
  renderTasks(tasks);
  taskInput.value = '';
  taskInput.focus();
}

/**
 * Handles click events on the task list via delegation.
 * Only acts when a delete button is clicked.
 * @param {MouseEvent} e
 */
function handleTaskListClick(e) {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;

  const index = parseInt(btn.dataset.index, 10);
  const tasks = loadTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks(tasks);
}

// ── Input validation feedback ─────────────────────────────────

/**
 * Briefly shakes an input to signal it's empty.
 * Uses a CSS class added/removed via JS — no inline styles.
 * @param {HTMLInputElement} input
 */
function shakeInput(input) {
  input.classList.add('input--error');
  input.addEventListener('animationend', () => {
    input.classList.remove('input--error');
  }, { once: true });
  input.focus();
}

// ── Enter-key support ─────────────────────────────────────────

goalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddGoal();
});

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTask();
});

// ── Event listeners ───────────────────────────────────────────

addGoalBtn.addEventListener('click', handleAddGoal);
addTaskBtn.addEventListener('click', handleAddTask);
taskList.addEventListener('click', handleTaskListClick);

// ── Initialise on page load ───────────────────────────────────

(function init() {
  // Restore saved goal
  const savedGoal = localStorage.getItem(STORAGE_KEY_GOAL);
  if (savedGoal) renderGoal(savedGoal);

  // Restore saved tasks
  const savedTasks = loadTasks();
  if (savedTasks.length) renderTasks(savedTasks);
})();
