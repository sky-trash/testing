import { describe, beforeEach, test, expect } from "@jest/globals";
import { VotingSystem, Poll, Option } from "../src/voting";

describe("Voting System Tests", () => {
  let votingSystem: VotingSystem;

  beforeEach(() => {
    votingSystem = new VotingSystem();
  });

  test("Тест 1: Создание опроса", () => {
    const question = "Какой язык программирования лучше?";
    const options = ["TypeScript", "Python", "Java", "C++"];

    const poll = votingSystem.createPoll(question, options);

    expect(poll.id).toBe(1);
    expect(poll.question).toBe(question);
    expect(poll.options.length).toBe(4);
    expect(poll.isActive).toBe(true);
    expect(poll.votedUsers.size).toBe(0);

    expect(poll.options[0].text).toBe("TypeScript");
    expect(poll.options[1].text).toBe("Python");
    expect(poll.options[2].text).toBe("Java");
    expect(poll.options[3].text).toBe("C++");

    poll.options.forEach((opt) => {
      expect(opt.votes).toBe(0);
    });
  });

  test("Тест 2: Создание опроса с ошибкой (меньше 2 вариантов)", () => {
    expect(() => {
      votingSystem.createPoll("Плохой опрос", ["Только один вариант"]);
    }).toThrow("Опрос должен содержать минимум 2 варианта ответа");
  });

  test("Тест 3: Голосование в опросе", () => {
    const poll = votingSystem.createPoll("Любимый цвет?", [
      "Красный",
      "Синий",
      "Зеленый",
    ]);

    const voteResult1 = votingSystem.voteInPoll(poll.id, 1, "user123");
    const voteResult2 = votingSystem.voteInPoll(poll.id, 2, "user456");
    const voteResult3 = votingSystem.voteInPoll(poll.id, 1, "user789");

    expect(voteResult1).toBe(true);
    expect(voteResult2).toBe(true);
    expect(voteResult3).toBe(true);

    expect(poll.options[0].votes).toBe(2);
    expect(poll.options[1].votes).toBe(1);
    expect(poll.options[2].votes).toBe(0);

    expect(poll.getTotalVotes()).toBe(3);
    expect(poll.votedUsers.size).toBe(3);
  });

  test("Тест 4: Запрет повторного голосования одним пользователем", () => {
    const poll = votingSystem.createPoll("Опрос", ["Вариант 1", "Вариант 2"]);

    const firstVote = votingSystem.voteInPoll(poll.id, 1, "user123");
    expect(firstVote).toBe(true);

    const secondVote = votingSystem.voteInPoll(poll.id, 2, "user123");

    expect(secondVote).toBe(false);
    expect(poll.options[0].votes).toBe(1);
    expect(poll.options[1].votes).toBe(0);
    expect(poll.votedUsers.size).toBe(1);
  });

  test("Тест 5: Голосование за несуществующий вариант", () => {
    const poll = votingSystem.createPoll("Опрос", ["Вариант 1", "Вариант 2"]);

    const voteResult = votingSystem.voteInPoll(poll.id, 999, "user123");

    expect(voteResult).toBe(false);
    expect(poll.getTotalVotes()).toBe(0);
  });

  test("Тест 6: Закрытие опроса и запрет голосования", () => {
    const poll = votingSystem.createPoll("Опрос", ["Да", "Нет"]);

    expect(votingSystem.voteInPoll(poll.id, 1, "user1")).toBe(true);

    const closeResult = votingSystem.closePoll(poll.id);
    expect(closeResult).toBe(true);
    expect(poll.isActive).toBe(false);

    const voteAfterClose = votingSystem.voteInPoll(poll.id, 2, "user2");
    expect(voteAfterClose).toBe(false);
    expect(poll.getTotalVotes()).toBe(1);
  });

  test("Тест 7: Получение результатов опроса", () => {
    const poll = votingSystem.createPoll("Язык программирования", [
      "TypeScript",
      "Python",
      "Java",
    ]);

    votingSystem.voteInPoll(poll.id, 1, "user1");
    votingSystem.voteInPoll(poll.id, 1, "user2");
    votingSystem.voteInPoll(poll.id, 2, "user3");
    votingSystem.voteInPoll(poll.id, 3, "user4");
    votingSystem.voteInPoll(poll.id, 3, "user5");

    const results = poll.getResults();

    expect(results).toEqual([
      { optionId: 1, text: "TypeScript", votes: 2 },
      { optionId: 2, text: "Python", votes: 1 },
      { optionId: 3, text: "Java", votes: 2 },
    ]);

    expect(poll.getTotalVotes()).toBe(5);
  });

  test("Тест 8: Определение победителя", () => {
    const poll = votingSystem.createPoll("Лучший фрукт", [
      "Яблоко",
      "Банан",
      "Апельсин",
    ]);

    votingSystem.voteInPoll(poll.id, 1, "user1");
    votingSystem.voteInPoll(poll.id, 1, "user2");
    votingSystem.voteInPoll(poll.id, 2, "user3");
    votingSystem.voteInPoll(poll.id, 3, "user4");

    const winner = poll.getWinner();

    expect(winner).toEqual({
      optionId: 1,
      text: "Яблоко",
      votes: 2,
    });
  });

  test("Тест 9: Определение победителя при ничьей", () => {
    const poll = votingSystem.createPoll("Ничья", ["Вариант A", "Вариант B"]);

    votingSystem.voteInPoll(poll.id, 1, "user1");
    votingSystem.voteInPoll(poll.id, 2, "user2");

    const winner = poll.getWinner();

    expect(winner?.votes).toBe(1);
    expect(winner?.optionId === 1 || winner?.optionId === 2).toBe(true);
  });

  test("Тест 10: Победитель отсутствует (нет голосов)", () => {
    const poll = votingSystem.createPoll("Пустой опрос", [
      "Вариант 1",
      "Вариант 2",
    ]);

    const winner = poll.getWinner();

    expect(winner).toBeNull();
  });

  test("Тест 11: Получение фильтрованных списков опросов", () => {
    const poll1 = votingSystem.createPoll("Активный опрос 1", ["A", "B"]);
    const poll2 = votingSystem.createPoll("Активный опрос 2", ["A", "B"]);
    const poll3 = votingSystem.createPoll("Закрытый опрос", ["A", "B"]);

    votingSystem.closePoll(poll3.id);

    const allPolls = votingSystem.getAllPolls();
    const activePolls = votingSystem.getActivePolls();
    const closedPolls = votingSystem.getClosedPolls();

    expect(allPolls.length).toBe(3);
    expect(activePolls.length).toBe(2);
    expect(closedPolls.length).toBe(1);

    expect(activePolls[0].id).toBe(poll1.id);
    expect(activePolls[1].id).toBe(poll2.id);
    expect(closedPolls[0].id).toBe(poll3.id);
  });

  test("Тест 12: Удаление опроса", () => {
    votingSystem.createPoll("Опрос 1", ["A", "B"]);
    votingSystem.createPoll("Опрос 2", ["A", "B"]);
    const pollToDelete = votingSystem.createPoll("Опрос 3", ["A", "B"]);

    expect(votingSystem.getAllPolls().length).toBe(3);

    const deleteResult = votingSystem.deletePoll(pollToDelete.id);

    expect(deleteResult).toBe(true);
    expect(votingSystem.getAllPolls().length).toBe(2);
    expect(votingSystem.findPollById(pollToDelete.id)).toBeUndefined();
  });

  test("Тест 13: Негативные сценарии", () => {
    const nonExistentId = 999;

    expect(votingSystem.findPollById(nonExistentId)).toBeUndefined();
    expect(votingSystem.voteInPoll(nonExistentId, 1, "user123")).toBe(false);
    expect(votingSystem.closePoll(nonExistentId)).toBe(false);
    expect(votingSystem.deletePoll(nonExistentId)).toBe(false);
  });

  test("Тест 14: Автоматическое присвоение ID опросам", () => {
    const poll1 = votingSystem.createPoll("Опрос 1", ["A", "B"]);
    const poll2 = votingSystem.createPoll("Опрос 2", ["A", "B"]);
    const poll3 = votingSystem.createPoll("Опрос 3", ["A", "B"]);

    expect(poll1.id).toBe(1);
    expect(poll2.id).toBe(2);
    expect(poll3.id).toBe(3);
  });
});