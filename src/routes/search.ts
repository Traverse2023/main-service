// @ts-ignore
import {Router} from 'express'
import { getUser, searchUsers } from '../controllers/search.js'


const router = Router()

router.get('/getUser', getUser)
router.get('/searchUsers/:searched', searchUsers)

export { router }