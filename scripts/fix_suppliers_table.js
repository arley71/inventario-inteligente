const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        uri: "mysql://upfpwjr0xqerkzvq:p2xfPmBv0nVxCqOC2Sks@b5j1ply7b8awnjkfvty5-mysql.services.clever-cloud.com:3306/b5j1ply7b8awnjkfvty5",
    });

    try {
        console.log("Altering suppliers table...");
        await pool.query("ALTER TABLE suppliers ADD COLUMN productsSupplied JSON");
        console.log("Column productsSupplied added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error(e);
        }
    } finally {
        await pool.end();
    }
}
main();
