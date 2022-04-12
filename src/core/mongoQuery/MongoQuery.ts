import { flatten } from 'lodash';
import { MongoQueryPagination } from './MongoQueryPagination';

export class MongoQuery {
  _Model: Mongoose.Model<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _query: Record<string, any>;
  _sort: Record<string, number>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(Model: Mongoose.Model<any>) {
    this._Model = Model;
    this._query = {};
    this._sort = { createdAt: -1 };
  }

  withUser(this: MongoQuery, user: User): MongoQuery {
    this._query.user = user || { $exists: false };
    return this;
  }

  withOwner(this: MongoQuery, owner: User): MongoQuery {
    this._query.owner = owner || { $exists: false };
    return this;
  }

  withTeam(this: MongoQuery, team?: Team): MongoQuery {
    this._query.team = team || { $exists: false };
    return this;
  }

  withTeamOrUser(this: MongoQuery, user: User, team?: Team): MongoQuery {
    if (team) {
      this.withTeam(team);
    } else {
      this.withUser(user);
      this.withTeam(undefined);
    }
    return this;
  }

  withTeamOrOwner(this: MongoQuery, owner: User, team?: Team): MongoQuery {
    if (team) {
      this.withTeam(team);
    } else {
      this.withOwner(owner);
      this.withTeam(undefined);
    }
    return this;
  }

  withFields(this: MongoQuery, fields: MongoQuery['_query']): MongoQuery {
    this._query = {
      ...this._query,
      ...fields
    };
    return this;
  }

  withSearch(this: MongoQuery, fields: string[], searchTerms: string): MongoQuery {
    if (fields.length === 0 || !searchTerms) return this;
    const regexes = searchTerms
      .split(' ')
      // remove empty spaces
      .filter((searchTerm) => !!searchTerm.trim())
      // escape special characters
      .map((searchTerm) => searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .map((searchTerm) => ({ $regex: new RegExp(searchTerm, 'i') }));

    const search = flatten(fields.map((field) => regexes.map((regex) => ({ [field]: regex }))));

    this._query = { ...this._query };

    if (this._query['$or'] && Array.isArray(this._query['$or'])) {
      this._query['$or'] = this._query['$or'].concat(search);
    } else {
      this._query['$or'] = search;
    }

    return this;
  }

  withExtraExactSearch(this: MongoQuery, fields: string[], searchTerm: string): MongoQuery {
    if (!this._query || !Array.isArray(this._query['$or'])) {
      return this;
    }

    fields.forEach((field) => {
      (this._query['$or'] as Record<string, string>[]).push({
        [field]: searchTerm
      });
    });

    return this;
  }

  withSort(this: MongoQuery, sort?: string): MongoQuery {
    if (sort) {
      const [field, order] = sort.split(' ') as [string, number];
      this._sort = { [field]: Number(order || -1) };
    }
    return this;
  }

  withPagination(this: MongoQuery, pageNumber?: number, pageSize?: number): MongoQueryPagination {
    return new MongoQueryPagination(this, pageNumber, pageSize);
  }

  compile(this: MongoQuery): { query: MongoQuery['_query']; sort: MongoQuery['_sort'] } {
    return {
      query: this._query,
      sort: this._sort
    };
  }
}
