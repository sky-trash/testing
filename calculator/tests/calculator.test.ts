import { Calculator } from '../src/calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  // 1: Сложение положительных чисел
  test('сложение положительных чисел должно возвращать корректную сумму', () => {
    expect(calculator.add(5, 4)).toBe(9);
    expect(calculator.add(10, 20)).toBe(30);
    expect(calculator.add(2.5, 3.7)).toBeCloseTo(6.2);
  });

  // 2: Сложение с отрицательными числами
  test('сложение с отрицательными числами должно работать корректно', () => {
    expect(calculator.add(-5, 3)).toBe(-2);
    expect(calculator.add(-10, -5)).toBe(-15);
    expect(calculator.add(5, -3)).toBe(2);
  });

  // 3: Вычитание положительных чисел
  test('вычитание положительных чисел должно возвращать корректную разность', () => {
    expect(calculator.subtract(10, 4)).toBe(6);
    expect(calculator.subtract(100, 50)).toBe(50);
    expect(calculator.subtract(7, 2.5)).toBeCloseTo(4.5);
  });

  // 4: Вычитание с отрицательными числами
  test('вычитание с отрицательными числами должно работать корректно', () => {
    expect(calculator.subtract(5, 10)).toBe(-5);
    expect(calculator.subtract(-5, -3)).toBe(-2);
    expect(calculator.subtract(-10, 5)).toBe(-15);
  });

  // 5: Умножение положительных чисел
  test('умножение положительных чисел должно возвращать корректное произведение', () => {
    expect(calculator.multiply(4, 5)).toBe(20);
    expect(calculator.multiply(2.5, 4)).toBe(10);
    expect(calculator.multiply(3, 3)).toBe(9);
  });

  // 6: Умножение с отрицательными числами и нулем
  test('умножение должно корректно обрабатывать отрицательные числа и ноль', () => {
    expect(calculator.multiply(-4, 5)).toBe(-20);
    expect(calculator.multiply(-3, -2)).toBe(6);
    expect(calculator.multiply(5, 0)).toBe(0);      // Умножение на 0
    expect(calculator.multiply(0, 5)).toBe(0);      // Умножение на 0
    expect(calculator.multiply(0, 0)).toBe(0);      // Ноль на ноль
  });

  // 7: Деление положительных и отрицательных чисел
  test('деление должно корректно работать с положительными и отрицательными числами', () => {
    expect(calculator.divide(10, 2)).toBe(5);
    expect(calculator.divide(15, 3)).toBe(5);
    expect(calculator.divide(7, 2)).toBe(3.5);
    expect(calculator.divide(-10, 2)).toBe(-5);
    expect(calculator.divide(10, -2)).toBe(-5);
    expect(calculator.divide(-15, -3)).toBe(5);
  });

  // 8: Деление с нулем
  test('деление должно корректно обрабатывать ноль', () => {
    expect(calculator.divide(0, 5)).toBe(0);        // Деление нуля на число
    expect(() => calculator.divide(10, 0)).toThrow("Деление на ноль невозможно");  // Деление на ноль
    expect(() => calculator.divide(0, 0)).toThrow("Деление на ноль невозможно");   // Деление нуля на ноль
  });
});