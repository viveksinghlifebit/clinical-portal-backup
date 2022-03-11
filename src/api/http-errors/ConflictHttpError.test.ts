import { HttpStatusCodes } from 'enums'

import ConflictHttpError from './ConflictHttpError'

describe('ConflictHttpError', () => {
  test('Should correctly create an instance of ConflictHttpError', () => {
    const message = 'Test ConflictHttpError message'
    const conflictHttpError = new ConflictHttpError(message)
    expect(conflictHttpError).toBeInstanceOf(ConflictHttpError)
    expect(conflictHttpError.status).toEqual(HttpStatusCodes.Conflict)
    expect(conflictHttpError.errorName).toEqual(HttpStatusCodes[HttpStatusCodes.Conflict])
    expect(conflictHttpError.message).toEqual(message)
  })
})
