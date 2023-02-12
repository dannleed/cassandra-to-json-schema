import { client } from './db/connection.js';
import { writeJSON } from './helpers/fs.js';
import { CassandraRepository } from './repositories/cassandra.js';
import { CassandraJSONSchemaConverter } from './services/cassandra-json-schema-converter.js';

(async () => {
  const cassandraRepository = new CassandraRepository(client);

  const cassandraSchema = await cassandraRepository.getSchema('hackolade');

  const cassandraJSONSchemaConverter = new CassandraJSONSchemaConverter(
    cassandraSchema,
  );

  const jsonSchema = cassandraJSONSchemaConverter.toJSONSchema();

  await writeJSON(jsonSchema);

  process.exit(0);
})();
