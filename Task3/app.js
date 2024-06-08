document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const taskInput = document.getElementById('new-task');
    const taskPriority = document.getElementById('task-priority');
    const taskList = document.getElementById('task-list');

    form.addEventListener('submit', addTask);

    function addTask(e) {
        e.preventDefault(); // Prevent default form submission

        const taskText = taskInput.value.trim(); // Trim whitespace from the input
        const priority = taskPriority.value;

        if (!taskText) {
            alert('Please enter a task.'); // Provide feedback to the user
            return; // Exit the function if the input is empty
        }

        const task = { text: taskText, priority: priority, status: 'pending' };
        saveTask(task);
        taskInput.value = ''; // Clear the input field
        loadTasks(); // Reload tasks to ensure correct order
    }

    function addTaskToDOM(task) {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.classList.add(task.status);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.status === 'completed';
        checkbox.addEventListener('change', toggleStatus);

        const taskSpan = document.createElement('span');
        taskSpan.textContent = task.text;
        taskSpan.classList.add('task-text');

        const prioritySpan = document.createElement('span');
        prioritySpan.className = `priority ${task.priority}`;
        prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(prioritySpan);
        li.appendChild(createButton('Edit', 'edit', editTask));
        li.appendChild(createButton('Delete', 'delete', deleteTask));

        return li;
    }

    function createButton(text, className, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.onclick = onClick;
        button.setAttribute('aria-label', text);
        return button;
    }

    function saveTask(task) {
        const tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTask(e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            const li = e.target.parentElement;
            taskList.removeChild(li);
            removeTaskFromStorage(li.querySelector('.task-text').textContent);
        }
    }

    function removeTaskFromStorage(taskText) {
        const tasks = getTasks();
        const updatedTasks = tasks.filter(task => task.text !== taskText);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }

    function editTask(e) {
        e.stopPropagation();
        const li = e.target.parentElement;
        const currentText = li.querySelector('.task-text').textContent;
        const newText = prompt('Edit task:', currentText);
        if (newText && newText.trim()) {
            li.querySelector('.task-text').textContent = newText.trim();
            updateTaskInStorage(currentText, newText.trim());
        }
    }

    function updateTaskInStorage(oldText, newText) {
        const tasks = getTasks();
        const task = tasks.find(task => task.text === oldText);
        task.text = newText;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function toggleStatus(e) {
        e.stopPropagation();
        const li = e.target.parentElement;
        const isCompleted = e.target.checked;
        li.classList.toggle('completed', isCompleted);
        li.classList.toggle('pending', !isCompleted);
        updateTaskStatusInStorage(li.querySelector('.task-text').textContent, isCompleted ? 'completed' : 'pending');
    }

    function updateTaskStatusInStorage(taskText, status) {
        const tasks = getTasks();
        const task = tasks.find(task => task.text === taskText);
        task.status = status;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        taskList.innerHTML = ''; // Clear the task list before loading
        const tasks = getTasks();
        tasks.sort(comparePriority); // Sort tasks by priority
        tasks.forEach(task => {
            if (task.text && task.priority) {
                addTaskToDOM(task);
            }
        });
    }

    function comparePriority(a, b) {
        const priorities = { high: 1, medium: 2, low: 3 };
        return priorities[a.priority] - priorities[b.priority];
    }

    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    loadTasks(); // Load tasks when the page loads
});
