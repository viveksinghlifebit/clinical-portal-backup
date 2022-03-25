declare namespace App {
  interface HttpErrorFormat {
    statusCode: import('enums').HttpStatusCodes
    code?: string
    message: string
    details?: unknown
    time: string
  }

  interface ErrorForm extends Error {
    status: import('enums').HttpStatusCodes
    message: string
    errorName?: string
    stack?: string
    query?: string
    metadata?: {
      status: import('enums').HttpStatusCodes
      errorName: string
      details: string
    }
  }
}
