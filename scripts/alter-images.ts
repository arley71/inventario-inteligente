import { pool } from '../lib/db';

async function main() {
  try {
    console.log("Altering 'abarrotes' image column...");
    await pool.query('ALTER TABLE abarrotes MODIFY COLUMN image LONGTEXT');
    console.log("Altering 'revuelteria' image column...");
    await pool.query('ALTER TABLE revuelteria MODIFY COLUMN image LONGTEXT');
    console.log("Done");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
main();
