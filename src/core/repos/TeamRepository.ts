import * as connection from 'services/mongoose/connections';
import { Types } from 'mongoose';

export class TeamRepository {
  static findById(id: string): Promise<Team> {
    return connection.usersConnection.collection('teams').findOne({ _id: new Types.ObjectId(id) }) as Promise<Team>;
  }

  static findOne(criteria: { [key: string]: unknown }): Promise<Team> {
    return connection.usersConnection.collection('teams').findOne(criteria) as Promise<Team>;
  }

  static find(criteria: Mongoose.QueryConditions): Promise<Team[]> {
    return connection.usersConnection.collection('teams').find(criteria).toArray() as Promise<Team[]>;
  }
}
