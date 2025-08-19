import { Router } from 'express';
import multer from 'multer';
import { validateLcHandler } from '../controllers/lcController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/validate-lc', upload.single('file'), validateLcHandler);

export default router;


