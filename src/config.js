import 'dotenv';

const {
  CASSANDRA_DB_HOST,
  CASSANDRA_DB_PORT,
  CASSANDRA_DB_USER,
  CASSANDRA_DB_PASS,
} = process.env;

export const config = {
  host: CASSANDRA_DB_HOST,
  port: CASSANDRA_DB_PORT,
  user: CASSANDRA_DB_USER,
  port: CASSANDRA_DB_PASS,
};
