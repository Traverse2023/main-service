// @ts-ignore
import {Router} from 'express';
import { createChat } from '../controllers/chats.js';

const router = Router()

router.get("/", createChat)

export { router }