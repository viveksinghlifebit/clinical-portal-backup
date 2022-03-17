export class MongoQueryPagination {
  _MongoQuery: MongoQuery
  _pageSize: number
  _pageNumber: number

  constructor(MongoQuery: MongoQuery, pageNumber?: number, pageSize?: number) {
    this._MongoQuery = MongoQuery
    this._pageNumber = pageNumber || 1
    this._pageSize = pageSize || 15
  }

  async compile(
    this: MongoQueryPagination
  ): Promise<{
    query: MongoQuery['_query']
    sort: MongoQuery['_sort']
    skip: number
    pagination: Omit<App.PaginationResponse, 'data'>
  }> {
    const totalCount = await this._MongoQuery._Model.count(this._MongoQuery._query)
    const pageSize = Math.min(this._pageSize, totalCount)
    const totalPages = Math.ceil(totalCount / pageSize) || 1
    return {
      query: this._MongoQuery._query,
      sort: this._MongoQuery._sort,
      skip: (this._pageNumber - 1) * pageSize,
      pagination: {
        pageSize,
        pageNumber: this._pageNumber,
        totalCount,
        totalPages
      }
    }
  }
}
