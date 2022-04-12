import { NumberUtils } from './numberUtils';

describe('Number Utils: Testing castToNumberIfPossible()', () => {
  test('when string input represents an integer, we get the integer back', (done) => {
    expect(NumberUtils.castToNumberIfPossible('10')).toBe(10);
    done();
  });

  test('when string input does not represent an integer, we get the string back', (done) => {
    expect(NumberUtils.castToNumberIfPossible('foo')).toBe('foo');
    done();
  });

  test('when string input is empty, we get an empty string back', (done) => {
    expect(NumberUtils.castToNumberIfPossible('')).toBe('');
    done();
  });

  test('when string input is null, we get a null back', (done) => {
    expect(NumberUtils.castToNumberIfPossible((null as unknown) as string)).toBeNull();
    done();
  });

  test('when string input is undefined, we get an undefined back', (done) => {
    expect(NumberUtils.castToNumberIfPossible((undefined as unknown) as string)).toBeUndefined();
    done();
  });
});

describe('Number Utils: Testing average()', () => {
  test('when numbers provided', (done) => {
    expect(NumberUtils.average([10, 20])).toBe(15);
    done();
  });

  test('when numbers provided', (done) => {
    expect(NumberUtils.average([])).toBe(0);
    done();
  });

  test('when numbers provided', (done) => {
    expect(NumberUtils.average([1, -1])).toBe(0);
    done();
  });
});

describe('Number Utils: isNumeric', () => {
  test('should return true if number is passed', () => {
    expect(NumberUtils.isNumeric(1)).toBeTruthy();
  });

  test('should return true if number is passed', () => {
    expect(NumberUtils.isNumeric('1')).toBeTruthy();
  });

  test('should return true if number is passed', () => {
    expect(NumberUtils.isNumeric('abcd')).toBeFalsy();
  });
});
