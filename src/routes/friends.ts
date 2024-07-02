// @ts-ignore
import  {Router} from 'express'
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
// @ts-ignore
import {Namespace} from "socket.io";

const router = Router();

router.get("/", addFriend);

router.get('/getFriendRequests', getFriendRequests);
router.get('/getFriends', getFriends);
router.get('/getMutualFriends/:friendUserId', getMutualFriends);
router.get('/getFriendshipStatus/:friendUserId', getFriendshipStatus);
router.get('/removeFriendRequest/:friendUserId', removeFriendRequest);
router.post('/sendFriendRequest/:friendUserId', sendFriendRequest);
router.post('/acceptFriendRequest/:friendUserId', acceptFriendRequest);

const friendsRouter = (friendsNamespace: Namespace, notificationNamespace: Namespace, io) => {
    const friendsController = FriendsController.getInstance(io);

    friendsNamespace.on('connection', (socket) => {
        const userId = socket.handshake.query.userId as string;
        console.log('Friends connection', userId);
        friendsController.registerSocket(userId, socket);

        socket.on('disconnect', () => {
            const disconnectingUserId = socket.handshake.query.userId
            console.log(`Disconnecting user ${disconnectingUserId} from friends`)
        })

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });

        socket.on('unfriend', (recipientId: string) => {
            console.log('43 unfriend', recipientId)
            friendsController.unfriend(userId, recipientId).then(r => console.log("Unfriended"))
        });

        socket.on('sendFriendRequest', (recipientId: string) => {
            friendsController.sendFriendRequest(userId, recipientId).then((val)=>{
                console.log('routesfriends38', val)
            });
        });

        socket.on('declineFriendRequest', (recipientId: string) => {
            console.log('here52declineReq')
            friendsController.declineFriendRequest(userId, recipientId).then((val)=>{

            });
        });

        socket.on('acceptFriendRequest', (recipientId: string) => {
            friendsController.acceptFriendRequest(userId, recipientId).then((val)=>{

            });
        });

    });
    return friendsController
};

export { friendsRouter, router }