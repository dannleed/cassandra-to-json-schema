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

export class CassandraJSONSchemaConverter {
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

  setToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+)>/)[1];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
      [JSONSchemaKey.UNIQUE_ITEMS]: true,
    };
  }

  listToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+)>/)[1];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
    };
  }

  mapToJSONSchema(columnType) {
    const type = columnType.match(/<(\w+), (\w+)>/)[2];

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.ADDITIONAL_PROPERTIES]: {
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      },
    };
  }

  tupleToJSONSchema(columnType) {
    const types = columnType.match(/<(\w+), (\w+)>/).slice(1);

    return {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.ARRAY,
      [JSONSchemaKey.ITEMS]: types.map(type => ({
        [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type],
      })),
    };
  }

  udtToJSONSchema(columnType) {
    if (columnType.match(CassandraDataType.TUPLE)) {
      return;
    }

    const type = columnType.match(/<(\w+)>/)[1];

    const udt = this.cassandraSchema.udts.find(udt => udt.name === type);

    const result = {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.PROPERTIES]: {},
    };

    for (const { name, type } of udt.fields) {
      result[JSONSchemaKey.PROPERTIES][name] = this.handleTypes(type);
    }

    return result;
  }

  objectToJSONSchema(object) {
    const result = {
      [JSONSchemaKey.TYPE]: JSONSchemaDataType.OBJECT,
      [JSONSchemaKey.PROPERTIES]: {},
    };

    for (const [key, value] of Object.entries(object)) {
      if (typeof value === JSONSchemaDataType.OBJECT) {
        result[JSONSchemaKey.PROPERTIES][key] = this.objectToJSONSchema(value);
      } else {
        result[JSONSchemaKey.PROPERTIES][key] = {
          [JSONSchemaKey.TYPE]: typeof value,
        };
      }
    }

    return result;
  }

  handleTypes(type, firstRow, columnName) {
    if (this.checkType(type, CassandraUDTKeyword)) {
      return this.udtToJSONSchema(type);
    }
    if (this.checkType(type, CassandraDataType.SET)) {
      return this.setToJSONSchema(type);
    }
    if (this.checkType(type, CassandraDataType.LIST)) {
      return this.listToJSONSchema(type);
    }
    if (this.checkType(type, CassandraDataType.MAP)) {
      return this.mapToJSONSchema(type);
    }
    if (
      this.checkType(type, `${CassandraUDTKeyword}<${CassandraDataType.TUPLE}`)
    ) {
      return this.tupleToJSONSchema(type);
    }
    if (this.checkIsJSONSerialized(firstRow, columnName, type)) {
      return this.objectToJSONSchema(JSON.parse(firstRow[columnName]));
    } else {
      return { [JSONSchemaKey.TYPE]: cassandraToJSONTypeMap[type] };
    }
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
        tableSchema[JSONSchemaKey.PROPERTIES][column_name] = this.handleTypes(
          type,
          firstRow,
          column_name,
        );
      }

      schema.push(tableSchema);
    });

    return JSON.stringify(schema, null, 4);
  }
}
