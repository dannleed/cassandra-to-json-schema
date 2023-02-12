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

async function createUDT() {
  await client.execute(`
    CREATE TYPE IF NOT EXISTS address (
      street text,
      city text,
      house int
    );
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

  await client.execute(`
    CREATE TABLE IF NOT EXISTS test (
      id int PRIMARY KEY,
      list_col list<text>,
      map_col map<text, int>,
      tuple_col frozen<tuple<text, int>>,
      set_col set<text>,
      boolean_col boolean,
      text_col text,
      address_col frozen<address>
    );
  `);
}

async function insertData() {
  const query1 =
    'INSERT INTO user (id, name, surname, age, address) VALUES (?, ?, ?, ?, ?) IF NOT EXISTS';
  const params1 = [
    '4acabb43-4f5e-46f2-8371-84668da81ad6',
    'John',
    'Doe',
    35,
    '{"city":"Lviv","street":"Chornovola","house":59}',
  ];
  await client.execute(query1, params1, { prepare: true });

  const query2 =
    "INSERT INTO test (id, list_col, map_col, tuple_col, set_col, boolean_col, text_col, address_col) VALUES (1, ['item1', 'item2'], {'key1': 1, 'key2': 2}, ('tuple1', 1), {'item1', 'item2'}, true, 'text', {street: 'street1', city: 'city1', house: 1})";
  await client.execute(query2);

  const result1 = await client.execute('SELECT * FROM user;');
  const result2 = await client.execute('SELECT * FROM test;');

  console.table(result1.rows);
  console.table(result2.rows);
  console.log('Data inserted successfully');
  process.exit(0);
}

async function run() {
  try {
    await createKeyspace();
    await useKeyspace();
    await createUDT();
    await createTable();
    await insertData();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
