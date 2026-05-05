import { describe, expect, it } from 'vitest'
import { hello } from '../src/index'

describe('hello', () => {
  it('greets the given name', () => {
    expect(hello('world')).toBe('Hello, world!')
  })
})
