import express, {Router, Request, Response} from 'Express'
import { getUser, searchPosts, searchUsers } from '../controllers/search.js'
import { checkAuth } from '../utils/check-auth.js'

const router = Router()

router.use(checkAuth)

router.get('/getUser/:user1Email', getUser)
router.get('/searchPosts/:searchVal', searchPosts)
router.get('/searchUsers/:searcher/:searched', searchUsers)

export { router }