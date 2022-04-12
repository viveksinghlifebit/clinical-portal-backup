import { HttpMethods } from 'enums';

interface PostHealthRequestBody {
  status: string;
}

const getHealth: App.EndpointOperation = (ctx: Koa.ParameterizedContext<App.State, App.Context>) => {
  ctx.body = { status: 'ok' };
};

const postHealth: App.EndpointOperation = (
  ctx: Koa.ParameterizedContext<App.State, App.Context<PostHealthRequestBody>>
) => {
  const { status } = ctx.request.body;

  ctx.body = { status };
};

export const routes: App.EndpointsInfo = {
  getHealth: {
    method: HttpMethods.Get,
    path: '/health',
    operation: getHealth,
    middlewares: [],
    postMiddlewares: []
  },
  postHealth: {
    method: HttpMethods.Post,
    path: '/health',
    operation: postHealth,
    middlewares: [],
    postMiddlewares: []
  }
};
