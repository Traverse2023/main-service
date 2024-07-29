// @ts-ignore
import {Router} from 'express'
import { savePfp } from '../controllers/user.js'

import {getUser} from "../controllers/search.js";

const router = Router()

router.post('/savePfp', savePfp);
router.get('/getUser', getUser);

export { router }