import { Client } from 'cassandra-driver';
import { config } from '../config.js';

const { user, password, host, port, localDataCenter } = config;

const initConnection = async () => {
  const client = new Client({
    contactPoints: [`${host}:${port}`],
    localDataCenter,
    credentials: {
      username: user,
      password,
    },
  });
  try {
    await client.connect();
    console.log('Connected to Cassandra');

    return client;
  } catch (err) {
    console.error('Error connecting to Cassandra:', err);
    process.exit(1);
  }
};

export const client = await initConnection();
