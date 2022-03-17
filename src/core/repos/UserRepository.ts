import * as connection from 'services/mongoose/connections'
import { Types } from 'mongoose'
export class UserRepository {
  static findById(id: string, projection?: Mongoose.ProjectConditions): Promise<User | null> {
    return connection.usersConnection
      .collection('users')
      .findOne({ _id: new Types.ObjectId(id) }, { projection }) as Promise<User>
  }

  static async findOne(criteria: { [key: string]: unknown }): Promise<User> {
    return (await connection.usersConnection.collection('users').findOne(criteria)) as User
  }

  static async find(criteria: Mongoose.QueryConditions): Promise<User[]> {
    return (await connection.usersConnection.collection('users').find(criteria).toArray()) as User[]
  }

  /**
   * Returns users ids searching by name or surname
   *
   * @param  {string} term
   * @returns Promise<string[]>
   */

  static async getUserIdsByTerm(term: string): Promise<Mongoose.ObjectId[]> {
    const users = (await connection.usersConnection
      .collection('users')
      .find({
        $or: [{ name: new RegExp(term, 'i') }, { surname: new RegExp(term, 'i') }]
      })
      .toArray()) as User[]
    return users.map((it) => it._id) as Mongoose.ObjectId[]
  }
}
