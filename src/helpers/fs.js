import fs from 'fs/promises';

export async function writeJSON(json) {
  await fs.writeFile('result.json', json);
}
