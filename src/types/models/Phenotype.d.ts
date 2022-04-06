declare namespace PhenotypeField {
  interface Attributes {
    _id: Mongoose.ObjectId | string
    id: Filter.FilterId
    bucket300: boolean
    bucket500: boolean
    categoryPathLevel1: string
    categoryPathLevel2?: string
    categoryPathLevel3?: string
    categoryPathLevel4?: string
    instances: number
    name: string
    type: import('enums').PhenotypeFieldTypes
    Sorting: string
    valueType: import('enums').PhenotypeFieldValueTypes
    units: string
    coding: string
    description: string
    descriptionParticipantsNo: string
    link: string
    array: number
    descriptionStability: string
    descriptionCategoryID: string
    descriptionItemType: string
    descriptionStrata: string
    descriptionSexed: string
    orderPhenotype: string
    instance0Name: string
    instance1Name: string
    instance2Name: string
    instance3Name: string
    instance4Name: string
    instance5Name: string
    instance6Name: string
    instance7Name: string
    instance8Name: string
    instance9Name: string
    instance10Name: string
    instance11Name: string
    instance12Name: string
    instance13Name: string
    instance14Name: string
    instance15Name: string
    instance16Name: string
    values?: Record<string, string>
    Original_dataset?: string
  }

  interface Document extends Attributes {
    // ...
  }

  interface Model extends Mongoose.Model<Document> {}
}
