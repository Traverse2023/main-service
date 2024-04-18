import {Router} from "express"
import {createGroup, getFriendsWhoAreNotMembers, getGroups, getMembers, GroupsController} from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'
import StorageService from '../utils/storage-service.js';
import {Namespace, Socket} from "socket.io";


const router = Router();
const storageService: StorageService = StorageService.getInstance();

// Define API routes
router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups);

router.post('/createGroup', createGroup);

router.get('/getMembers/:groupId', getMembers);

router.get('/getFriendsWhoAreNotMembers/:user1Email/:groupId', getFriendsWhoAreNotMembers);

const groupsRouter = (groupsNamespace: Namespace, notificationNamespace: Namespace) => {
// Define websockets
    const groupsController = new GroupsController(groupsNamespace);

    groupsNamespace.on('connection', (socket) => {
        const email: string = socket.handshake.query.email  as string;
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
            groupsController.addMember(email, recipientEmail, groupId).then((val) => {
            })
        });

        //join room
        socket.on("joinRoom", ( groupId ) => {
            console.log("37", email, "joined", groupId)
            socket.rooms.forEach(room => {if (room !== socket.id){socket.leave(room);}});
            groupsController.deleteSocket(email)
            socket.join(groupId)
        })

        // Join voice call
        socket.on("joinCall", ( member, groupObj, channelName ) => {
            // Disconnect from any existing channels, if any.
            groupsController.disconnectUserFromChannels(email);
            console.log("52", email, "joinedCall", groupObj.groupId, channelName)

            // Add user to new channel
            groupsController.addUserToChannel(email, groupObj.groupId, channelName)
                .then(r => console.log(`User ${email} added to group ${groupObj.groupId}`));
            groupsNamespace.to(groupObj.groupId).emit('joinCallListener', member, channelName)
            console.log("after receiveJoinCall emit")
        })

        // Leave voice call (hang up button)
        socket.on("disconnectCall", (member, groupObj, channelName) => {
            groupsController.disconnectUserFromChannels(email);
            console.log(email, "leftCall", groupObj.groupId, channelName)
        })

        socket.on("sendMessage", async (groupId: string, message_info) => {
            const message = {
                chatId: groupId,
                type: "GROUP_MESSAGE",
                sender: message_info.email,
                channelId: message_info.channelName,
                text: message_info.msg,
                media: [],
            }

            console.log(`Creating message: `, message)

            // TODO: replace logic with channelId which is roomId#channelName
            storageService.createMessage(message).then(async response => {
                console.log("Created and stored message: ", response.data);

                console.log(`Emitting new message to group ${groupId}`)

                groupsNamespace.to(groupId).emit('receiveMessage', response.data);
               // All members of chat
                // TODO: Replace with DB call to get all members of chat
                const groupMembers = message_info.members;
               // Members of chat who are in chat and seeing live messages
                const activeMembersInChat = await groupsNamespace.in(groupId).fetchSockets();
               // Members of chat who are in app
                const activeMembers = await notificationNamespace.in(groupId).fetchSockets();

                // Members of chat who are in app but no seeing live messages for the chat.
                // These members need to receive a UI notification
                const activeMembersNotInChat = activeMembers.filter(member =>
                    !activeMembersInChat.some(inChat => inChat.handshake.query.email === member.handshake.query.email))

                activeMembersInChat.forEach(m => console.log("InChat", m.handshake.query.email));
                activeMembers.forEach(m => console.log("Active", m.handshake.query.email));
                activeMembersNotInChat.forEach(m => console.log("ActiveNotInChat", m.handshake.query.email));
                /*  Members of group not in the live chat including the members who are not active in the app.
                    These members will need a notification created for them. Only members actively in the live
                    chat do not need a notification created as they are seeing the messages live. */
                const membersNotInChat = groupMembers.filter(member => !activeMembersInChat.some(
                    i => i.handshake.query.email === member.email));

                // Create a notification object to be stored and retrieved for all members
                // not in the live chat or not in the app
                membersNotInChat.forEach(member => {
                    const notification = {
                        pk: member.email,
                        chatId: groupId,
                        sender: email,
                        type: "GROUP_MESSAGE"
                    }

                    storageService.createNotification(notification).then(res => {
                        console.log(res.data);
                    })
                })

                // Send a notification socket event to members who are in app but not in the live chat.
                activeMembersNotInChat.forEach(memberSocket=> {
                    const notification = {
                        pk: memberSocket.handshake.query.email,
                        chatId: groupId,
                        sender: email,
                        type: "GROUP_MESSAGE"
                    }

                    console.log('Sending notification socket event to: ', memberSocket.handshake.query.email, notification)
                    memberSocket.emit('globalNotification', notification);
                    storageService.createNotification(notification).then(res => {console.log(res.data)});
                })
            }).catch(err => console.log(err));
        })
    });
};

export { router, groupsRouter }
