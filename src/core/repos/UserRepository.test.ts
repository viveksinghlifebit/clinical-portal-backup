import { Types } from 'mongoose';
import * as connection from 'services/mongoose/connections';

import { UserRepository } from './index';

describe('UserRepository', () => {
  afterAll(jest.restoreAllMocks);

  describe('findById', () => {
    it('should not return any user if _id mismatches with the user saved in DB', async () => {
      await expect(UserRepository.findById(new Types.ObjectId().toHexString())).resolves.toBe(null);
    });

    it('should return the user with matching Id from the database', async () => {
      const user = {
        _id: new Types.ObjectId()
      };
      await connection.usersConnection.collection('users').insertOne(user);

      await expect(UserRepository.findById(user._id.toHexString())).resolves.toMatchObject(user);

      await connection.usersConnection.collection('users').deleteOne({ _id: user._id });
    });

    it('should return the user with matching Id and only the projected items from the user from the database', async () => {
      const user = {
        _id: new Types.ObjectId(),
        password: 'test'
      };
      await connection.usersConnection.collection('users').insertOne(user);

      await expect(UserRepository.findById(user._id.toHexString(), { password: 0 })).resolves.toMatchObject({
        _id: user._id
      });

      await connection.usersConnection.collection('users').deleteOne({ _id: user._id });
    });
  });

  describe('findOne', () => {
    it('should return the user with matching attribute from the database', async () => {
      const user = {
        _id: new Types.ObjectId(),
        name: 'test'
      };
      await connection.usersConnection.collection('users').insertOne(user);

      await expect(UserRepository.findOne({ name: 'test' })).resolves.toMatchObject(user);

      await connection.usersConnection.collection('users').deleteOne({ _id: user._id });
    });
  });

  describe('find', () => {
    it('should return the all the users if {} is passed as arguments', async () => {
      const users = [
        {
          _id: new Types.ObjectId(),
          name: 'test-1'
        },
        {
          _id: new Types.ObjectId(),
          name: 'test-2'
        }
      ];
      await connection.usersConnection.collection('users').insertMany(users);

      await expect(UserRepository.find({})).resolves.toMatchObject(users);

      await connection.usersConnection.collection('users').deleteMany({ _id: { $in: users.map(({ _id }) => _id) } });
    });
  });

  describe('getUserIdsByTerm', () => {
    it('should return the all the users if {} is passed as arguments', async () => {
      const users = [
        {
          _id: new Types.ObjectId(),
          name: 'select-1'
        },
        {
          _id: new Types.ObjectId(),
          name: 'select-1',
          surname: 'select-2'
        },
        {
          _id: new Types.ObjectId(),
          name: 'nopick-1',
          surname: 'nopick-3'
        }
      ];
      await connection.usersConnection.collection('users').insertMany(users);

      await expect(UserRepository.getUserIdsByTerm('select')).resolves.toMatchObject([users[0]?._id, users[1]?._id]);

      await connection.usersConnection.collection('users').deleteMany({ _id: { $in: users.map(({ _id }) => _id) } });
    });
  });
});
