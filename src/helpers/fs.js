import fs from 'fs/promises';

export async function writeJSON(json) {
  try {
    await fs.writeFile('result.json', json);
    console.log('result.json file has been saved.');
  } catch (err) {
    console.error(err);
  }
}
