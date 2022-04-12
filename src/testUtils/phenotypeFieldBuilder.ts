import { PhenotypeFieldTypes, PhenotypeFieldValueTypes } from '@core/enums';

export class PhenotypeTestFieldBuilder {
  private readonly field: Partial<PhenotypeField.Attributes>;

  constructor() {
    this.field = {};
  }

  public withName(name: string): PhenotypeTestFieldBuilder {
    this.field.name = name;
    return this;
  }

  public arraySize(array: number): PhenotypeTestFieldBuilder {
    this.field.array = array;
    return this;
  }

  public instancesSize(instances: number): PhenotypeTestFieldBuilder {
    this.field.instances = instances;
    return this;
  }

  public ofType(type: PhenotypeFieldTypes): PhenotypeTestFieldBuilder {
    this.field.type = type;
    return this;
  }

  public withValues(values: Record<string, string>): PhenotypeTestFieldBuilder {
    this.field.values = values;
    return this;
  }

  public withDescriptionParticipantsNo(descriptionParticipantsNo: string): PhenotypeTestFieldBuilder {
    this.field.descriptionParticipantsNo = descriptionParticipantsNo;
    return this;
  }

  public withCategoryLevel1(level1: string): PhenotypeTestFieldBuilder {
    this.field.categoryPathLevel1 = level1;
    return this;
  }

  public withId(id: number): PhenotypeTestFieldBuilder {
    this.field.id = id;
    return this;
  }

  public withBucket300(bucket300: boolean): PhenotypeTestFieldBuilder {
    this.field.bucket300 = bucket300;
    return this;
  }

  public withDescriptionItemType(descriptionItemType: string): PhenotypeTestFieldBuilder {
    this.field.descriptionItemType = descriptionItemType;
    return this;
  }

  public withValueType(valueType: PhenotypeFieldValueTypes): PhenotypeTestFieldBuilder {
    this.field.valueType = valueType;
    return this;
  }

  public with_id(_id: string): PhenotypeTestFieldBuilder {
    this.field._id = _id;
    return this;
  }

  public withInstance0Name(instance0Name: string): PhenotypeTestFieldBuilder {
    this.field.instance0Name = instance0Name;
    return this;
  }

  public withInstance1Name(instance1Name: string): PhenotypeTestFieldBuilder {
    this.field.instance1Name = instance1Name;
    return this;
  }

  public build(): PhenotypeField.Attributes {
    return this.field as PhenotypeField.Attributes;
  }
}
