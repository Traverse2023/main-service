import express, {Router, Request, Response} from 'express'
import { acceptFriendRequest, addFriend, getFriendRequests, getFriends, getFriendshipStatus, getMutualFriends, removeFriendRequest, sendFriendRequest } from '../controllers/friends.js'
import { checkAuth } from '../utils/check-auth.js'

const router = Router()

router.get("/", addFriend)

router.use(checkAuth)

router.get('/getFriendRequests/:userEmail', getFriendRequests)
router.get('/getFriends/:user1Email', getFriends)
router.get('/getMutualFriends/:user1Email/:user2Email', getMutualFriends)
router.get('/getFriendshipStatus/:user1Email/:user2Email', getFriendshipStatus)
router.get('/removeFriendRequest/:user1Email/:user2Email', removeFriendRequest)

router.post('/sendFriendRequest', sendFriendRequest)
router.post('/acceptFriendRequest', acceptFriendRequest)


export { router }