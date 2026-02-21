export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
  BUSY = "busy",
}

export class User {
  id: number;
  username: string;
  email: string;
  status: UserStatus;
  lastSeen: Date;
  avatar: string | null;
  contacts: number[];

  constructor(id: number, username: string, email: string) {
    if (!username || username.trim().length === 0) {
      throw new Error("Имя пользователя не может быть пустым");
    }
    if (!email || email.trim().length === 0 || !email.includes("@")) {
      throw new Error("Некорректный email");
    }

    this.id = id;
    this.username = username;
    this.email = email;
    this.status = UserStatus.OFFLINE;
    this.lastSeen = new Date();
    this.avatar = null;
    this.contacts = [];
  }

  setStatus(status: UserStatus): void {
    this.status = status;
    if (status === UserStatus.OFFLINE) {
      this.lastSeen = new Date();
    }
  }

  addContact(contactId: number): void {
    if (!this.contacts.includes(contactId)) {
      this.contacts.push(contactId);
    }
  }

  removeContact(contactId: number): boolean {
    const index = this.contacts.indexOf(contactId);
    if (index === -1) return false;
    this.contacts.splice(index, 1);
    return true;
  }
}

export class Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isEdited: boolean;
  attachments: string[];

  constructor(id: number, chatId: number, senderId: number, content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error("Сообщение не может быть пустым");
    }

    this.id = id;
    this.chatId = chatId;
    this.senderId = senderId;
    this.content = content;
    this.timestamp = new Date();
    this.isRead = false;
    this.isEdited = false;
    this.attachments = [];
  }

  markAsRead(): void {
    this.isRead = true;
  }

  edit(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error("Сообщение не может быть пустым");
    }
    this.content = newContent;
    this.isEdited = true;
  }

  addAttachment(attachment: string): void {
    this.attachments.push(attachment);
  }
}

export enum ChatType {
  PRIVATE = "private",
  GROUP = "group",
}

export class Chat {
  id: number;
  name: string;
  type: ChatType;
  participants: number[];
  messages: Message[];
  createdAt: Date;
  createdBy: number;
  avatar: string | null;

  constructor(
    id: number,
    name: string,
    type: ChatType,
    createdBy: number,
    participants: number[] = [],
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Название чата не может быть пустым");
    }

    this.id = id;
    this.name = name;
    this.type = type;
    this.participants = [createdBy, ...participants];
    this.messages = [];
    this.createdAt = new Date();
    this.createdBy = createdBy;
    this.avatar = null;
  }

  addParticipant(userId: number): void {
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
    }
  }

  removeParticipant(userId: number): boolean {
    if (this.type === ChatType.PRIVATE && this.participants.length <= 2) {
      throw new Error("Нельзя удалить участника из личного чата");
    }

    const index = this.participants.indexOf(userId);
    if (index === -1) return false;

    this.participants.splice(index, 1);
    return true;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  getMessages(limit: number = 50, offset: number = 0): Message[] {
    return this.messages.slice(offset, offset + limit);
  }

  getUnreadCount(userId: number): number {
    return this.messages.filter((m) => m.senderId !== userId && !m.isRead)
      .length;
  }

  markAllMessagesAsRead(userId: number): void {
    this.messages.forEach((m) => {
      if (m.senderId !== userId && !m.isRead) {
        m.markAsRead();
      }
    });
  }
}

export class ChatApplication {
  private users: User[] = [];
  private chats: Chat[] = [];
  private messages: Message[] = [];

  private nextUserId: number = 1;
  private nextChatId: number = 1;
  private nextMessageId: number = 1;

  registerUser(username: string, email: string): User {
    if (this.users.some((u) => u.email === email)) {
      throw new Error("Пользователь с таким email уже существует");
    }
    if (this.users.some((u) => u.username === username)) {
      throw new Error("Пользователь с таким именем уже существует");
    }

    const user = new User(this.nextUserId++, username, email);
    this.users.push(user);
    return user;
  }

  findUserById(userId: number): User | undefined {
    return this.users.find((u) => u.id === userId);
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findUserByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getOnlineUsers(): User[] {
    return this.users.filter((u) => u.status === UserStatus.ONLINE);
  }

  updateUserStatus(userId: number, status: UserStatus): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.setStatus(status);
    return true;
  }

  addContact(userId: number, contactId: number): boolean {
    const user = this.findUserById(userId);
    const contact = this.findUserById(contactId);

    if (!user || !contact) return false;
    if (userId === contactId) return false;

    user.addContact(contactId);
    return true;
  }

  removeContact(userId: number, contactId: number): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    return user.removeContact(contactId);
  }

  getUserContacts(userId: number): User[] {
    const user = this.findUserById(userId);
    if (!user) return [];

    return user.contacts
      .map((id) => this.findUserById(id))
      .filter((u): u is User => u !== undefined);
  }

  createPrivateChat(user1Id: number, user2Id: number): Chat {
    const user1 = this.findUserById(user1Id);
    const user2 = this.findUserById(user2Id);

    if (!user1 || !user2) {
      throw new Error("Пользователь не найден");
    }

    const existingChat = this.chats.find(
      (c) =>
        c.type === ChatType.PRIVATE &&
        c.participants.includes(user1Id) &&
        c.participants.includes(user2Id) &&
        c.participants.length === 2,
    );

    if (existingChat) {
      throw new Error("Личный чат между этими пользователями уже существует");
    }

    const chatName = `${user1.username}, ${user2.username}`;
    const chat = new Chat(
      this.nextChatId++,
      chatName,
      ChatType.PRIVATE,
      user1Id,
      [user2Id],
    );
    this.chats.push(chat);
    return chat;
  }

  createGroupChat(
    name: string,
    creatorId: number,
    participantIds: number[] = [],
  ): Chat {
    const creator = this.findUserById(creatorId);
    if (!creator) {
      throw new Error("Создатель чата не найден");
    }

    for (const id of participantIds) {
      if (!this.findUserById(id)) {
        throw new Error(`Участник с ID ${id} не найден`);
      }
    }

    const chat = new Chat(
      this.nextChatId++,
      name,
      ChatType.GROUP,
      creatorId,
      participantIds,
    );
    this.chats.push(chat);
    return chat;
  }

  findChatById(chatId: number): Chat | undefined {
    return this.chats.find((c) => c.id === chatId);
  }

  getUserChats(userId: number): Chat[] {
    return this.chats.filter((c) => c.participants.includes(userId));
  }

  addUserToChat(chatId: number, userId: number, addedBy: number): boolean {
    const chat = this.findChatById(chatId);
    const user = this.findUserById(userId);
    const adder = this.findUserById(addedBy);

    if (!chat || !user || !adder) return false;
    if (chat.type !== ChatType.GROUP) return false;
    if (!chat.participants.includes(addedBy)) return false;

    chat.addParticipant(userId);
    return true;
  }

  removeUserFromChat(
    chatId: number,
    userId: number,
    removedBy: number,
  ): boolean {
    const chat = this.findChatById(chatId);
    if (!chat) return false;
    if (chat.type !== ChatType.GROUP) return false;
    if (!chat.participants.includes(removedBy)) return false;
    if (userId === chat.createdBy) {
      throw new Error("Нельзя удалить создателя чата");
    }

    return chat.removeParticipant(userId);
  }

  deleteChat(chatId: number, userId: number): boolean {
    const chat = this.findChatById(chatId);
    if (!chat) return false;
    if (chat.createdBy !== userId) {
      throw new Error("Только создатель чата может удалить его");
    }

    const index = this.chats.findIndex((c) => c.id === chatId);
    if (index === -1) return false;

    this.chats.splice(index, 1);
    return true;
  }

  sendMessage(
    chatId: number,
    senderId: number,
    content: string,
  ): Message | null {
    const chat = this.findChatById(chatId);
    const sender = this.findUserById(senderId);

    if (!chat || !sender) return null;
    if (!chat.participants.includes(senderId)) {
      throw new Error("Пользователь не является участником чата");
    }

    const message = new Message(
      this.nextMessageId++,
      chatId,
      senderId,
      content,
    );
    this.messages.push(message);
    chat.addMessage(message);
    return message;
  }

  sendMessageWithAttachment(
    chatId: number,
    senderId: number,
    content: string,
    attachment: string,
  ): Message | null {
    const message = this.sendMessage(chatId, senderId, content);
    if (message) {
      message.addAttachment(attachment);
    }
    return message;
  }

  editMessage(messageId: number, userId: number, newContent: string): boolean {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return false;
    if (message.senderId !== userId) {
      throw new Error("Только автор может редактировать сообщение");
    }

    message.edit(newContent);
    return true;
  }

  deleteMessage(messageId: number, userId: number): boolean {
    const messageIndex = this.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return false;

    const message = this.messages[messageIndex];
    if (message.senderId !== userId) {
      throw new Error("Только автор может удалить сообщение");
    }

    this.messages.splice(messageIndex, 1);

    const chat = this.findChatById(message.chatId);
    if (chat) {
      const chatMessageIndex = chat.messages.findIndex(
        (m) => m.id === messageId,
      );
      if (chatMessageIndex !== -1) {
        chat.messages.splice(chatMessageIndex, 1);
      }
    }

    return true;
  }

  getChatMessages(
    chatId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Message[] | null {
    const chat = this.findChatById(chatId);
    if (!chat) return null;
    if (!chat.participants.includes(userId)) return null;

    return chat.getMessages(limit, offset);
  }

  markMessagesAsRead(chatId: number, userId: number): boolean {
    const chat = this.findChatById(chatId);
    if (!chat) return false;
    if (!chat.participants.includes(userId)) return false;

    chat.markAllMessagesAsRead(userId);
    return true;
  }

  getUnreadCount(userId: number): Map<number, number> {
    const result = new Map<number, number>();
    const userChats = this.getUserChats(userId);

    userChats.forEach((chat) => {
      const count = chat.getUnreadCount(userId);
      if (count > 0) {
        result.set(chat.id, count);
      }
    });

    return result;
  }

  searchMessages(userId: number, query: string): Message[] {
    const userChats = this.getUserChats(userId);
    const chatIds = userChats.map((c) => c.id);

    return this.messages.filter(
      (m) =>
        chatIds.includes(m.chatId) &&
        m.content.toLowerCase().includes(query.toLowerCase()),
    );
  }

  getUserStatistics(
    userId: number,
  ): {
    totalMessages: number;
    totalChats: number;
    contactsCount: number;
  } | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    const userChats = this.getUserChats(userId);
    const totalMessages = this.messages.filter((m) =>
      userChats.some((c) => c.id === m.chatId),
    ).length;

    return {
      totalMessages,
      totalChats: userChats.length,
      contactsCount: user.contacts.length,
    };
  }

  getChatStatistics(
    chatId: number,
  ): { totalMessages: number; participants: number; createdAt: Date } | null {
    const chat = this.findChatById(chatId);
    if (!chat) return null;

    return {
      totalMessages: chat.messages.length,
      participants: chat.participants.length,
      createdAt: chat.createdAt,
    };
  }
}
