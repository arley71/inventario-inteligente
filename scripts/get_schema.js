const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        uri: "mysql://upfpwjr0xqerkzvq:p2xfPmBv0nVxCqOC2Sks@b5j1ply7b8awnjkfvty5-mysql.services.clever-cloud.com:3306/b5j1ply7b8awnjkfvty5",
    });

    try {
        const [tables] = await pool.query("SHOW TABLES");
        for (let row of tables) {
            const tableName = Object.values(row)[0];
            console.log(`\n--- Table: ${tableName} ---`);
            const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);
            columns.forEach(col => {
                console.log(`  ${col.Field} | ${col.Type} | Null: ${col.Null} | Key: ${col.Key} | Default: ${col.Default} | Extra: ${col.Extra}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
