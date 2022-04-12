import helmet from 'helmet';
import cors from 'cors';

import { koasify } from './wrappers';

export const koaHelmet = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const handler = helmet();
  await koasify(ctx, handler);
  await next();
};

export const koaCors = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const handler = cors();
  await koasify(ctx, handler);
  await next();
};
