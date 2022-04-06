import { IllegalArgumentError } from 'errors'
import { SequenceIdSchema } from '@schemas'

export const sequenceIdModelName = 'SequenceId'

/**
 * MODEL STATICS
 */

export async function getNextByName(name: SequenceId.SequenceIdNames): Promise<SequenceId.Document> {
  const sequenceId = await SequenceId.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, runValidators: true }
  )
  if (!sequenceId) throw new IllegalArgumentError(`sequenceId ${name} not found`)
  return sequenceId
}

export async function getOrCreateNextByName(name: Patient.Attributes['i']): Promise<SequenceId.Document> {
  return SequenceId.findOneAndUpdate({ name }, { $inc: { value: 1 } }, { new: true, runValidators: true, upsert: true })
}

SequenceIdSchema.statics = {
  getNextByName,
  getOrCreateNextByName
}

/**
 * MODEL METHODS
 */
export function toPadString(this: SequenceId.Document, size?: number): string {
  return `${this.prefix || ''}${String(this.value || '').padStart(size || 7, '0')}`
}

SequenceIdSchema.methods = {
  toPadString
}

/**
 * MODEL INITIALIZATION
 */

export let SequenceId: SequenceId.Model

export const init = (connection: Mongoose.Connection): void => {
  SequenceId = connection.model<SequenceId.Document, SequenceId.Model>(sequenceIdModelName, SequenceIdSchema)
}
