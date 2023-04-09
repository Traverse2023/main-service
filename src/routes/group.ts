import express, {Router, Request, Response} from 'Express'
import { createGroup, getGroups } from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'

const router = Router()

router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups)

router.post('/createGroup', createGroup)


export { router }