import { describe, beforeEach, test, expect } from "@jest/globals";
import {
  ExpenseTracker,
  TransactionType,
  Category,
  Transaction,
} from "../src/expense";

describe("Expense Tracker Tests", () => {
  let tracker: ExpenseTracker;

  beforeEach(() => {
    tracker = new ExpenseTracker();
  });

  test("Тест 1: Добавление транзакции дохода", () => {
    const categories = tracker.getCategoriesByType(TransactionType.INCOME);
    const salaryCategory = categories.find((c) => c.name === "Зарплата");

    const transaction = tracker.addTransaction(
      50000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата за январь",
    );

    expect(transaction.id).toBe(1);
    expect(transaction.amount).toBe(50000);
    expect(transaction.type).toBe(TransactionType.INCOME);
    expect(transaction.categoryId).toBe(salaryCategory!.id);
    expect(transaction.description).toBe("Зарплата за январь");
    expect(transaction.date).toBeDefined();
    expect(transaction.isRecurring).toBe(false);

    expect(tracker.getAllTransactions().length).toBe(1);
    expect(tracker.getTotalIncome()).toBe(50000);
    expect(tracker.getTotalExpense()).toBe(0);
    expect(tracker.getBalance()).toBe(50000);
  });

  test("Тест 2: Добавление транзакции расхода", () => {
    const categories = tracker.getCategoriesByType(TransactionType.EXPENSE);
    const foodCategory = categories.find((c) => c.name === "Продукты");

    const transaction = tracker.addTransaction(
      1500,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Продукты на неделю",
    );

    expect(transaction.id).toBe(1);
    expect(transaction.amount).toBe(1500);
    expect(transaction.type).toBe(TransactionType.EXPENSE);
    expect(transaction.categoryId).toBe(foodCategory!.id);
    expect(transaction.description).toBe("Продукты на неделю");

    expect(tracker.getAllTransactions().length).toBe(1);
    expect(tracker.getTotalIncome()).toBe(0);
    expect(tracker.getTotalExpense()).toBe(1500);
    expect(tracker.getBalance()).toBe(-1500);
  });

  test("Тест 3: Добавление транзакции с ошибками валидации", () => {
    const categories = tracker.getCategoriesByType(TransactionType.INCOME);
    const salaryCategory = categories.find((c) => c.name === "Зарплата");

    expect(() => {
      tracker.addTransaction(
        -100,
        TransactionType.INCOME,
        salaryCategory!.id,
        "Отрицательная сумма",
      );
    }).toThrow("Сумма транзакции должна быть положительным числом");

    expect(() => {
      tracker.addTransaction(
        100,
        TransactionType.INCOME,
        999,
        "Несуществующая категория",
      );
    }).toThrow("Категория не найдена");

    const expenseCategory = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    )[0];

    expect(() => {
      tracker.addTransaction(
        100,
        TransactionType.INCOME,
        expenseCategory.id,
        "Доход в категории расходов",
      );
    }).toThrow(/не подходит для типа/);
  });

  test("Тест 4: Редактирование транзакции", () => {
    const incomeCategories = tracker.getCategoriesByType(
      TransactionType.INCOME,
    );
    const salaryCategory = incomeCategories.find((c) => c.name === "Зарплата");

    const transaction = tracker.addTransaction(
      50000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата за январь",
    );

    const expenseCategories = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    );
    const foodCategory = expenseCategories.find((c) => c.name === "Продукты");

    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 5);

    const updateResult = tracker.updateTransaction(
      transaction.id,
      55000,
      salaryCategory!.id,
      "Зарплата за январь (бонус)",
      newDate,
    );

    expect(updateResult).toBe(true);
    expect(transaction.amount).toBe(55000);
    expect(transaction.description).toBe("Зарплата за январь (бонус)");
    expect(transaction.date).toBe(newDate);
  });

  test("Тест 5: Удаление транзакции", () => {
    const incomeCategories = tracker.getCategoriesByType(
      TransactionType.INCOME,
    );
    const salaryCategory = incomeCategories.find((c) => c.name === "Зарплата");

    tracker.addTransaction(
      50000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата",
    );

    const expenseCategories = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    );
    const foodCategory = expenseCategories.find((c) => c.name === "Продукты");

    const transactionToDelete = tracker.addTransaction(
      2000,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Ресторан",
    );

    tracker.addTransaction(
      3000,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Такси",
    );

    expect(tracker.getAllTransactions().length).toBe(3);

    const deleteResult = tracker.deleteTransaction(transactionToDelete.id);

    expect(deleteResult).toBe(true);
    expect(tracker.getAllTransactions().length).toBe(2);
    expect(tracker.findTransactionById(transactionToDelete.id)).toBeUndefined();
  });

  test("Тест 6: Расчет баланса и статистики", () => {
    const incomeCategories = tracker.getCategoriesByType(
      TransactionType.INCOME,
    );
    const salaryCategory = incomeCategories.find((c) => c.name === "Зарплата");
    const freelanceCategory = incomeCategories.find(
      (c) => c.name === "Фриланс",
    );

    const expenseCategories = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    );
    const foodCategory = expenseCategories.find((c) => c.name === "Продукты");
    const transportCategory = expenseCategories.find(
      (c) => c.name === "Транспорт",
    );
    const entertainmentCategory = expenseCategories.find(
      (c) => c.name === "Развлечения",
    );

    tracker.addTransaction(
      100000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата",
    );
    tracker.addTransaction(
      25000,
      TransactionType.INCOME,
      freelanceCategory!.id,
      "Фриланс проект",
    );

    tracker.addTransaction(
      15000,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Продукты",
    );
    tracker.addTransaction(
      5000,
      TransactionType.EXPENSE,
      transportCategory!.id,
      "Такси",
    );
    tracker.addTransaction(
      8000,
      TransactionType.EXPENSE,
      entertainmentCategory!.id,
      "Кино и ресторан",
    );

    expect(tracker.getTotalIncome()).toBe(125000);
    expect(tracker.getTotalExpense()).toBe(28000);
    expect(tracker.getBalance()).toBe(97000);

    const incomeByCategory = tracker.getIncomeByCategory();
    expect(incomeByCategory.get("Зарплата")).toBe(100000);
    expect(incomeByCategory.get("Фриланс")).toBe(25000);

    const expenseByCategory = tracker.getExpenseByCategory();
    expect(expenseByCategory.get("Продукты")).toBe(15000);
    expect(expenseByCategory.get("Транспорт")).toBe(5000);
    expect(expenseByCategory.get("Развлечения")).toBe(8000);

    const stats = tracker.getStatistics();
    expect(stats.totalTransactions).toBe(5);
    expect(stats.totalIncome).toBe(125000);
    expect(stats.totalExpense).toBe(28000);
    expect(stats.balance).toBe(97000);
  });

  test("Тест 7: Фильтрация транзакций по дате", () => {
    const incomeCategories = tracker.getCategoriesByType(
      TransactionType.INCOME,
    );
    const salaryCategory = incomeCategories.find((c) => c.name === "Зарплата");

    const expenseCategories = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    );
    const foodCategory = expenseCategories.find((c) => c.name === "Продукты");

    const date1 = new Date(2024, 0, 5);
    const date2 = new Date(2024, 0, 15);
    const date3 = new Date(2024, 1, 10);
    const date4 = new Date(2024, 1, 20);

    tracker.addTransaction(
      100000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата январь",
      date1,
    );
    tracker.addTransaction(
      3000,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Продукты",
      date2,
    );
    tracker.addTransaction(
      100000,
      TransactionType.INCOME,
      salaryCategory!.id,
      "Зарплата февраль",
      date3,
    );
    tracker.addTransaction(
      5000,
      TransactionType.EXPENSE,
      foodCategory!.id,
      "Продукты",
      date4,
    );

    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 31);

    const januaryTransactions = tracker.getTransactionsInDateRange(
      startDate,
      endDate,
    );

    expect(januaryTransactions.length).toBe(2);

    const januarySummary = tracker.getMonthlySummary(2024, 0);
    expect(januarySummary.income).toBe(100000);
    expect(januarySummary.expense).toBe(3000);
    expect(januarySummary.balance).toBe(97000);

    const februarySummary = tracker.getMonthlySummary(2024, 1);
    expect(februarySummary.income).toBe(100000);
    expect(februarySummary.expense).toBe(5000);
    expect(februarySummary.balance).toBe(95000);
  });

  test("Тест 8: Управление категориями", () => {
    const newCategory = tracker.addCategory(
      "Инвестиции",
      TransactionType.INCOME,
      "Доход от инвестиций",
    );

    expect(newCategory.id).toBeGreaterThan(0);
    expect(newCategory.name).toBe("Инвестиции");
    expect(newCategory.type).toBe(TransactionType.INCOME);
    expect(newCategory.description).toBe("Доход от инвестиций");
    expect(() => {
      tracker.addCategory("Инвестиции", TransactionType.INCOME);
    }).toThrow(/уже существует/);

    const incomeCategories = tracker.getCategoriesByType(
      TransactionType.INCOME,
    );
    const expenseCategories = tracker.getCategoriesByType(
      TransactionType.EXPENSE,
    );

    expect(incomeCategories.length).toBe(4);
    expect(expenseCategories.length).toBe(6);

    const updateResult = tracker.updateCategory(
      newCategory.id,
      "Инвестиции и сбережения",
      "Все виды инвестиционного дохода",
    );

    expect(updateResult).toBe(true);
    expect(newCategory.name).toBe("Инвестиции и сбережения");
    expect(newCategory.description).toBe("Все виды инвестиционного дохода");

    const transaction = tracker.addTransaction(
      10000,
      TransactionType.INCOME,
      newCategory.id,
      "Дивиденды",
    );

    expect(() => {
      tracker.deleteCategory(newCategory.id);
    }).toThrow("Нельзя удалить категорию, в которой есть транзакции");

    tracker.deleteTransaction(transaction.id);

    const deleteResult = tracker.deleteCategory(newCategory.id);
    expect(deleteResult).toBe(true);
    expect(tracker.findCategoryById(newCategory.id)).toBeUndefined();
  });
});
