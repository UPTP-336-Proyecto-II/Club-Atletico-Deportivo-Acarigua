const express = require('express');
const router = express.Router();
const atencionMedicaController = require('../controllers/atencionMedicaController');
const { verifyToken } = require('../middleware/auth');

router.get('/atleta/:id', verifyToken, atencionMedicaController.getAtencionesByAtleta);
router.post('/', verifyToken, atencionMedicaController.createAtencion);
router.put('/:id', verifyToken, atencionMedicaController.updateAtencion);
router.delete('/:id', verifyToken, atencionMedicaController.deleteAtencion);

module.exports = router;
