import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function managerEntries(entry = []) {
  return [...entry, join(__dirname, './manager.js')];
}
