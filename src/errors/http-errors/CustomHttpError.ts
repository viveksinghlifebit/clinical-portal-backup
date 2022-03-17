import AbstractHttpError from './AbstractHttpError'

class CustomHttpError extends AbstractHttpError implements App.ErrorForm {
  constructor(message: string, status: number, errorName?: string) {
    super(message, status, errorName)
    Object.setPrototypeOf(this, CustomHttpError.prototype)
  }
}

export default CustomHttpError
