/**
 * In this module we define custom errors to use throughout the api-server.
 * Most of the ideas for this we got from this blog post:
 *   https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87.
 * NOTE(martin): implementing it like this, with classes and extending, currently relies on the
 *   babel-plugin-transform-builtin-extend plugin. In the future, when we update our babel and
 *   switch to babel-preset-env, this will not be needed anymore.
 */

/**
 * Main custom error. We should extend all our custom errors from this base error or
 *   from its children.
 */
export class DeploitError extends Error {
  public code: number | undefined
  constructor(message?: string, code?: number) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    Error.captureStackTrace(this, DeploitError)
  }
}

export class IllegalArgumentError extends DeploitError {}

export class DuplicateResourceError extends DeploitError {}

export class InvalidStateError extends DeploitError {}

export class ResourceNotFoundError extends DeploitError {}

export class UnauthorizedAccessError extends DeploitError {}

export class ParseError extends DeploitError {}

export class FileNotFoundError extends DeploitError {}

export class NetworkError extends DeploitError {}

export class OutboundBadRequestError extends DeploitError {}

export class QueryOutOfRangeError extends DeploitError {}

export class NotImplementedError extends DeploitError {
  constructor() {
    super()
    this.message = 'Not implemented.'
  }
}
