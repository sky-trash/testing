import { describe, beforeEach, test, expect } from '@jest/globals';
import { TodoList, Task } from '../src/todo';

describe("TodoList Application Tests", () => {
  let todoList: TodoList;

  beforeEach(() => {
    todoList = new TodoList();
  });

  test("Тест 1: Создание задачи", () => {
    const task = todoList.addTask("Купить продукты", "Молоко, хлеб, яйца");

    expect(todoList.getTaskCount()).toBe(1);
    expect(task.id).toBe(1);
    expect(task.title).toBe("Купить продукты");
    expect(task.description).toBe("Молоко, хлеб, яйца");
    expect(task.completed).toBe(false);

    const allTasks = todoList.getAllTasks();
    expect(allTasks).toContainEqual(task);
  });

  test("Тест 2: Редактирование задачи", () => {
    const task = todoList.addTask("Старая задача", "Старое описание");

    const editResult = todoList.editTask(
      task.id,
      "Новая задача",
      "Новое описание",
    );

    expect(editResult).toBe(true);
    const updatedTask = todoList.getTaskById(task.id);
    expect(updatedTask?.title).toBe("Новая задача");
    expect(updatedTask?.description).toBe("Новое описание");
  });

  test("Тест 3: Удаление задачи", () => {
    todoList.addTask("Задача 1");
    todoList.addTask("Задача 2");
    const taskToDelete = todoList.addTask("Задача 3");

    expect(todoList.getTaskCount()).toBe(3);

    const deleteResult = todoList.deleteTask(taskToDelete.id);

    expect(deleteResult).toBe(true);
    expect(todoList.getTaskCount()).toBe(2);
    expect(todoList.getTaskById(taskToDelete.id)).toBeUndefined();
  });

  test("Тест 4: Отметка задачи как выполненной", () => {
    const task = todoList.addTask("Сделать домашнее задание");

    const markResult = todoList.markTaskAsCompleted(task.id);

    expect(markResult).toBe(true);
    expect(task.completed).toBe(true);

    const completedTasks = todoList.getCompletedTasks();
    const activeTasks = todoList.getActiveTasks();

    expect(completedTasks).toContainEqual(task);
    expect(activeTasks).not.toContainEqual(task);
  });

  test("Тест 5: Получение отфильтрованных списков задач", () => {
    const task1 = todoList.addTask("Задача 1");
    const task2 = todoList.addTask("Задача 2");
    const task3 = todoList.addTask("Задача 3");

    todoList.markTaskAsCompleted(task2.id);

    const allTasks = todoList.getAllTasks();
    const completedTasks = todoList.getCompletedTasks();
    const activeTasks = todoList.getActiveTasks();

    expect(allTasks.length).toBe(3);
    expect(completedTasks.length).toBe(1);
    expect(activeTasks.length).toBe(2);

    expect(completedTasks[0].id).toBe(task2.id);
    expect(activeTasks.map((t) => t.id)).toEqual([task1.id, task3.id]);
  });

  test("Тест 6: Негативные сценарии", () => {
    todoList.addTask("Реальная задача");
    const nonExistentId = 999;

    expect(todoList.editTask(nonExistentId, "Новый заголовок")).toBe(false);
    expect(todoList.deleteTask(nonExistentId)).toBe(false);
    expect(todoList.markTaskAsCompleted(nonExistentId)).toBe(false);
    expect(todoList.getTaskById(nonExistentId)).toBeUndefined();

    expect(todoList.getTaskCount()).toBe(1);

    const task = todoList.getTaskById(1);
    expect(task?.title).toBe("Реальная задача");
  });

  test("Тест 7: Автоматическое присвоение ID", () => {
    const task1 = todoList.addTask("Задача 1");
    const task2 = todoList.addTask("Задача 2");
    const task3 = todoList.addTask("Задача 3");

    expect(task1.id).toBe(1);
    expect(task2.id).toBe(2);
    expect(task3.id).toBe(3);
    expect(todoList.getTaskCount()).toBe(3);
  });
});
