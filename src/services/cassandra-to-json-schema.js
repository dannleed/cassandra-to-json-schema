import { CassandraUDTKeyword } from '../common/consts/cassandra.js';
import {
  CassandraDataType,
  cassandraToJSONTypeMap,
} from '../common/enums/cassandra.js';
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

  checkType(columnType, type) {
    return columnType.startsWith(type);
  }

  checkIsJSONSerialized(firstRow, columnName, type) {
    const isString = cassandraToJSONTypeMap[type] === JSONSchemaDataType.STRING;
    const isObject = firstRow && isJSONSerialized(firstRow[columnName]);

    return isString && isObject;
  }

  convertSetToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+)>/)[1];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
      [JSONSchemaKey.UNIQUE_ITEMS]: true,
    };
  }

  convertListToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+)>/)[1];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
    };
  }

  convertMapToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+), (\w+)>/)[2];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.ADDITIONAL_PROPERTIES]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
    };
  }

  convertTupleToJSONSchema(columnType) {
    const types = columnType.match(/<(\w+), (\w+)>/).slice(1);

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: types.map(type => ({
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      })),
    };
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

  handleTypes(type, firstRow, columnName) {
    if (this.checkType(type, CassandraDataType.SET)) {
      return this.convertSetToJSONSchema(type);
    }
    if (this.checkType(type, CassandraDataType.LIST)) {
      return this.convertListToJSONSchema(type);
    }
    if (this.checkType(type, CassandraDataType.MAP)) {
      return this.convertMapToJSONSchema(type);
    }
    if (
      this.checkType(type, `${CassandraUDTKeyword}<${CassandraDataType.TUPLE}`)
    ) {
      return this.convertTupleToJSONSchema(type);
    }
    if (this.checkIsJSONSerialized(firstRow, columnName, type)) {
      return this.convertObjectToJSONSchema(JSON.parse(firstRow[columnName]));
    } else {
      return { [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type] };
    }
  }

  convertToJSONSchema() {
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
        tableSchema[JSONSchemaKey.PROPERTIES][column_name] = this.handleTypes(
          type,
          firstRow,
          column_name,
        );
      }

      schema.push(tableSchema);
    });

    return schema;
  }
}
