const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Si tienes password en XAMPP, ponlo aquí
  database: 'club_deportivo_acarigua',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL');
    
    // Probar consulta básica
    const [results] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log(`📊 Usuarios en la base de datos: ${results[0].total}`);
    
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('💡 Verifica que:');
    console.log('   - XAMPP esté ejecutándose');
    console.log('   - MySQL esté activo en XAMPP');
    console.log('   - La base de datos "club_deportivo_acarigua" exista');
    console.log('   - El usuario y password sean correctos');
  }
};

testConnection();

module.exports = pool;