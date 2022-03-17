interface Team {
  _id: Mongoose.ObjectId
  name: string
  deactivated: boolean
  biobank: {
    userDefinedFilters: string[]
  }
}
