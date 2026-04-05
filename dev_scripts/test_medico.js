const pool = require('../backend/config/database');
const addressService = require('../backend/services/addressService');

(async () => {
  try {
    let query = `
            SELECT pl.*, r.nombre_rol, pl.personal_id as plantel_id, pl.documento_identidad as cedula, pl.rol as rol_id,
                   ${addressService.getSelectColumns()}
            FROM personal pl
            LEFT JOIN rol_usuarios r ON pl.rol = r.rol_id
            ${addressService.getJoins().replace('entity.direccion_id', 'pl.direccion_id')}
            WHERE UPPER(r.nombre_rol) = UPPER('medico')`;
    console.log(query);
    const [res] = await pool.query(query);
    console.log(res);
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
})();
