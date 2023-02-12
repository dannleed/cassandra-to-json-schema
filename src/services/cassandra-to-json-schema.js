import { cassandraToJSONTypeMap } from '../common/enums/cassandra.js';
import {
  JSONSchemaDataType,
  JSONSchemaKey,
} from '../common/enums/json-schema.js';

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
      const { name, columns } = table;

      const tableSchema = {
        [JSONSchemaKey.$SCHEMA]: this.JSONSchemaVersion,
        [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
        [JSONSchemaKey.TITLE]: name,
        [JSONSchemaKey.PROPERTIES]: {},
      };

      columns.forEach(({ column_name, type }) => {
        tableSchema[JSONSchemaKey.PROPERTIES][column_name] = {
          [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
        };
      });

      schema.push(tableSchema);
    });

    return schema;
  }
}
