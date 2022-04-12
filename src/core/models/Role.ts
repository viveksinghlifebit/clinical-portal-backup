import { Types } from 'mongoose';
import { RoleSchema } from '@schemas';

export const roleModelName = 'Role';

/**
 * MODEL METHODS
 */

function view(this: Role.Document): Role.View {
  return {
    displayName: this.displayName,
    name: this.name,
    permissions: this.permissions.map(({ name, access }) => ({ name, access }))
  };
}

RoleSchema.methods = {
  view
};

/**
 * MODEL STATIC METHODS
 */

async function findRolesByRoleIds(rolesIds: string[]): Promise<Role.View[]> {
  return (
    await Role.find({
      _id: {
        $in: rolesIds.map((roleId) => new Types.ObjectId(roleId))
      }
    })
  ).map((role) => role.view());
}

RoleSchema.statics = {
  findRolesByRoleIds
};

/**
 * MODEL INITIALIZATION
 */

export let Role: Role.Model;

export const init = (connection: Mongoose.Connection): void => {
  Role = connection.model<Role.Document, Role.Model>(roleModelName, RoleSchema);
};
