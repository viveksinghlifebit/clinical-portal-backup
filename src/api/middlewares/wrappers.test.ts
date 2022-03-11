import { koasify, Handler } from './wrappers'

describe('wrappers', () => {
  describe('koasify', () => {
    const ctx: Koa.Context = {
      req: {},
      res: {}
    } as any
    const handler: Handler = jest.fn().mockImplementation((_req, _res, callback) => {
      callback()
    })

    test('When called, then expect to call handler correctly.', async () => {
      await koasify(ctx, handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(ctx.req, ctx.res, expect.any(Function))
    })
  })
})
