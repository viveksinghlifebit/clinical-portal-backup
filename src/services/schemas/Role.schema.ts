import { SchemaTypeOptions, Schema } from 'mongoose'
import { RolesRoutes } from 'enums'

const roleSchema: Partial<Record<keyof Role.Attributes, SchemaTypeOptions<unknown>>> = {
  name: {
    type: String,
    required: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [
    {
      name: {
        type: String,
        enum: Object.values(RolesRoutes),
        required: true
      },
      access: {
        read: {
          type: Boolean,
          default: false
        },
        create: {
          type: Boolean,
          default: false
        },
        update: {
          type: Boolean,
          default: false
        },
        delete: {
          type: Boolean,
          default: false
        }
      }
    }
  ]
}

const RoleSchema = new Schema(roleSchema, { timestamps: true })

export { RoleSchema }
