import express, {Router, Request, Response} from 'express'
import {
    acceptFriendRequest,
    addFriend,
    FriendsController,
    getFriendRequests,
    getFriends,
    getFriendshipStatus,
    getMutualFriends,
    removeFriendRequest,
    sendFriendRequest
} from '../controllers/friends.js'
import { checkAuth } from '../utils/check-auth.js'
import {Namespace} from "socket.io";

const router = Router()

router.get("/", addFriend)

router.use(checkAuth)

router.get('/getFriendRequests/:userEmail', getFriendRequests)
router.get('/getFriends/:user1Email', getFriends)
router.get('/getMutualFriends/:user1Email/:user2Email', getMutualFriends)
router.get('/getFriendshipStatus/:user1Email/:user2Email', getFriendshipStatus)

router.get('/removeFriendRequest/:user1Email/:user2Email', removeFriendRequest)

// router.post('/sendFriendRequest', sendFriendRequest)
router.post('/acceptFriendRequest', acceptFriendRequest)

const friendsRouter = (friendsNamespace: Namespace, notificationNamespace: Namespace, io) => {
    const friendsController = FriendsController.getInstance(io);

    friendsNamespace.on('connection', (socket) => {
        const id = socket.handshake.query.email as string;
        console.log('Friends connection', id);
        friendsController.registerSocket(id, socket);

        socket.on('disconnect', () => {
            const disconnectingUserEmail = socket.handshake.query.email
            // friendsController.getUserSockets().delete(disconnectingUserEmail, socket)
            console.log(`Disconnecting user ${disconnectingUserEmail} from friends`)
        })

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });

        socket.on('unfriend', (recipientEmail) => {
            console.log('43 unfriend', recipientEmail)
            friendsController.unfriend(id, recipientEmail).then((val) => {

            })
        });

        socket.on('sendFriendRequest', (recipientEmail) => {
            friendsController.sendFriendRequest(id, recipientEmail).then((val)=>{
                console.log('routesfriends38', val)
            });
        });

        socket.on('declineFriendRequest', (recipientEmail) => {
            console.log('here52declineReq')
            friendsController.declineFriendRequest(id, recipientEmail).then((val)=>{
                // console.log('routesfriends38', val)
            });
        });

        socket.on('acceptFriendRequest', (recipientEmail) => {
            friendsController.acceptFriendRequest(id, recipientEmail).then((val)=>{
                // console.log('routesfriends38', val)
            });
        });

    });
    return friendsController
};

export { friendsRouter, router }