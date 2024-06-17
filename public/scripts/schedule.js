document.addEventListener('DOMContentLoaded', () => {
    // Get the elements from the DOM
    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById("taskModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalSpan = document.getElementsByClassName("close")[0];
    const createTaskForm = document.getElementById('createTaskForm');

    // GET all tasks from the api
    const fetchTasks = async () => {
        try {
            const response = await fetch('/tasks');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    };

    // Async function to update a test and send it to the api
    const updateTask = async (taskId, updatedTask) => {
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            console.log('Task updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

    // Async function to delete a test and send it to the api
    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            console.log('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    // Async function to create a test and send it to the api
    const createTask = async (newTask) => {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (response.status === 404) {
                alert("Hive not found.");
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            // Hide the modal upon successful creation, then refresh the calendar in background
            modal.style.display = "none";
            calendar.refetchEvents();
            console.log('Task created successfully');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task');
        }
    };

    // Create a calendar object, settings have been pre populated. Can be changed. Out of scope to customize
    const calendar = new FullCalendar.Calendar(calendarEl, {
        eventColor: "#b9ab17",
        buttonText: {
            today: new Date().toLocaleString('default', { month: 'short' }),
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List'
        },
        headerToolbar: {
            start: 'title',
            center: '',
            end: 'prev,today,next'
        },
        timeZone: 'AEST',
        initialView: 'dayGridMonth',
        editable: true,
        selectable: false,
        events: async (fetchInfo, successCallback, failureCallback) => {
            try {
                const tasks = await fetchTasks();

                const events = tasks.map(task => ({
                    id: task.task_id,
                    title: task.task_description,
                    start: task.due_date,
                    extendedProps: {
                        hive_id: task.hive_id,
                        completed: task.completed
                    }
                }));

                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
        eventChange: async (eventChangeInfo) => {
            const updatedEvent = eventChangeInfo.event;
            const updatedTask = {
                task_description: updatedEvent.title,
                due_date: updatedEvent.start.toISOString(),
                hive_id: updatedEvent.extendedProps.hive_id,
                completed: updatedEvent.extendedProps.completed
            };

            await updateTask(updatedEvent.id, updatedTask);
        },
        dateClick: (info) => {
            modal.style.display = "block";
            document.getElementById('due_date').value = new Date(info.dateStr).toISOString().slice(0, 16);
        },
        eventClick: async (info) => {
            if (confirm(`Do you want to delete the task "${info.event.title}"?`)) {
                await deleteTask(info.event.id);
                info.event.remove();
            }
        }
    });

    // Render calendar upon load
    calendar.render();

    // Register event listeners for the control buttons
    openModalBtn.addEventListener('click', () => {
        modal.style.display = "block";
    });

    closeModalSpan.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    createTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const newTask = {
            hive_id: formData.get('hive_id'),
            task_description: formData.get('task_description'),
            due_date: new Date(formData.get('due_date')).toISOString()
        };

        await createTask(newTask);
    });
});
