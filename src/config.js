import * as dotenv from 'dotenv';
dotenv.config();

const {
  CASSANDRA_DB_HOST,
  CASSANDRA_DB_PORT,
  CASSANDRA_DB_USER,
  CASSANDRA_DB_PASS,
  CASSANDRA_DB_LOCAL_DATA_CENTER,
} = process.env;

export const config = {
  host: String(CASSANDRA_DB_HOST),
  port: Number(CASSANDRA_DB_PORT),
  user: String(CASSANDRA_DB_USER),
  password: String(CASSANDRA_DB_PASS),
  localDataCenter: String(CASSANDRA_DB_LOCAL_DATA_CENTER),
};
