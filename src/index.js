import { client } from './db/connection.js';
import { CassandraRepository } from './repositories/cassandra.js';
import { CassandraToJSONSchema } from './services/cassandra-to-json-schema.js';

const cassandraRepository = new CassandraRepository(client);

const cassandraSchema = await cassandraRepository.getSchema('hackolade');

const cassandraToJSONSchema = new CassandraToJSONSchema(cassandraSchema);

const jsonSchema = cassandraToJSONSchema.toJSONSchema();

console.log(JSON.stringify(jsonSchema, null, 4));
process.exit(0);
