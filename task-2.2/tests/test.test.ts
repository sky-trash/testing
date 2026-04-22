import { describe, beforeEach, test, expect } from "@jest/globals";
import { StreetManagement } from "../src/test";

describe("Система управления улицами города", () => {
  let management: StreetManagement;

  beforeEach(() => {
    management = new StreetManagement();
  });

  test("Тест 1: Добавление улиц", () => {
    const street1 = management.addStreet("Удмуртская");
    const street2 = management.addStreet("Ленина");

    expect(street1.id).toBe(1);
    expect(street1.name).toBe("Удмуртская");
    expect(street2.id).toBe(2);
    expect(street2.name).toBe("Ленина");

    const allStreets = management.getAllStreets();
    expect(allStreets.length).toBe(2);
  });

  test("Тест 2: Обновление улицы", () => {
    const street = management.addStreet("Удмуртская");

    const updateResult = management.updateStreet(street.id, "Удмуртская новая");

    expect(updateResult).toBe(true);
    expect(street.name).toBe("Удмуртская новая");
    expect(street.updatedAt).not.toBe(street.createdAt);
  });

  test("Тест 3: Изменение улицы", () => {
    const street = management.addStreet("Ленина");

    management.updateStreet(street.id, "Ленина новая");

    expect(street.name).toBe("Ленина новая");
    expect(management.findStreetById(street.id)?.name).toBe("Ленина новая");
  });

  test("Тест 4: Удаление улицы", () => {
    const street1 = management.addStreet("Удмуртская");
    const street2 = management.addStreet("Ленина");

    expect(management.getAllStreets().length).toBe(2);

    const deleteResult = management.deleteStreet(street1.id);

    expect(deleteResult).toBe(true);
    expect(management.getAllStreets().length).toBe(1);
    expect(management.findStreetById(street1.id)).toBeUndefined();
    expect(management.findStreetById(street2.id)).toBeDefined();
  });
});
