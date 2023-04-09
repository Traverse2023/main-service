import express, {Router, Request, Response} from 'Express'
import { createChat } from '../controllers/chats.js'

const router = Router()

router.get("/", createChat)

export { router }