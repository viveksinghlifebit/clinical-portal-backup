interface Team {
  _id: Mongoose.ObjectId | string
  name: string
  deactivated: boolean
  biobank: {
    userDefinedFilters: string[]
  }
}
