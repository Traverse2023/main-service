import {Router, response} from 'express'
import {createGroup, getFriendsWhoAreNotMembers, getGroups, getMembers, GroupsController} from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'
import StorageService from '../utils/storage-service.js';


const router = Router()
const storageService: StorageService = StorageService.getInstance();

router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups)

router.post('/createGroup', createGroup)

router.get('/getMembers/:groupId', getMembers)

router.get('/getFriendsWhoAreNotMembers/:user1Email/:groupId', getFriendsWhoAreNotMembers)

const groupsRouter = (groupsNamespace, io) => {
    const groupsController = new GroupsController(groupsNamespace);

    groupsNamespace.on('connection', (socket) => {
        const email = socket.handshake.query.email
        // socket.on("connect_error", (err) => {
        //     console.log(`connect_error due to ${err.message}`);
        // });

        socket.on('disconnect', () => {
            groupsController.deleteSocket(email)
            groupsNamespace.emit('sendMessage', email + 'has disconnected')
        })

        socket.on('addMember', (recipientEmail, groupId) => {
            // console.log('43 unfriend', recipientEmail)
            groupsController.addMember(email, recipientEmail, groupId, groupsNamespace).then((val) => {
            })
        });

        //join room
        socket.on("joinRoom", ( groupId ) => {
            console.log("37", email, "joined", groupId)
            socket.leaveAll()
            groupsController.deleteSocket(email)
            socket.join(groupId)
            // const joinMsg = email + " read"
            // groupsNamespace.to(groupId).emit('receiveMessage', joinMsg)
            // socket.to(groupId).emit('joinMessage', joinMsg)
        })

        socket.on("joinCall", ( member, groupObj, channelName ) => {
            console.log("52", email, "joinedCall", groupObj.groupId, channelName)
            const targetRoom = groupsNamespace.in(groupObj.groupId);
            const roomListeners = targetRoom.adapter.rooms.get(groupObj.groupId);
            console.log('joinCalllisteneers', roomListeners)
            groupsNamespace.to(groupObj.groupId).emit('joinCallListener', member, channelName)
            console.log("after receiveJoinCall emit")
            // socket.to(groupId).emit('joinMessage', joinMsg)
        })

        socket.on("sendMessage", async (groupId, message_info) => {
            const message = {
                chatId: groupId,
                type: "GROUP_MESSAGE",

                sender: message_info.email,
                channelId: message_info.channelName,
                text: message_info.msg,
                media: [],
            }

            console.log(`Creating message: `, message)

            // sendMessageSQS({...messageInfo, groupId, channelName: "general"})
           storageService.createMessage(message).then(async response => {
               console.log("Created nessage: ", response.data);
               groupsNamespace.to(groupId).emit('receiveMessage', response.data);
               const activeUsers = await groupsNamespace.fetchSockets();
               console.log('activeUsers', activeUsers.length)
                // Users
               const groupMembers = message_info.members;
                // sockets of users actively in group-chat
               const activeMembersInChat = await groupsNamespace.in(groupId).fetchSockets();




                // Members of group not in this chats page where they can see the messages or not logged in at all
                // will need a notification created
                const membersNotInChat = groupMembers.filter(member => !activeMembersInChat.some(
                    i => i.handshake.query.email === member.email));

                membersNotInChat.forEach(member => {

                    const notification = {
                        pk: member.email,
                        chatId: groupId,
                        sender: email,
                        type: "GROUP_MESSAGE"
                    }

                    console.log('Sending notification', notification)
                    storageService.createNotification(notification).then(res => {
                        console.log(res)
                    })
                })

                // Members of group chat active but not in this chat's page able to view messages
                const activeMembersNotInChat = activeUsers.filter(activeUser => membersNotInChat.some(
                    member => member.email === activeUser.handshake.query.email));

                activeMembersNotInChat.forEach(userSocket => {

                    const notification = {
                        pk: userSocket.handshake.query.email,
                        chatId: groupId,
                        sender: email,
                        type: "GROUP_MESSAGE"
                    }

                    console.log('86 sending to', userSocket.handshake.query.email, notification)
                    userSocket.emit('globalNotification', notification);
                    storageService.createNotification(notification).then(res => {console.log(res)});
                })
            }).catch(err => console.log(err));
        })
    });
};

export { router, groupsRouter }