import { getMockedMongoQueryInstance } from 'testUtils';
import { Role } from '@core/models';
import { RoleService } from './role.controller';

describe('Role', () => {
  const dummyRole = {
    name: 'test',
    displayName: 'test',
    permissions: [
      {
        name: 'individualBrowserWorkGroup',
        access: { read: true, create: false, update: false, delete: false }
      }
    ]
  };
  describe('listRolesPaginated', () => {
    const mockRole = (value: unknown): void => {
      Role.find = jest.fn().mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => [value]
          })
        })
      });
    };
    afterEach(jest.clearAllMocks);

    test('When called, then it should call the proper methods.', async () => {
      const mongoQuery = getMockedMongoQueryInstance();
      const pagination = {
        pageNumber: 2,
        pageSize: 10,
        sort: 'createdAt 1'
      };
      mockRole({ view: () => dummyRole });
      const result = await RoleService.listRolesPaginated({ pagination });
      expect(mongoQuery.withSort).toHaveBeenCalledWith(pagination.sort);
      expect(mongoQuery.withPagination).toHaveBeenCalledWith(pagination.pageNumber, pagination.pageSize);
      expect(mongoQuery.compile).toHaveBeenCalled();
      expect(Role.find).toHaveBeenCalled();
      expect(Role.find).toHaveBeenCalledWith({});
      expect(result.data).toMatchObject([dummyRole]);
    });
  });

  describe('updateRole', () => {
    const mockRole = (value: unknown): void => {
      Role.findOneAndUpdate = jest.fn().mockReturnValue(value);
    };
    afterEach(jest.clearAllMocks);

    test('When called, then it should call the proper methods.', async () => {
      mockRole(dummyRole);
      const result = await RoleService.updateRole({ role: dummyRole });
      expect(Role.findOneAndUpdate).toHaveBeenCalled();
      expect(Role.findOneAndUpdate).toHaveBeenCalledWith({ name: dummyRole.name }, { $set: dummyRole });
      expect(result).toMatchObject(dummyRole);
    });
  });

  describe('createRole', () => {
    const mockRole = (value: unknown): void => {
      Role.create = jest.fn().mockReturnValue({
        view: () => value
      });
    };
    afterEach(jest.clearAllMocks);

    test('When called, then it should call the proper methods.', async () => {
      mockRole(dummyRole);
      const result = await RoleService.createRole({ role: dummyRole });
      expect(Role.create).toHaveBeenCalled();
      expect(Role.create).toHaveBeenCalledWith(dummyRole);
      expect(result).toMatchObject(dummyRole);
    });
  });

  describe('deleteRole', () => {
    const mockRole = (): void => {
      Role.deleteOne = jest.fn();
    };

    afterEach(jest.clearAllMocks);

    test('When called, then it should call the proper methods.', async () => {
      mockRole();
      await RoleService.deleteRole('test');
      expect(Role.deleteOne).toHaveBeenCalled();
      expect(Role.deleteOne).toHaveBeenCalledWith({ name: 'test' });
    });
  });
});
