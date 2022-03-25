/**
 * TODO - Remove this file once we have the gateway in-place
 */
import config from 'config'
import { UnauthorizedHttpError } from 'errors/http-errors'
import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalAPIKeyStrategy } from 'passport-localapikey-update'

import { UserRepository } from '@core/repos'
import { log } from 'services/log'

const getAuthenticatedUser = async (authStrategies: string[], ctx: Koa.Context, next: Koa.Next): Promise<User> => {
  let user = null
  for (let i = 0; i < authStrategies.length && !user; i++) {
    const authStrategy = authStrategies[i] as string

    if (authStrategy === 'public') {
      return next()
    }

    try {
      user = await new Promise((resolve, reject) => {
        passport.authenticate(authStrategy, { session: false }, (err, authenticatedUser: User) => {
          return err || !authenticatedUser ? reject(err) : resolve(authenticatedUser)
        })(ctx.request)
      })
    } catch (error) {
      log.error(error)
    }
  }

  if (!user) {
    throw new UnauthorizedHttpError()
  }
  return user as User
}
export const auth = (authStrategies: string[]) => async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  try {
    if (!(authStrategies && authStrategies.length > 0)) {
      throw Error('Error: No auth strategies were provided!')
    }
    const user = await getAuthenticatedUser(authStrategies, ctx, next)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.user = user
    await next()
  } catch (error) {
    log.error(error)
    throw error
  }
}

passport.use(
  'token',
  new JwtStrategy(
    {
      secretOrKey: config.jwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('access_token'),
        ExtractJwt.fromBodyField('access_token'),
        ExtractJwt.fromAuthHeaderWithScheme('Bearer')
      ])
    },
    async ({ id }, done) => {
      UserRepository.findById(id)
        .then((user) => {
          done(null, user)
          return null
        })
        .catch(done)
    }
  )
)

passport.use(
  'apikey',
  new LocalAPIKeyStrategy(async (apikey, done) => {
    try {
      const user = await UserRepository.findOne({ privateLifebitApiKey: apikey })
      return done(null, user || false)
    } catch (error) {
      return done(error)
    }
  })
)
