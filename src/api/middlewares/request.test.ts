import { koasify } from './wrappers'
import { koaMorgan } from './request'

jest.mock('./wrappers', () => ({
  koasify: jest.fn().mockResolvedValue({})
}))

describe('request', () => {
  afterEach(jest.resetAllMocks)

  describe('koaMorgan', () => {
    const ctx: Koa.Context = {} as any
    const next = jest.fn().mockResolvedValue({})

    afterEach(jest.resetAllMocks)

    test('When called, then expect to koasify the handler correctly.', async () => {
      await koaMorgan(ctx, next)
      expect(koasify).toHaveBeenCalledTimes(1)
      expect(koasify).toHaveBeenCalledWith(ctx, expect.any(Function))
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
