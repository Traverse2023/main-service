import express, {Router, Request, Response} from 'express'
import { getUser, searchUsers } from '../controllers/search.js'
import { checkAuth } from '../utils/check-auth.js'

const router = Router()

router.use(checkAuth)

router.get('/getUser', getUser)
// router.get('/searchPosts/:searchVal', searchPosts)
router.get('/searchUsers/:searched', searchUsers)

export { router }