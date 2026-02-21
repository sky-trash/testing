import { describe, beforeEach, test, expect } from "@jest/globals";
import { EventCalendar } from "../src/calendar";

describe("Event Calendar Tests", () => {
  let calendar: EventCalendar;

  beforeEach(() => {
    calendar = new EventCalendar();
  });

  test("Тест 1: Создание события", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const event = calendar.createEvent(
      "Встреча с командой",
      "Обсуждение нового проекта",
      startDate,
      endDate,
      "Офис, переговорная 301",
      "Иван Петров",
    );

    expect(event.id).toBe(1);
    expect(event.title).toBe("Встреча с командой");
    expect(event.description).toBe("Обсуждение нового проекта");
    expect(event.startDate).toBe(startDate);
    expect(event.endDate).toBe(endDate);
    expect(event.location).toBe("Офис, переговорная 301");
    expect(event.organizer).toBe("Иван Петров");
    expect(event.attendees.length).toBe(0);
    expect(event.notifications.length).toBe(0);
    expect(calendar.getAllEvents().length).toBe(1);
  });

  test("Тест 2: Создание события с ошибками валидации", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const laterDate = new Date(futureDate);
    laterDate.setHours(laterDate.getHours() + 1);

    expect(() => {
      calendar.createEvent(
        "",
        "Описание",
        futureDate,
        laterDate,
        "Место",
        "Организатор",
      );
    }).toThrow("Название события не может быть пустым");

    expect(() => {
      calendar.createEvent(
        "Название",
        "",
        futureDate,
        laterDate,
        "Место",
        "Организатор",
      );
    }).toThrow("Описание события не может быть пустым");

    expect(() => {
      calendar.createEvent(
        "Название",
        "Описание",
        futureDate,
        laterDate,
        "",
        "Организатор",
      );
    }).toThrow("Место проведения не может быть пустым");

    expect(() => {
      calendar.createEvent(
        "Название",
        "Описание",
        futureDate,
        laterDate,
        "Место",
        "",
      );
    }).toThrow("Организатор не может быть пустым");

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    expect(() => {
      calendar.createEvent(
        "Название",
        "Описание",
        pastDate,
        laterDate,
        "Место",
        "Организатор",
      );
    }).toThrow("Дата начала не может быть в прошлом");

    expect(() => {
      calendar.createEvent(
        "Название",
        "Описание",
        laterDate,
        futureDate,
        "Место",
        "Организатор",
      );
    }).toThrow("Дата окончания должна быть позже даты начала");
  });

  test("Тест 3: Редактирование события", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const event = calendar.createEvent(
      "Старое название",
      "Старое описание",
      startDate,
      endDate,
      "Старое место",
      "Организатор",
    );

    const newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() + 2);

    const newEndDate = new Date(newStartDate);
    newEndDate.setHours(newEndDate.getHours() + 3);

    const updateResult = calendar.updateEvent(
      event.id,
      "Новое название",
      "Новое описание",
      newStartDate,
      newEndDate,
      "Новое место",
    );

    expect(updateResult).toBe(true);
    expect(event.title).toBe("Новое название");
    expect(event.description).toBe("Новое описание");
    expect(event.startDate).toBe(newStartDate);
    expect(event.endDate).toBe(newEndDate);
    expect(event.location).toBe("Новое место");
  });

  test("Тест 4: Удаление события", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    calendar.createEvent(
      "Событие 1",
      "Описание 1",
      startDate,
      endDate,
      "Место 1",
      "Организатор 1",
    );

    const eventToDelete = calendar.createEvent(
      "Событие 2",
      "Описание 2",
      startDate,
      endDate,
      "Место 2",
      "Организатор 2",
    );

    calendar.createEvent(
      "Событие 3",
      "Описание 3",
      startDate,
      endDate,
      "Место 3",
      "Организатор 3",
    );

    expect(calendar.getAllEvents().length).toBe(3);

    const deleteResult = calendar.deleteEvent(eventToDelete.id);

    expect(deleteResult).toBe(true);
    expect(calendar.getAllEvents().length).toBe(2);
    expect(calendar.findEventById(eventToDelete.id)).toBeUndefined();
  });

  test("Тест 5: Добавление и удаление участников", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const event = calendar.createEvent(
      "Конференция",
      "Обсуждение",
      startDate,
      endDate,
      "Зал 101",
      "Организатор",
    );

    const addResult1 = calendar.addAttendeeToEvent(event.id, "ivan@mail.ru");
    const addResult2 = calendar.addAttendeeToEvent(event.id, "petr@mail.ru");
    const addResult3 = calendar.addAttendeeToEvent(event.id, "maria@mail.ru");

    expect(addResult1).toBe(true);
    expect(addResult2).toBe(true);
    expect(addResult3).toBe(true);

    const attendees = calendar.getEventAttendees(event.id);
    expect(attendees).not.toBeNull();
    expect(attendees?.length).toBe(3);
    expect(attendees).toContain("ivan@mail.ru");
    expect(attendees).toContain("petr@mail.ru");
    expect(attendees).toContain("maria@mail.ru");

    const removeResult = calendar.removeAttendeeFromEvent(
      event.id,
      "petr@mail.ru",
    );
    expect(removeResult).toBe(true);

    const updatedAttendees = calendar.getEventAttendees(event.id);
    expect(updatedAttendees?.length).toBe(2);
    expect(updatedAttendees).not.toContain("petr@mail.ru");
  });

  test("Тест 6: Планирование уведомлений", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const event = calendar.createEvent(
      "Важная встреча",
      "Обсуждение проекта",
      startDate,
      endDate,
      "Переговорная",
      "Иван",
    );

    const notification = calendar.scheduleNotification(
      event.id,
      "Напоминание: важная встреча через 30 минут",
      30,
    );

    expect(notification).not.toBeNull();
    expect(notification?.id).toBe(1);
    expect(notification?.eventId).toBe(event.id);
    expect(notification?.message).toBe(
      "Напоминание: важная встреча через 30 минут",
    );
    expect(notification?.isSent).toBe(false);

    const expectedTime = new Date(startDate);
    expectedTime.setMinutes(expectedTime.getMinutes() - 30);
    expect(notification?.scheduledTime).toEqual(expectedTime);

    expect(event.notifications.length).toBe(1);
    expect(calendar.getAllNotifications().length).toBe(1);
  });

  test("Тест 7: Отправка ожидающих уведомлений", () => {
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 30);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const event = calendar.createEvent(
      "Близкое событие",
      "Описание",
      startDate,
      endDate,
      "Место",
      "Организатор",
    );

    const now = new Date();
    const notification = calendar.scheduleNotification(
      event.id,
      "Тестовое уведомление",
      30,
    );

    (calendar as any).notifications = [];
    event.notifications = [];

    const pastTime = new Date();
    pastTime.setMinutes(pastTime.getMinutes() - 5);

    const Notification = require("../src/calendar").Notification;
    const pastNotification = new Notification(
      1,
      event.id,
      "Просроченное уведомление",
      pastTime,
    );

    (calendar as any).notifications.push(pastNotification);
    event.addNotification(pastNotification);

    const pendingBefore = calendar.getPendingNotifications();
    expect(pendingBefore.length).toBe(1);
    expect(pendingBefore[0].isSent).toBe(false);

    const sentNotifications = calendar.sendPendingNotifications();

    expect(sentNotifications.length).toBe(1);
    expect(sentNotifications[0].isSent).toBe(true);
    expect(sentNotifications[0].sentTime).not.toBeNull();

    const pendingAfter = calendar.getPendingNotifications();
    expect(pendingAfter.length).toBe(0);
  });

  test("Тест 8: Фильтрация событий по статусу", () => {
    const now = new Date();

    const upcomingStart1 = new Date(now);
    upcomingStart1.setHours(upcomingStart1.getHours() + 1);
    const upcomingEnd1 = new Date(upcomingStart1);
    upcomingEnd1.setHours(upcomingEnd1.getHours() + 2);

    const upcomingStart2 = new Date(now);
    upcomingStart2.setHours(upcomingStart2.getHours() + 12);
    const upcomingEnd2 = new Date(upcomingStart2);
    upcomingEnd2.setHours(upcomingEnd2.getHours() + 2);

    const futureStart = new Date(now);
    futureStart.setDate(futureStart.getDate() + 2);
    const futureEnd = new Date(futureStart);
    futureEnd.setHours(futureEnd.getHours() + 2);

    calendar.createEvent(
      "Ближайшее 1",
      "Описание",
      upcomingStart1,
      upcomingEnd1,
      "Место",
      "Организатор",
    );
    calendar.createEvent(
      "Ближайшее 2",
      "Описание",
      upcomingStart2,
      upcomingEnd2,
      "Место",
      "Организатор",
    );
    calendar.createEvent(
      "Будущее",
      "Описание",
      futureStart,
      futureEnd,
      "Место",
      "Организатор",
    );
    const upcomingEvents = calendar.getUpcomingEvents(24);
    const allEvents = calendar.getAllEvents();

    expect(allEvents.length).toBe(3);

    expect(upcomingEvents.length).toBe(2);
    expect(upcomingEvents[0].title).toBe("Ближайшее 1");
    expect(upcomingEvents[1].title).toBe("Ближайшее 2");

    const stats = calendar.getStatistics();
    expect(stats.totalEvents).toBe(3);
    expect(stats.upcomingEvents).toBe(2);
  });
});
