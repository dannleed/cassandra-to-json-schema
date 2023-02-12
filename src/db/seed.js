import { client } from './connection.js';

async function createKeyspace() {
  await client.execute(`
    CREATE KEYSPACE IF NOT EXISTS hackolade 
    WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': '1'}
  `);
}

async function useKeyspace() {
  await client.execute(`
    USE hackolade
  `);
}

async function createTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id uuid PRIMARY KEY,
      name text,
      surname text,
      age int,
      address text
    );
  `);
}

async function insertData() {
  const query =
    'INSERT INTO user (id, name, surname, age, address) VALUES (?, ?, ?, ?, ?) IF NOT EXISTS';
  const params = [
    '4acabb43-4f5e-46f2-8371-84668da81ad6',
    'John',
    'Doe',
    35,
    '{"city":"Lviv","street":"Chornovola","house":59}',
  ];
  await client.execute(query, params, { prepare: true });
  const result = await client.execute('SELECT * FROM user;');

  console.table(result.rows);
  console.log('Data inserted successfully');
  process.exit(0);
}

async function run() {
  try {
    await createKeyspace();
    await useKeyspace();
    await createTable();
    await insertData();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
