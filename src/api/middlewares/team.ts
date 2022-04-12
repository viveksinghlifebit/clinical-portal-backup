import _ from 'lodash';
import { log as logger } from 'services/log';
import { TeamRepository } from '@core/repos';
import config from 'config';
import { ForbiddenHttpError } from 'errors/http-errors';

type Middleware = (ctx: Koa.Context) => Promise<void>;
/**
 * @param {Object} req - Express request.
 * @returns {string} Team id.
 */
export const getTeamIdFromRequest = (ctx: Koa.Context): string | null => {
  return _.get(ctx, 'params.teamId') || _.get(ctx, 'query.teamId') || null;
};

/**
 * Executes given sequence of express middleware only if team is specified in the request,
 * otherwise does nothing.
 * @param {Function[]} middleware - Express middleware functions.
 */
export const ifTeamSpecifiedDo = (middlewares: Middleware[] | Middleware[][]) => async (
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> => {
  if (!getTeamIdFromRequest(ctx)) {
    await next();
  } else {
    const flatMiddleware = middlewares.flatMap((mid) => mid);
    for await (const middlewares of flatMiddleware) {
      await middlewares(ctx);
    }
    await next();
  }
};

/**
 * Expects team id to be specified in the request.
 * Fetches team and sets it in express req object as .team.
 * Responds with 403 if team id is not specified or if team does not exist.
 */
export const getTeam = async (ctx: Koa.Context): Promise<void> => {
  const teamId = getTeamIdFromRequest(ctx);
  if (!teamId) {
    logger.debug('Team ID is missing.');
    throw new ForbiddenHttpError('Team ID is forbidden');
  }
  const team = await TeamRepository.findById(teamId);
  if (!team) {
    logger.debug(`Team is not existing ${teamId}.`);
    throw new ForbiddenHttpError('Team ID is forbidden');
  }

  ctx.team = team;
};

/**
 * Expects req.team to be set. Responds with 403 if team is not active.
 */
export const checkTeamIsActive = async (ctx: Koa.Context): Promise<void> => {
  const team = ctx.team;
  if (!team) throw Error('This middleware expects req.team to be set.');
  if (team.deactivated) {
    throw new ForbiddenHttpError('TeamId is not allowed');
  }
};

/**
 * Express middleware, expects req.user.id and team id to be set.
 * Responds with 403 if team or membership don't exist or are not active.
 */
export const getTeamAndTeamMembershipAndCheckTheyAreActive = [getTeam, checkTeamIsActive];

/**
 * Expects req.team to be set. Responds with 403 if team is not admin.
 */
export const checkTeamIsAdmin = async (ctx: Koa.Context): Promise<void> => {
  const team = ctx.team;
  if (!team) throw Error('This middleware expects req.team to be set.');
  if (team._id.toString() !== config.adminTeamId) {
    throw new ForbiddenHttpError('TeamId is not allowed');
  }
};
