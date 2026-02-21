export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export class Category {
  id: number;
  name: string;
  type: TransactionType;
  description: string;

  constructor(
    id: number,
    name: string,
    type: TransactionType,
    description: string = "",
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
  }
}

export class Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval: "daily" | "weekly" | "monthly" | "yearly" | null;

  constructor(
    id: number,
    amount: number,
    type: TransactionType,
    categoryId: number,
    description: string,
    date: Date = new Date(),
    isRecurring: boolean = false,
    recurringInterval: "daily" | "weekly" | "monthly" | "yearly" | null = null,
  ) {
    if (amount <= 0) {
      throw new Error("Сумма транзакции должна быть положительным числом");
    }

    this.id = id;
    this.amount = amount;
    this.type = type;
    this.categoryId = categoryId;
    this.description = description;
    this.date = date;
    this.isRecurring = isRecurring;
    this.recurringInterval = isRecurring ? recurringInterval : null;
  }
}

export class ExpenseTracker {
  private transactions: Transaction[] = [];
  private categories: Category[] = [];

  private nextTransactionId: number = 1;
  private nextCategoryId: number = 1;

  constructor() {
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories(): void {
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Зарплата",
        TransactionType.INCOME,
        "Основной доход",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Фриланс",
        TransactionType.INCOME,
        "Дополнительный доход",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Подарки",
        TransactionType.INCOME,
        "Денежные подарки",
      ),
    );

    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Продукты",
        TransactionType.EXPENSE,
        "Питание и продукты",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Транспорт",
        TransactionType.EXPENSE,
        "Общественный транспорт, такси",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Жилье",
        TransactionType.EXPENSE,
        "Аренда, коммунальные услуги",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Развлечения",
        TransactionType.EXPENSE,
        "Кино, рестораны, хобби",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Здоровье",
        TransactionType.EXPENSE,
        "Лекарства, врачи",
      ),
    );
    this.categories.push(
      new Category(
        this.nextCategoryId++,
        "Образование",
        TransactionType.EXPENSE,
        "Курсы, книги",
      ),
    );
  }

  addCategory(
    name: string,
    type: TransactionType,
    description: string = "",
  ): Category {
    if (!name || name.trim().length === 0) {
      throw new Error("Название категории не может быть пустым");
    }

    if (
      this.categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type,
      )
    ) {
      throw new Error(
        `Категория с названием "${name}" и типом ${type} уже существует`,
      );
    }

    const category = new Category(
      this.nextCategoryId++,
      name,
      type,
      description,
    );
    this.categories.push(category);
    return category;
  }

  getAllCategories(): Category[] {
    return [...this.categories];
  }

  getCategoriesByType(type: TransactionType): Category[] {
    return this.categories.filter((c) => c.type === type);
  }

  findCategoryById(categoryId: number): Category | undefined {
    return this.categories.find((c) => c.id === categoryId);
  }

  updateCategory(
    categoryId: number,
    name: string,
    description: string,
  ): boolean {
    const category = this.findCategoryById(categoryId);
    if (!category) return false;

    category.name = name;
    category.description = description;
    return true;
  }

  deleteCategory(categoryId: number): boolean {
    const hasTransactions = this.transactions.some(
      (t) => t.categoryId === categoryId,
    );
    if (hasTransactions) {
      throw new Error("Нельзя удалить категорию, в которой есть транзакции");
    }

    const index = this.categories.findIndex((c) => c.id === categoryId);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
  }

  addTransaction(
    amount: number,
    type: TransactionType,
    categoryId: number,
    description: string,
    date: Date = new Date(),
    isRecurring: boolean = false,
    recurringInterval: "daily" | "weekly" | "monthly" | "yearly" | null = null,
  ): Transaction {
    const category = this.findCategoryById(categoryId);
    if (!category) {
      throw new Error("Категория не найдена");
    }

    if (category.type !== type) {
      throw new Error(
        `Категория "${category.name}" не подходит для типа ${type}`,
      );
    }

    const transaction = new Transaction(
      this.nextTransactionId++,
      amount,
      type,
      categoryId,
      description,
      date,
      isRecurring,
      recurringInterval,
    );

    this.transactions.push(transaction);
    return transaction;
  }

  getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getTransactionsByType(type: TransactionType): Transaction[] {
    return this.transactions.filter((t) => t.type === type);
  }

  getTransactionsByCategory(categoryId: number): Transaction[] {
    return this.transactions.filter((t) => t.categoryId === categoryId);
  }

  getTransactionsInDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate,
    );
  }

  findTransactionById(transactionId: number): Transaction | undefined {
    return this.transactions.find((t) => t.id === transactionId);
  }

  updateTransaction(
    transactionId: number,
    amount: number,
    categoryId: number,
    description: string,
    date: Date,
  ): boolean {
    const transaction = this.findTransactionById(transactionId);
    if (!transaction) return false;

    const category = this.findCategoryById(categoryId);
    if (!category) {
      throw new Error("Категория не найдена");
    }

    if (category.type !== transaction.type) {
      throw new Error(
        `Категория "${category.name}" не подходит для типа ${transaction.type}`,
      );
    }

    transaction.amount = amount;
    transaction.categoryId = categoryId;
    transaction.description = description;
    transaction.date = date;
    return true;
  }

  deleteTransaction(transactionId: number): boolean {
    const index = this.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return false;

    this.transactions.splice(index, 1);
    return true;
  }

  getTotalIncome(): number {
    return this.transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  getIncomeByCategory(): Map<string, number> {
    const result = new Map<string, number>();

    this.transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .forEach((t) => {
        const category = this.findCategoryById(t.categoryId);
        if (category) {
          const current = result.get(category.name) || 0;
          result.set(category.name, current + t.amount);
        }
      });

    return result;
  }

  getExpenseByCategory(): Map<string, number> {
    const result = new Map<string, number>();

    this.transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        const category = this.findCategoryById(t.categoryId);
        if (category) {
          const current = result.get(category.name) || 0;
          result.set(category.name, current + t.amount);
        }
      });

    return result;
  }

  getMonthlySummary(
    year: number,
    month: number,
  ): { income: number; expense: number; balance: number } {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyTransactions = this.getTransactionsInDateRange(
      startDate,
      endDate,
    );

    const income = monthlyTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  getRecurringTransactions(): Transaction[] {
    return this.transactions.filter((t) => t.isRecurring);
  }

  getLargestExpense(): Transaction | undefined {
    const expenses = this.transactions.filter(
      (t) => t.type === TransactionType.EXPENSE,
    );
    if (expenses.length === 0) return undefined;

    return expenses.reduce((max, current) =>
      current.amount > max.amount ? current : max,
    );
  }

  getLargestIncome(): Transaction | undefined {
    const incomes = this.transactions.filter(
      (t) => t.type === TransactionType.INCOME,
    );
    if (incomes.length === 0) return undefined;

    return incomes.reduce((max, current) =>
      current.amount > max.amount ? current : max,
    );
  }

  getStatistics() {
    return {
      totalTransactions: this.transactions.length,
      totalIncome: this.getTotalIncome(),
      totalExpense: this.getTotalExpense(),
      balance: this.getBalance(),
      incomeCategories: this.getCategoriesByType(TransactionType.INCOME).length,
      expenseCategories: this.getCategoriesByType(TransactionType.EXPENSE)
        .length,
      recurringTransactions: this.getRecurringTransactions().length,
    };
  }
}
