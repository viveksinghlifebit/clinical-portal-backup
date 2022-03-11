import { HttpStatusCodes } from 'enums'

abstract class AbstractHttpError extends Error implements App.ErrorForm {
  status: HttpStatusCodes
  message: string
  errorName?: string
  details?: any
  constructor(message: string, status: number, errorName?: string, details?: any) {
    super(message)
    this.status = status
    this.message = message
    this.errorName = errorName
    this.details = details
    Object.setPrototypeOf(this, AbstractHttpError.prototype)
  }
}
export default AbstractHttpError
