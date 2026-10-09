import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scoreAttempt } from './scoring.js'

test('identical input scores 1 with all marks correct', () => {
  const { score, marks } = scoreAttempt('床前明月光', '  床前明月光\n')
  assert.equal(score, 1)
  assert.deepEqual(
    marks.map((m) => m.status),
    ['correct', 'correct', 'correct', 'correct', 'correct'],
  )
})

test('substituted char is marked wrong with the input char', () => {
  const { score, marks } = scoreAttempt('床前明月光', '床钱明月光')
  assert.equal(score, 0.8)
  assert.deepEqual(marks[1], { char: '前', status: 'wrong', input: '钱' })
})

test('omitted chars are marked missing', () => {
  const { score, marks } = scoreAttempt('床前明月光', '床明光')
  assert.equal(score, 0.6)
  assert.deepEqual(
    marks.map((m) => m.status),
    ['correct', 'missing', 'correct', 'missing', 'correct'],
  )
})

test('extra input chars do not shift alignment', () => {
  const { score, marks } = scoreAttempt('床前明月光', '床前啊明月光')
  assert.equal(score, 1)
  assert.equal(marks.length, 5)
})

test('truncated input marks the tail missing', () => {
  const { score, marks } = scoreAttempt('白日依山尽黄河入海流', '白日依山尽')
  assert.equal(score, 0.5)
  assert.ok(marks.slice(5).every((m) => m.status === 'missing'))
})

test('mixed wrong and missing in the same gap', () => {
  const { marks } = scoreAttempt('ABCDE', 'AXE')
  assert.deepEqual(marks, [
    { char: 'A', status: 'correct' },
    { char: 'B', status: 'wrong', input: 'X' },
    { char: 'C', status: 'missing' },
    { char: 'D', status: 'missing' },
    { char: 'E', status: 'correct' },
  ])
})

test('handles astral-plane characters as single chars', () => {
  const { score, marks } = scoreAttempt('𠀀好', '𠀀好')
  assert.equal(score, 1)
  assert.equal(marks.length, 2)
})
