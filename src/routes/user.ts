import express, {Router, Request, Response} from 'express'
import { savePFP } from '../controllers/user.js'
import { checkAuth } from '../utils/check-auth.js'
import {getUser} from "../controllers/search.js";

const router = Router()

router.use(checkAuth)

router.post('/savePFP', savePFP);
router.post('/getUser', getUser);

export { router }