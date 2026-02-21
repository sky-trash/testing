import { describe, beforeEach, test, expect } from "@jest/globals";
import {
  ChatApplication,
  UserStatus,
  ChatType,
  User,
  Chat,
  Message,
} from "../src/chat";

describe("Chat Application Tests", () => {
  let chatApp: ChatApplication;

  beforeEach(() => {
    chatApp = new ChatApplication();
  });

  test("Тест 1: Регистрация пользователя", () => {
    const user = chatApp.registerUser("john_doe", "john@example.com");

    expect(user.id).toBe(1);
    expect(user.username).toBe("john_doe");
    expect(user.email).toBe("john@example.com");
    expect(user.status).toBe(UserStatus.OFFLINE);
    expect(user.contacts.length).toBe(0);
    expect(user.lastSeen).toBeDefined();
    expect(chatApp.getAllUsers().length).toBe(1);
  });

  test("Тест 2: Регистрация пользователя с ошибками валидации", () => {
    expect(() => {
      chatApp.registerUser("", "john@example.com");
    }).toThrow("Имя пользователя не может быть пустым");

    expect(() => {
      chatApp.registerUser("john_doe", "");
    }).toThrow("Некорректный email");

    expect(() => {
      chatApp.registerUser("john_doe", "invalid-email");
    }).toThrow("Некорректный email");

    chatApp.registerUser("john_doe", "john@example.com");

    expect(() => {
      chatApp.registerUser("jane_doe", "john@example.com");
    }).toThrow("Пользователь с таким email уже существует");

    expect(() => {
      chatApp.registerUser("john_doe", "jane@example.com");
    }).toThrow("Пользователь с таким именем уже существует");
  });

  test("Тест 3: Обновление статуса пользователя", () => {
    const user = chatApp.registerUser("john_doe", "john@example.com");

    expect(user.status).toBe(UserStatus.OFFLINE);

    const updateResult = chatApp.updateUserStatus(user.id, UserStatus.ONLINE);

    expect(updateResult).toBe(true);
    expect(user.status).toBe(UserStatus.ONLINE);

    const onlineUsers = chatApp.getOnlineUsers();
    expect(onlineUsers.length).toBe(1);
    expect(onlineUsers[0].id).toBe(user.id);
  });

  test("Тест 4: Создание личного чата", () => {
    const user1 = chatApp.registerUser("alice", "alice@example.com");
    const user2 = chatApp.registerUser("bob", "bob@example.com");

    const chat = chatApp.createPrivateChat(user1.id, user2.id);

    expect(chat.id).toBe(1);
    expect(chat.type).toBe(ChatType.PRIVATE);
    expect(chat.participants.length).toBe(2);
    expect(chat.participants).toContain(user1.id);
    expect(chat.participants).toContain(user2.id);
    expect(chat.createdBy).toBe(user1.id);
    expect(chat.messages.length).toBe(0);
    expect(() => {
      chatApp.createPrivateChat(user1.id, user2.id);
    }).toThrow("Личный чат между этими пользователями уже существует");
  });

  test("Тест 5: Создание группового чата", () => {
    const creator = chatApp.registerUser("alice", "alice@example.com");
    const user2 = chatApp.registerUser("bob", "bob@example.com");
    const user3 = chatApp.registerUser("charlie", "charlie@example.com");

    const chat = chatApp.createGroupChat("Рабочая группа", creator.id, [
      user2.id,
      user3.id,
    ]);

    expect(chat.id).toBe(1);
    expect(chat.name).toBe("Рабочая группа");
    expect(chat.type).toBe(ChatType.GROUP);
    expect(chat.participants.length).toBe(3);
    expect(chat.participants).toContain(creator.id);
    expect(chat.participants).toContain(user2.id);
    expect(chat.participants).toContain(user3.id);
    expect(chat.createdBy).toBe(creator.id);

    const userChats = chatApp.getUserChats(creator.id);
    expect(userChats.length).toBe(1);
    expect(userChats[0].id).toBe(chat.id);
  });

  test("Тест 6: Отправка и получение сообщений", () => {
    const user1 = chatApp.registerUser("alice", "alice@example.com");
    const user2 = chatApp.registerUser("bob", "bob@example.com");

    const chat = chatApp.createPrivateChat(user1.id, user2.id);

    const message = chatApp.sendMessage(
      chat.id,
      user1.id,
      "Привет, Боб! Как дела?",
    );

    expect(message).not.toBeNull();
    expect(message?.id).toBe(1);
    expect(message?.chatId).toBe(chat.id);
    expect(message?.senderId).toBe(user1.id);
    expect(message?.content).toBe("Привет, Боб! Как дела?");
    expect(message?.isRead).toBe(false);
    expect(message?.isEdited).toBe(false);
    expect(message?.attachments.length).toBe(0);

    const message2 = chatApp.sendMessage(
      chat.id,
      user2.id,
      "Привет, Алиса! Все отлично!",
    );

    expect(message2).not.toBeNull();
    expect(message2?.id).toBe(2);

    const messages = chatApp.getChatMessages(chat.id, user1.id);
    expect(messages?.length).toBe(2);
    expect(messages?.[0].content).toBe("Привет, Боб! Как дела?");
    expect(messages?.[1].content).toBe("Привет, Алиса! Все отлично!");

    const user1Stats = chatApp.getUserStatistics(user1.id);
    expect(user1Stats?.totalMessages).toBe(2);
    expect(user1Stats?.totalChats).toBe(1);

    const chatStats = chatApp.getChatStatistics(chat.id);
    expect(chatStats?.totalMessages).toBe(2);
    expect(chatStats?.participants).toBe(2);
  });

  test("Тест 7: Редактирование и удаление сообщений", () => {
    const user1 = chatApp.registerUser("alice", "alice@example.com");
    const user2 = chatApp.registerUser("bob", "bob@example.com");

    const chat = chatApp.createPrivateChat(user1.id, user2.id);

    const message = chatApp.sendMessage(chat.id, user1.id, "Старое сообщение");

    const editResult = chatApp.editMessage(
      message!.id,
      user1.id,
      "Новое сообщение",
    );

    expect(editResult).toBe(true);
    expect(message?.content).toBe("Новое сообщение");
    expect(message?.isEdited).toBe(true);

    expect(() => {
      chatApp.editMessage(message!.id, user2.id, "Попытка взлома");
    }).toThrow("Только автор может редактировать сообщение");

    const deleteResult = chatApp.deleteMessage(message!.id, user1.id);
    expect(deleteResult).toBe(true);

    const messages = chatApp.getChatMessages(chat.id, user1.id);
    expect(messages?.length).toBe(0);
  });

  test("Тест 8: Управление контактами и непрочитанные сообщения", () => {
    const user1 = chatApp.registerUser("alice", "alice@example.com");
    const user2 = chatApp.registerUser("bob", "bob@example.com");
    const user3 = chatApp.registerUser("charlie", "charlie@example.com");

    const addResult1 = chatApp.addContact(user1.id, user2.id);
    const addResult2 = chatApp.addContact(user1.id, user3.id);

    expect(addResult1).toBe(true);
    expect(addResult2).toBe(true);

    const contacts = chatApp.getUserContacts(user1.id);
    expect(contacts.length).toBe(2);
    expect(contacts[0].username).toBe("bob");
    expect(contacts[1].username).toBe("charlie");

    const chat = chatApp.createPrivateChat(user1.id, user2.id);

    chatApp.sendMessage(chat.id, user2.id, "Привет, Алиса!");
    chatApp.sendMessage(chat.id, user2.id, "Как твои дела?");
    chatApp.sendMessage(chat.id, user1.id, "Привет, Боб! Все хорошо!");

    const unreadCount = chat.getUnreadCount(user1.id);
    expect(unreadCount).toBe(2);

    const unreadMap = chatApp.getUnreadCount(user1.id);
    expect(unreadMap.size).toBe(1);
    expect(unreadMap.get(chat.id)).toBe(2);

    const markResult = chatApp.markMessagesAsRead(chat.id, user1.id);
    expect(markResult).toBe(true);

    const unreadAfterMark = chat.getUnreadCount(user1.id);
    expect(unreadAfterMark).toBe(0);

    const removeResult = chatApp.removeContact(user1.id, user2.id);
    expect(removeResult).toBe(true);

    const updatedContacts = chatApp.getUserContacts(user1.id);
    expect(updatedContacts.length).toBe(1);
    expect(updatedContacts[0].username).toBe("charlie");
  });
});
