const sum = require('../sum')

describe('sum function', () => {
  test('simple calc', () => {
    expect(sum(1, 2)).toBe(3)
  })

  test('simple calc with negative number', () => {
    expect(sum(-10, 6)).toBe(-4)
  })
})
