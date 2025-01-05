import type { Model } from '@/src/model/model';

type RoninErrorCode =
  | 'FIELD_ALREADY_DEFINED'
  | 'FIELD_NOT_DEFINED'
  | 'INDEX_NO_FIELDS'
  | 'FIELD_RESERVED';

interface Issue {
  message: string;
  path: Array<string | number>;
}

interface Details {
  message: string;
  code: RoninErrorCode;
  model: string;
  field?: string;
  fields?: Array<string>;
  issues?: Array<Issue>;
}

export class RoninError extends Error {
  code: Details['code'];
  model?: Details['model'];
  field?: Details['field'];
  fields?: Details['fields'];
  issues?: Details['issues'];

  constructor(details: Details) {
    super(details.message);

    this.name = 'RoninError';
    this.code = details.code;
    this.model = details.model;
    this.field = details.field;
    this.fields = details.fields;
    this.issues = details.issues;
  }
}

export const throwForbiddenModelDefinition = <Fields>(model: Model<Fields>) => {
  const { fields, indexes, slug } = model;

  // Field validation
  for (const [fieldSlug, _field] of Object.entries(fields ?? {})) {
    if (fieldSlug === 'id') {
      throw new RoninError({
        message: 'The field "id" is reserved and cannot be used.',
        code: 'FIELD_RESERVED',
        model: slug,
        field: 'id',
      });
    }
  }

  // Index validation
  if (indexes && indexes.length > 0) {
    for (const index of indexes) {
      if (index.fields.length === 0) {
        throw new RoninError({
          message: 'An index must have at least one field.',
          code: 'INDEX_NO_FIELDS',
          model: slug,
        });
      }

      for (const field of index.fields) {
        if ('slug' in field && fields && fields[field.slug] === undefined) {
          throw new RoninError({
            message: `The field ${field.slug} does not exist in this model.`,
            code: 'FIELD_NOT_DEFINED',
            field: field.slug,
            model: slug,
          });
        }
      }
    }
  }
};
