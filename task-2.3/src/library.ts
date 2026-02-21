export class Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  year: number;
  isAvailable: boolean;

  constructor(
    id: number,
    title: string,
    author: string,
    isbn: string,
    year: number,
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.year = year;
    this.isAvailable = true;
  }
}

export class Reader {
  id: number;
  name: string;
  email: string;
  phone: string;
  registeredAt: Date;

  constructor(id: number, name: string, email: string, phone: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.registeredAt = new Date();
  }
}

export class Loan {
  id: number;
  bookId: number;
  readerId: number;
  loanDate: Date;
  dueDate: Date;
  returnDate: Date | null;

  constructor(
    id: number,
    bookId: number,
    readerId: number,
    daysToReturn: number = 14,
  ) {
    this.id = id;
    this.bookId = bookId;
    this.readerId = readerId;
    this.loanDate = new Date();
    this.dueDate = new Date();
    this.dueDate.setDate(this.dueDate.getDate() + daysToReturn);
    this.returnDate = null;
  }

  return(): void {
    this.returnDate = new Date();
  }

  isOverdue(): boolean {
    if (this.returnDate) return false;
    return new Date() > this.dueDate;
  }
}

export class LibrarySystem {
  private books: Book[] = [];
  private readers: Reader[] = [];
  private loans: Loan[] = [];

  private nextBookId: number = 1;
  private nextReaderId: number = 1;
  private nextLoanId: number = 1;

  addBook(title: string, author: string, isbn: string, year: number): Book {
    if (!title || title.trim().length === 0) {
      throw new Error("Название книги не может быть пустым");
    }
    if (!author || author.trim().length === 0) {
      throw new Error("Автор книги не может быть пустым");
    }
    if (!isbn || isbn.trim().length === 0) {
      throw new Error("ISBN книги не может быть пустым");
    }
    if (year < 1000 || year > new Date().getFullYear() + 1) {
      throw new Error("Некорректный год издания");
    }

    if (this.books.some((book) => book.isbn === isbn)) {
      throw new Error("Книга с таким ISBN уже существует");
    }

    const book = new Book(this.nextBookId++, title, author, isbn, year);
    this.books.push(book);
    return book;
  }

  findBookById(bookId: number): Book | undefined {
    return this.books.find((book) => book.id === bookId);
  }

  getAllBooks(): Book[] {
    return [...this.books];
  }

  getAvailableBooks(): Book[] {
    return this.books.filter((book) => book.isAvailable);
  }

  deleteBook(bookId: number): boolean {
    const activeLoan = this.loans.find(
      (loan) => loan.bookId === bookId && loan.returnDate === null,
    );
    if (activeLoan) {
      throw new Error("Нельзя удалить книгу, которая сейчас выдана");
    }

    const index = this.books.findIndex((book) => book.id === bookId);
    if (index === -1) return false;

    this.books.splice(index, 1);
    return true;
  }

  registerReader(name: string, email: string, phone: string): Reader {
    if (!name || name.trim().length === 0) {
      throw new Error("Имя читателя не может быть пустым");
    }
    if (!email || email.trim().length === 0 || !email.includes("@")) {
      throw new Error("Некорректный email");
    }
    if (!phone || phone.trim().length === 0) {
      throw new Error("Телефон не может быть пустым");
    }

    if (this.readers.some((reader) => reader.email === email)) {
      throw new Error("Читатель с таким email уже зарегистрирован");
    }

    const reader = new Reader(this.nextReaderId++, name, email, phone);
    this.readers.push(reader);
    return reader;
  }

  findReaderById(readerId: number): Reader | undefined {
    return this.readers.find((reader) => reader.id === readerId);
  }

  getAllReaders(): Reader[] {
    return [...this.readers];
  }

  loanBook(
    bookId: number,
    readerId: number,
    daysToReturn: number = 14,
  ): Loan | null {
    const book = this.findBookById(bookId);
    if (!book) {
      throw new Error("Книга не найдена");
    }

    const reader = this.findReaderById(readerId);
    if (!reader) {
      throw new Error("Читатель не найден");
    }

    if (!book.isAvailable) {
      throw new Error("Книга недоступна для выдачи");
    }

    const activeLoan = this.loans.find(
      (loan) => loan.bookId === bookId && loan.returnDate === null,
    );
    if (activeLoan) {
      throw new Error("Книга уже выдана");
    }

    book.isAvailable = false;
    const loan = new Loan(this.nextLoanId++, bookId, readerId, daysToReturn);
    this.loans.push(loan);
    return loan;
  }

  returnBook(loanId: number): boolean {
    const loan = this.loans.find((l) => l.id === loanId);
    if (!loan) return false;

    if (loan.returnDate !== null) {
      throw new Error("Книга уже возвращена");
    }

    const book = this.findBookById(loan.bookId);
    if (book) {
      book.isAvailable = true;
    }

    loan.return();
    return true;
  }

  returnBookByBookId(bookId: number): boolean {
    const activeLoan = this.loans.find(
      (loan) => loan.bookId === bookId && loan.returnDate === null,
    );
    if (!activeLoan) return false;

    return this.returnBook(activeLoan.id);
  }

  getActiveLoans(): Loan[] {
    return this.loans.filter((loan) => loan.returnDate === null);
  }

  getLoansByReader(readerId: number): Loan[] {
    return this.loans.filter((loan) => loan.readerId === readerId);
  }
}
