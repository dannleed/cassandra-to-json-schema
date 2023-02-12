import { cassandraToJSONTypeMap } from '../common/enums/cassandra.js';
import {
  JSONSchemaDataType,
  JSONSchemaKey,
} from '../common/enums/json-schema.js';
import { isJSONSerialized } from '../helpers/is-json-serialized.js';

export class CassandraToJSONSchema {
  cassandraSchema;
  JSONSchemaVersion;

  constructor(cassandraSchema) {
    this.cassandraSchema = cassandraSchema;
    this.JSONSchemaVersion = 'http://json-schema.org/draft-04/schema#';
  }

  toJSONSchema() {
    const { tables } = this.cassandraSchema;
    const schema = [];

    tables.forEach(table => {
      const { name, columns, firstRow } = table;

      const tableSchema = {
        [JSONSchemaKey.$SCHEMA]: this.JSONSchemaVersion,
        [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
        [JSONSchemaKey.TITLE]: name,
        [JSONSchemaKey.PROPERTIES]: {},
      };

      for (const { column_name, type } of columns) {
        const isString =
          cassandraToJSONTypeMap[type] === JSONSchemaDataType.STRING;
        const isObject = firstRow && isJSONSerialized(firstRow[column_name]);

        if (isString && isObject) {
          tableSchema[JSONSchemaKey.PROPERTIES][column_name] =
            this.convertObjectToJSONSchema(JSON.parse(firstRow[column_name]));
        } else {
          tableSchema[JSONSchemaKey.PROPERTIES][column_name] = {
            [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
          };
        }
      }

      schema.push(tableSchema);
    });

    return schema;
  }

  convertObjectToJSONSchema(object) {
    const result = {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.PROPERTIES]: {},
    };

    for (const [key, value] of Object.entries(object)) {
      if (typeof value === JSONSchemaDataType.OBJECT) {
        result[JSONSchemaKey.PROPERTIES][key] =
          this.convertObjectToJSONSchema(value);
      } else {
        result[JSONSchemaKey.PROPERTIES][key] = {
          [JSONSchemaKey.TYPE]: typeof value,
        };
      }
    }

    return result;
  }
}
