import { koasify, Handler } from './wrappers';

describe('wrappers', () => {
  describe('koasify', () => {
    const ctx: Koa.Context = ({
      req: {},
      res: {}
    } as unknown) as Koa.Context;

    test('When called, then expect to call handler correctly.', async () => {
      const handler: Handler = jest.fn().mockImplementation((_req, _res, callback) => {
        callback();
      });
      await koasify(ctx, handler);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(ctx.req, ctx.res, expect.any(Function));
    });

    test('When called, then expect to call handler correctly.', async () => {
      const handler: Handler = jest.fn().mockImplementation((_req, _res, callback) => {
        callback('error');
      });
      await expect(koasify(ctx, handler)).rejects.toMatch('error');
    });
  });
});
