export class Event {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizer: string;
  attendees: string[];
  notifications: Notification[];

  constructor(
    id: number,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
    organizer: string,
  ) {
    if (endDate <= startDate) {
      throw new Error("Дата окончания должна быть позже даты начала");
    }

    this.id = id;
    this.title = title;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.organizer = organizer;
    this.attendees = [];
    this.notifications = [];
  }

  addAttendee(attendee: string): void {
    if (!this.attendees.includes(attendee)) {
      this.attendees.push(attendee);
    }
  }

  removeAttendee(attendee: string): boolean {
    const index = this.attendees.indexOf(attendee);
    if (index === -1) return false;
    this.attendees.splice(index, 1);
    return true;
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
  }

  isUpcoming(hours: number = 24): boolean {
    const now = new Date();
    const msUntilStart = this.startDate.getTime() - now.getTime();
    const hoursUntilStart = msUntilStart / (1000 * 60 * 60);
    return hoursUntilStart > 0 && hoursUntilStart <= hours;
  }

  isOngoing(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  isPast(): boolean {
    const now = new Date();
    return now > this.endDate;
  }
}

export class Notification {
  id: number;
  eventId: number;
  message: string;
  scheduledTime: Date;
  isSent: boolean;
  sentTime: Date | null;

  constructor(
    id: number,
    eventId: number,
    message: string,
    scheduledTime: Date,
  ) {
    this.id = id;
    this.eventId = eventId;
    this.message = message;
    this.scheduledTime = scheduledTime;
    this.isSent = false;
    this.sentTime = null;
  }

  markAsSent(): void {
    this.isSent = true;
    this.sentTime = new Date();
  }
}

export class EventCalendar {
  private events: Event[] = [];
  private notifications: Notification[] = [];

  private nextEventId: number = 1;
  private nextNotificationId: number = 1;

  createEvent(
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
    organizer: string,
  ): Event {
    if (!title || title.trim().length === 0) {
      throw new Error("Название события не может быть пустым");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Описание события не может быть пустым");
    }
    if (!location || location.trim().length === 0) {
      throw new Error("Место проведения не может быть пустым");
    }
    if (!organizer || organizer.trim().length === 0) {
      throw new Error("Организатор не может быть пустым");
    }
    if (startDate < new Date()) {
      throw new Error("Дата начала не может быть в прошлом");
    }

    const event = new Event(
      this.nextEventId++,
      title,
      description,
      startDate,
      endDate,
      location,
      organizer,
    );
    this.events.push(event);
    return event;
  }

  findEventById(eventId: number): Event | undefined {
    return this.events.find((event) => event.id === eventId);
  }

  getAllEvents(): Event[] {
    return [...this.events];
  }

  getUpcomingEvents(hours: number = 24): Event[] {
    return this.events.filter((event) => event.isUpcoming(hours));
  }

  getOngoingEvents(): Event[] {
    return this.events.filter((event) => event.isOngoing());
  }

  getPastEvents(): Event[] {
    return this.events.filter((event) => event.isPast());
  }

  getEventsByDate(date: Date): Event[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.events.filter(
      (event) => event.startDate >= targetDate && event.startDate < nextDay,
    );
  }

  getEventsByOrganizer(organizer: string): Event[] {
    return this.events.filter((event) => event.organizer === organizer);
  }

  updateEvent(
    eventId: number,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
  ): boolean {
    const event = this.findEventById(eventId);
    if (!event) return false;

    if (endDate <= startDate) {
      throw new Error("Дата окончания должна быть позже даты начала");
    }

    event.title = title;
    event.description = description;
    event.startDate = startDate;
    event.endDate = endDate;
    event.location = location;
    return true;
  }

  deleteEvent(eventId: number): boolean {
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index === -1) return false;

    this.events.splice(index, 1);
    this.notifications = this.notifications.filter(
      (n) => n.eventId !== eventId,
    );
    return true;
  }

  addAttendeeToEvent(eventId: number, attendee: string): boolean {
    const event = this.findEventById(eventId);
    if (!event) return false;

    event.addAttendee(attendee);
    return true;
  }

  removeAttendeeFromEvent(eventId: number, attendee: string): boolean {
    const event = this.findEventById(eventId);
    if (!event) return false;

    return event.removeAttendee(attendee);
  }

  getEventAttendees(eventId: number): string[] | null {
    const event = this.findEventById(eventId);
    if (!event) return null;

    return [...event.attendees];
  }

  scheduleNotification(
    eventId: number,
    message: string,
    minutesBefore: number,
  ): Notification | null {
    const event = this.findEventById(eventId);
    if (!event) return null;

    const scheduledTime = new Date(event.startDate);
    scheduledTime.setMinutes(scheduledTime.getMinutes() - minutesBefore);

    if (scheduledTime < new Date()) {
      throw new Error("Нельзя запланировать уведомление на прошедшее время");
    }

    const notification = new Notification(
      this.nextNotificationId++,
      eventId,
      message,
      scheduledTime,
    );

    this.notifications.push(notification);
    event.addNotification(notification);
    return notification;
  }

  getPendingNotifications(): Notification[] {
    const now = new Date();
    return this.notifications.filter(
      (n) => !n.isSent && n.scheduledTime <= now,
    );
  }

  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  getNotificationsForEvent(eventId: number): Notification[] {
    return this.notifications.filter((n) => n.eventId === eventId);
  }

  sendPendingNotifications(): Notification[] {
    const pending = this.getPendingNotifications();
    pending.forEach((notification) => notification.markAsSent());
    return pending;
  }

  checkUpcomingEventsAndNotify(hours: number = 24): Notification[] {
    const upcomingEvents = this.getUpcomingEvents(hours);
    const newNotifications: Notification[] = [];

    upcomingEvents.forEach((event) => {
      const message = `Напоминание: событие "${event.title}" начнется через ${hours} часов`;

      try {
        const notification = this.scheduleNotification(
          event.id,
          message,
          hours * 60,
        );
        if (notification) {
          newNotifications.push(notification);
        }
      } catch (error) {
      }
    });

    return newNotifications;
  }

  getStatistics() {
    return {
      totalEvents: this.events.length,
      upcomingEvents: this.getUpcomingEvents(24).length,
      ongoingEvents: this.getOngoingEvents().length,
      pastEvents: this.getPastEvents().length,
      totalNotifications: this.notifications.length,
      pendingNotifications: this.getPendingNotifications().length,
    };
  }
}
