export const JSONSchemaDataType = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
});

export const JSONSchemaKey = Object.freeze({
  $SCHEMA: '$schema',
  $REF: '$ref',
  TYPE: 'type',
  ITEMS: 'items',
  FORMAT: 'format',
  PROPERTIES: 'properties',
  DEFINITIONS: 'definitions',
  ADDITIONAL_PROPERTIES: 'additionalProperties',
  UNIQUE_ITEMS: 'uniqueItems',
  TITLE: 'title',
});
