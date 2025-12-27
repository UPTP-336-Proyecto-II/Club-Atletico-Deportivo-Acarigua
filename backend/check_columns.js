const pool = require('./config/database');

async function checkColumns() {
    try {
        const [rows] = await pool.execute('DESCRIBE control_asistencias');
        console.log('Columns in control_asistencias:');
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkColumns();
