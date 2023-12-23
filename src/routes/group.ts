import express, {Router, Request, Response} from 'express'
import {createGroup, getFriendsWhoAreNotMembers, getGroups, getMembers, GroupsController} from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'
import {sendMessageSQS} from "../utils/spring-boot-jobs.js";
import DB from "../utils/db.js";

const router = Router()

router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups)

router.post('/createGroup', createGroup)

router.get('/getMembers/:groupId', getMembers)

router.get('/getFriendsWhoAreNotMembers/:user1Email/:groupId', getFriendsWhoAreNotMembers)

const groupsRouter = (groupsNamespace, userController) => {
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
            const joinMsg = email + " read"
            groupsNamespace.to(groupId).emit('receiveMessage', joinMsg)
            // socket.to(groupId).emit('joinMessage', joinMsg)
        })

        socket.on("sendMessage", (groupId, message_info) => {
            const groupName = message_info.groupName;
            const messageInfo = {
                email,
                text: message_info.msg,
                firstName: message_info.firstName,
                lastName: message_info.lastName,
                pfpURL: message_info.pfpURL,
                time: (new Date).toISOString()
            }

            sendMessageSQS({...messageInfo, groupId, channelName: "general"})
                        groupsNamespace.to(groupId).emit('receiveMessage', messageInfo)
            //const allConnectedClients = io.sockets.clients() 
            // User objects from database

            // members from DB
            let groupMembers;

            groupsController.getMembersByGroupId(groupId)
            .then((value) => {
                groupMembers = value;
            })
             
            // sockets of all active users
            const allActiveUsers = groupsNamespace.clients()
            // sockets of users actively in group-chat
            const activeMembersInChat = groupsNamespace.clients(groupId)
            const allActiveUsersNotInChat = allActiveUsers.filter(userSocket => !activeMembersInChat.some(i => i.handshake.query.email === userSocket.handshake.query.email))
            const activeMembersNotInChat = allActiveUsersNotInChat.filter(socket => groupMembers.some(member => member.email === socket.handshake.query.email))
            console.log(activeMembersNotInChat)
            console.log(allActiveUsersNotInChat)



//             // users actively in chat
//             const usersConnectedToChat = Array.from(groupsController.getUserEmailsByGroupID(groupId))
//             console.log('connectedToChat', usersConnectedToChat)
//             // All members fo chat wether online offline or actively in chat
//             const members = message_info.members
//             console.log('67members', members)
//             //get members who are not connected to chat
//             // @ts-ignore
//             const notInGCMembers = members.filter(member => !usersConnectedToChat.some(user => user === member.email));
//             console.log('not in chat', notInGCMembers)
//             //check if they are connected to app by checking friends controller
//             const activeUsers = Array.from(userController.getUserSockets().keys())
//             console.log('activeUsers', activeUsers)  // m: ['bp@gmail.com', 'io@gmail.com']  notconnecttochat: ['io@gmail.com']
//             // @ts-ignore                           // activeUsers: ['bp@gmail.com', 'io@gmail.com', 'f@gmail.com']
//             const activeMembers = notInGCMembers.filter(member => activeUsers.some(user => user === member.email))
//             console.log('activeMembers', activeMembers)
            activeMembersNotInChat.forEach(userSocket => {
                const notification = {
                    sender: email,
                    groupId: groupId,
                    message: `${message_info.firstName} ${message_info.lastName} sent a message to ${groupName}.`,
                    notificationType: "MESSAGE_SENT"
                }
                userController.sendGlobalNotification(userSocket, notification)
            })
        })

    });
};


export { router, groupsRouter }