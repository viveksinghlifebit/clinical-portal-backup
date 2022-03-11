declare namespace App {
  interface HttpErrorFormat {
    statusCode: import('enums').HttpStatusCodes
    code?: string
    message: string
    details?: any
    time: string
  }

  interface ErrorForm extends Error {
    status: import('enums').HttpStatusCodes
    message: string
    errorName?: string
    stack?: string
    query?: string
  }
}
