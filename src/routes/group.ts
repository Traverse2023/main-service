import {Router, response} from 'express'
import {createGroup, getFriendsWhoAreNotMembers, getGroups, getMembers,  GroupsController} from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'
import StorageService from '../utils/storage-service.js';


const router = Router()
const storageService: StorageService = StorageService.getInstance();

router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups)

router.post('/createGroup', createGroup)

router.get('/getMembers/:groupId', getMembers)

router.get('/getFriendsWhoAreNotMembers/:user1Email/:groupId', getFriendsWhoAreNotMembers)

// router.get('/getUsersInChannel/:groupId/:channelUuid')

const groupsRouter = (groupsNamespace) => {
    const groupsController = new GroupsController(groupsNamespace);

    groupsNamespace.on('connection', (socket) => {
        const email = socket.handshake.query.email
        // socket.on("connect_error", (err) => {
        //     console.log(`connect_error due to ${err.message}`);
        // });

        socket.on('disconnect', () => {
            groupsController.disconnectUserFromChannels(email);
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

        // Join voice call
        socket.on("joinCall", ( member, groupObj, channelName ) => {
            // Disconnect from any existing channels, if any.
            groupsController.disconnectUserFromChannels(email);
            console.log("52", email, "joinedCall", groupObj.groupId, channelName)

            // Set up listeners
            const targetRoom = groupsNamespace.in(groupObj.groupId);
            const roomListeners = targetRoom.adapter.rooms.get(groupObj.groupId);
            console.log('joinCalllisteneers', roomListeners)

            // Add user to new channel
            groupsController.addUserToChannel(email, groupObj.groupId, channelName);
            groupsNamespace.to(groupObj.groupId).emit('joinCallListener', member, channelName)
            console.log("after receiveJoinCall emit")
        })

        // Leave voice call (hang up button)
        socket.on("disconnectCall", (member, groupObj, channelName) => {
            groupsController.disconnectUserFromChannels(email);
            console.log(email, "leftCall", groupObj.groupId, channelName)
        })

        socket.on("sendMessage", async (groupId, message_info) => {
            const groupName = message_info.groupName;
            const messageInfo = {
                email,
                channelName: message_info.channelName,
                groupId: groupId,
                text: message_info.msg,
                firstName: message_info.firstName,
                lastName: message_info.lastName,
                pfpURL: message_info.pfpURL,
                time: (new Date).toISOString()
            }
            console.log(`Creating message: {}`, messageInfo)

            // sendMessageSQS({...messageInfo, groupId, channelName: "general"})
           storageService.createMessage(messageInfo).then(async response => {
                groupsNamespace.to(groupId).emit('receiveMessage', messageInfo)
                const activeUsers = await groupsNamespace.fetchSockets();
                console.log('activeUsers', activeUsers.length)
                // Users
                const groupMembers = message_info.members;
                // sockets of users actively in group-chat
                const activeMembersInChat = await groupsNamespace.in(groupId).fetchSockets();
                // Members of group not in chat: in another page or not logged in
                const membersNotInChat = groupMembers.filter(member => !activeMembersInChat.some(
                    i => i.handshake.query.email === member.email));

                const storageService = StorageService.getInstance();

                membersNotInChat.forEach(member => {

                    const notification = {
                        recipientEmail: member.email,
                        groupId: groupId,
                        groupName: groupName,
                        message: `${message_info.firstName} ${message_info.lastName} sent a message to ${groupName}.`,
                        notificationType: "MESSAGE_SENT"
                    }

                    console.log('Sending notification', notification)
                    StorageService.getInstance().createNotification(notification).then(res => {
                        console.log(res)
                    })
                })
                // Members of group chat active but not in chat
                const activeMembersNotInChat = activeUsers.filter(activeUser => membersNotInChat.some(
                    member => member.email === activeUser.handshake.query.email));

                activeMembersNotInChat.forEach(userSocket => {
                    const notification = {
                        recipientEmail: userSocket.handshake.query.email,
                        groupId: groupId,
                        groupName: groupName,
                        message: `${message_info.firstName} ${message_info.lastName} sent a message to ${groupName}.`,
                        notificationType: "MESSAGE_SENT"
                    }
                    console.log('86 sending to', userSocket.handshake.query.email, notification)
                    userSocket.emit('globalNotification', notification)
                })
            }).catch(err => console.log(response))
        })

    });
};

export { router, groupsRouter }
