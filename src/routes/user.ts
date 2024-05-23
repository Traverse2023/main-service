// @ts-ignore
import {Router} from 'express'
import { savePFP } from '../controllers/user.js'

import {getUser} from "../controllers/search.js";

const router = Router()

router.post('/savePFP', savePFP);
router.get('/getUser', getUser);

export { router }