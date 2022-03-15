import { koasify } from './wrappers'
import { koaHelmet, koaCors } from './security'

jest.mock('./wrappers', () => ({
  koasify: jest.fn().mockResolvedValue({})
}))

describe('request', () => {
  afterEach(jest.resetAllMocks)

  describe('koaHelmet', () => {
    const ctx: Koa.Context = ({} as unknown) as Koa.Context
    const next = jest.fn().mockResolvedValue({})

    afterEach(jest.resetAllMocks)

    test('When called, then expect to koasify the handler correctly.', async () => {
      await koaHelmet(ctx, next)
      expect(koasify).toHaveBeenCalledTimes(1)
      expect(koasify).toHaveBeenCalledWith(ctx, expect.any(Function))
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('koaCors', () => {
    const ctx: Koa.Context = ({} as unknown) as Koa.Context
    const next = jest.fn().mockResolvedValue({})

    afterEach(jest.resetAllMocks)

    test('When called, then expect to koasify the handler correctly.', async () => {
      await koaCors(ctx, next)
      expect(koasify).toHaveBeenCalledTimes(1)
      expect(koasify).toHaveBeenCalledWith(ctx, expect.any(Function))
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
