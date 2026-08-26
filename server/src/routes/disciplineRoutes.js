import express from 'express';
import { getDisciplines, createDiscipline, updateDiscipline, deleteDiscipline } from '../controllers/disciplineController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getDisciplines);
router.post('/', requireRoles(['ADMIN', 'HR']), createDiscipline);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateDiscipline);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteDiscipline);

export default router;
