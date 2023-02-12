import { SYSTEM_SCHEMA } from '../common/consts/cassandra.js';

export class CassandraRepository {
  #client;

  constructor(client) {
    this.#client = client;
  }

  async getTables(keyspaceName) {
    const result = await this.#executeQuery(
      `SELECT table_name FROM ${SYSTEM_SCHEMA}.tables WHERE keyspace_name = '${keyspaceName}';`,
    );

    return this.#extractColumn(result, 'table_name');
  }

  async getColumns(keyspaceName, tableName) {
    const result = await this.#executeQuery(
      `SELECT column_name, type FROM ${SYSTEM_SCHEMA}.columns WHERE keyspace_name = '${keyspaceName}' AND table_name = '${tableName}';`,
    );

    return this.#extractRows(result, ['column_name', 'type', 'kind']);
  }

  async getFirstRow(keyspaceName, tableName) {
    const result = await this.#executeQuery(
      `SELECT * FROM ${keyspaceName}.${tableName} LIMIT 1;`,
    );

    return result.rows[0];
  }

  async getSchema(keyspaceName) {
    const tables = await this.getTables(keyspaceName);

    const schema = {
      keyspace: keyspaceName,
      tables: [],
    };

    for (const table of tables) {
      const columns = await this.getColumns(keyspaceName, table);
      const firstRow = await this.getFirstRow(keyspaceName, table);

      schema.tables.push({
        name: table,
        columns,
        firstRow,
      });
    }

    return schema;
  }

  async #executeQuery(query) {
    return await this.#client.execute(query);
  }

  #extractColumn(result, columnName) {
    return result.rows.map(row => row[columnName]);
  }

  #extractRows(result, columns) {
    return result.rows.map(row => {
      const extractedRow = {};
      for (const column of columns) {
        extractedRow[column] = row[column];
      }
      return extractedRow;
    });
  }
}
