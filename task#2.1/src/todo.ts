export class Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;

    constructor(id: number, title: string, description: string = '') {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = false;
    }

    markCompleted(): void {
        this.completed = true;
    }
}

export class TodoList {
    private tasks: Task[] = [];
    private nextId: number = 1;

    addTask(title: string, description: string = ''): Task {
        const task = new Task(this.nextId++, title, description);
        this.tasks.push(task);
        return task;
    }



    private findTaskById(id: number): Task | undefined {
        return this.tasks.find(task => task.id === id);
    }

    getAllTasks(): Task[] {
        return [...this.tasks]; // копия массива
    }

    getTaskById(id: number): Task | undefined {
        return this.findTaskById(id);
    }

    editTask(id: number, newTitle: string, newDescription?: string): boolean {
        const task = this.findTaskById(id);
        if (!task) return false;

        task.title = newTitle;
        if (newDescription !== undefined) {
            task.description = newDescription;
        }
        return true;
    }

    deleteTask(id: number): boolean {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return false;

        this.tasks.splice(index, 1);
        return true;
    }

    markTaskAsCompleted(id: number): boolean {
        const task = this.findTaskById(id);
        if (!task) return false;

        task.markCompleted();
        return true;
    }

    getTaskCount(): number {
        return this.tasks.length;
    }

    getCompletedTasks(): Task[] {
        return this.tasks.filter(task => task.completed);
    }

    getActiveTasks(): Task[] {
        return this.tasks.filter(task => !task.completed);
    }
}