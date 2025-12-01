import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello World dari Express + TypeScript!');
});

router.get('/about', (req: Request, res: Response) => {
  res.json({ message: 'Ini halaman about' });
});

export default router;
