import * as dotenv from 'dotenv';
dotenv.config();

import { Validator } from './services/validator.js';

const {
  CASSANDRA_DB_HOST,
  CASSANDRA_DB_PORT,
  CASSANDRA_DB_USER,
  CASSANDRA_DB_PASS,
  CASSANDRA_DB_LOCAL_DATA_CENTER,
} = process.env;

const validationResults = [
  new Validator(CASSANDRA_DB_HOST, 'Host').notEmpty().validate(),
  new Validator(CASSANDRA_DB_PORT, 'Port')
    .notEmpty()
    .min(1)
    .max(65535)
    .validate(),
  new Validator(CASSANDRA_DB_USER, 'Username').notEmpty().validate(),
  new Validator(CASSANDRA_DB_PASS, 'Password').notEmpty().validate(),
  new Validator(CASSANDRA_DB_LOCAL_DATA_CENTER, 'Local data center')
    .notEmpty()
    .validate(),
];

const isValid = validationResults.every(result => result.isValid);

if (!isValid) {
  const errors = validationResults.reduce((acc, result) => {
    return [...acc, ...result.errors];
  }, []);

  throw new Error(`Invalid configuration: \n${errors.join('\n')}`);
}

export const config = {
  host: String(CASSANDRA_DB_HOST),
  port: Number(CASSANDRA_DB_PORT),
  user: String(CASSANDRA_DB_USER),
  password: String(CASSANDRA_DB_PASS),
  localDataCenter: String(CASSANDRA_DB_LOCAL_DATA_CENTER),
};
