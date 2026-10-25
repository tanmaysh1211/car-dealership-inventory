import { Router } from 'express';
import { validate } from '../../validate';
import { loginSchema, registerSchema } from './auth.schemas';
import * as service from './auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const user = await service.register(validate(registerSchema, req.body));
  res.status(201).json({ user });
});

authRouter.post('/login', async (req, res) => {
  res.json(await service.login(validate(loginSchema, req.body)));
});
