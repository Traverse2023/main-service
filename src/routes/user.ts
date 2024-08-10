// @ts-ignore
import {Router} from 'express'
import { updatePfp } from '../controllers/user.js'

import {getUser} from "../controllers/search.js";

const router = Router()

router.post('/updatePfp', updatePfp);
router.get('/getUser', getUser);

export { router }