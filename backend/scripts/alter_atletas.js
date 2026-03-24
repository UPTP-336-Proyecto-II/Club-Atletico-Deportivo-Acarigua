const mysql = require('mysql2/promise');

async function alterTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cada_db'
  });

  try {
    await connection.execute('ALTER TABLE atletas MODIFY representante_id int(11) NULL;');
    console.log('Tabla atletas modificada exitosamente. representante_id ahora permite NULL.');
  } catch (error) {
    console.error('Error alterando la tabla:', error);
  } finally {
    await connection.end();
  }
}

alterTable();
