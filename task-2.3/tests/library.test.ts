import { describe, beforeEach, test, expect } from "@jest/globals";
import { LibrarySystem } from "../src/library";

describe("Library System Tests", () => {
  let library: LibrarySystem;

  beforeEach(() => {
    library = new LibrarySystem();
  });

  test("Тест 1: Добавление книги", () => {
    const book = library.addBook(
      "Война и мир",
      "Лев Толстой",
      "978-5-17-123456-7",
      1869,
    );

    expect(book.id).toBe(1);
    expect(book.title).toBe("Война и мир");
    expect(book.author).toBe("Лев Толстой");
    expect(book.isbn).toBe("978-5-17-123456-7");
    expect(book.year).toBe(1869);
    expect(book.isAvailable).toBe(true);
    expect(library.getAllBooks().length).toBe(1);
  });

  test("Тест 2: Регистрация читателя", () => {
    const reader = library.registerReader(
      "Иван Петров",
      "ivan@mail.ru",
      "+7-999-123-45-67",
    );

    expect(reader.id).toBe(1);
    expect(reader.name).toBe("Иван Петров");
    expect(reader.email).toBe("ivan@mail.ru");
    expect(reader.phone).toBe("+7-999-123-45-67");
    expect(reader.registeredAt).toBeDefined();
    expect(library.getAllReaders().length).toBe(1);
  });

  test("Тест 3: Выдача книги читателю", () => {
    const book = library.addBook("Книга", "Автор", "isbn-1", 2000);
    const reader = library.registerReader(
      "Читатель",
      "reader@mail.ru",
      "+7-111-111-11-11",
    );

    const loan = library.loanBook(book.id, reader.id);

    expect(loan).not.toBeNull();
    expect(loan?.id).toBe(1);
    expect(loan?.bookId).toBe(book.id);
    expect(loan?.readerId).toBe(reader.id);
    expect(loan?.returnDate).toBeNull();

    expect(book.isAvailable).toBe(false);
    expect(library.getAvailableBooks().length).toBe(0);
    expect(library.getActiveLoans().length).toBe(1);
  });

  test("Тест 4: Возврат книги", () => {
    const book = library.addBook("Книга", "Автор", "isbn-1", 2000);
    const reader = library.registerReader(
      "Читатель",
      "reader@mail.ru",
      "+7-111-111-11-11",
    );

    const loan = library.loanBook(book.id, reader.id);
    expect(book.isAvailable).toBe(false);
    expect(library.getActiveLoans().length).toBe(1);

    const returnResult = library.returnBook(loan!.id);

    expect(returnResult).toBe(true);
    expect(loan?.returnDate).not.toBeNull();
    expect(book.isAvailable).toBe(true);
    expect(library.getActiveLoans().length).toBe(0);
  });

  test("Тест 5: Получение списка доступных книг", () => {
    const book1 = library.addBook("Книга 1", "Автор 1", "isbn-1", 2000);
    const book2 = library.addBook("Книга 2", "Автор 2", "isbn-2", 2001);
    const book3 = library.addBook("Книга 3", "Автор 3", "isbn-3", 2002);

    const reader = library.registerReader(
      "Читатель",
      "reader@mail.ru",
      "+7-111-111-11-11",
    );

    library.loanBook(book2.id, reader.id);

    const availableBooks = library.getAvailableBooks();

    expect(availableBooks.length).toBe(2);
    expect(availableBooks[0].id).toBe(book1.id);
    expect(availableBooks[1].id).toBe(book3.id);
  });

  test("Тест 6: Получение истории выдач читателя", () => {
    const book1 = library.addBook("Книга 1", "Автор 1", "isbn-1", 2000);
    const book2 = library.addBook("Книга 2", "Автор 2", "isbn-2", 2001);
    const reader = library.registerReader(
      "Читатель",
      "reader@mail.ru",
      "+7-111-111-11-11",
    );

    const loan1 = library.loanBook(book1.id, reader.id);
    const loan2 = library.loanBook(book2.id, reader.id);

    library.returnBook(loan1!.id);

    const readerLoans = library.getLoansByReader(reader.id);

    expect(readerLoans.length).toBe(2);
    expect(readerLoans[0].bookId).toBe(book1.id);
    expect(readerLoans[1].bookId).toBe(book2.id);
  });

  test("Тест 7: Удаление книги", () => {
    library.addBook("Книга 1", "Автор 1", "isbn-1", 2000);
    const bookToDelete = library.addBook("Книга 2", "Автор 2", "isbn-2", 2001);
    library.addBook("Книга 3", "Автор 3", "isbn-3", 2002);

    expect(library.getAllBooks().length).toBe(3);

    const deleteResult = library.deleteBook(bookToDelete.id);

    expect(deleteResult).toBe(true);
    expect(library.getAllBooks().length).toBe(2);
    expect(library.findBookById(bookToDelete.id)).toBeUndefined();
  });

  test("Тест 8: Негативные сценарии", () => {
    const book = library.addBook("Книга", "Автор", "isbn-1", 2000);
    const reader = library.registerReader(
      "Читатель",
      "reader@mail.ru",
      "+7-111-111-11-11",
    );

    expect(() => {
      library.addBook("", "Автор", "isbn-2", 2000);
    }).toThrow("Название книги не может быть пустым");

    expect(() => {
      library.registerReader("", "email@mail.ru", "+7-123-456-78-90");
    }).toThrow("Имя читателя не может быть пустым");

    expect(() => {
      library.loanBook(999, reader.id);
    }).toThrow("Книга не найдена");

    expect(() => {
      library.loanBook(book.id, 999);
    }).toThrow("Читатель не найден");

    const returnResult = library.returnBook(999);
    expect(returnResult).toBe(false);

    const returnByBookResult = library.returnBookByBookId(999);
    expect(returnByBookResult).toBe(false);
  });
});
