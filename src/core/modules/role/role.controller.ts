import { Role } from '@core/models';
import { MongoQuery } from '@core/mongoQuery';

export class RoleService {
  /**
   * List roles with pagination
   * @param {PaginationRequest} pagination pagination options
   */
  static async listRolesPaginated({
    pagination: paginationReq
  }: {
    pagination: App.PaginationRequest;
  }): Promise<App.PaginationResponse<Role.View>> {
    const mongoQuery = new MongoQuery(Role).withSort(paginationReq.sort);

    const { sort, skip, pagination } = await mongoQuery
      .withPagination(paginationReq.pageNumber, paginationReq.pageSize)
      .compile();

    const data = await Role.find({}).sort(sort).skip(skip).limit(pagination.pageSize);
    return {
      pageSize: Math.min(pagination.pageSize, data.length),
      pageNumber: pagination.pageNumber,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
      data: data.map((role) => role.view())
    };
  }

  /**
   * Updates role
   * @param {Role.Input} role role
   */
  static async updateRole({ role }: { role: Role.Input }): Promise<Role.View> {
    await Role.findOneAndUpdate({ name: role.name }, { $set: role });
    return role;
  }

  /**
   * Delete role
   * @param {string} name roleName
   */
  static async deleteRole(name: string): Promise<void> {
    await Role.deleteOne({ name });
  }

  /**
   * Create role
   * @param {Role.Input} role role
   */
  static async createRole({ role }: { role: Role.Input }): Promise<Role.View> {
    const data = await Role.create(role);
    return data.view();
  }
}
