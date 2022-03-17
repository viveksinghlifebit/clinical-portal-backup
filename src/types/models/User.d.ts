interface User {
  _id: Mongoose.ObjectId
  name: string
  surname: string
  email: string
  picture: string
  rbacRoles?: Role.View[]
}
