import * as connections from './connections'

export const init = async (mongoMulti: Mongoose.Multi): Promise<void> => {
  await connections.init(mongoMulti)
}
