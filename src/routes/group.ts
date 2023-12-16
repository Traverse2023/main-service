import express, {Router, Request, Response} from 'express'
import {createGroup, getFriendsWhoAreNotMembers, getGroups, getMembers, GroupsController} from '../controllers/group.js'
import { checkAuth } from '../utils/check-auth.js'
import {FriendsController} from "../controllers/friends.js";
import moment from "moment";
import {sendMessageSQS} from "../utils/spring-boot-jobs.js";

const router = Router()

router.use(checkAuth)

router.get('/getGroups/:user1Email', getGroups)

router.post('/createGroup', createGroup)

router.get('/getMembers/:groupId', getMembers)

router.get('/getFriendsWhoAreNotMembers/:user1Email/:groupId', getFriendsWhoAreNotMembers)

const groupsRouter = (groupsNamespace) => {
    const groupsController = new GroupsController(groupsNamespace);

    groupsNamespace.on('connection', (socket) => {
        const email = socket.handshake.query.email
        groupsController.registerSocket(email, socket)

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
            socket.join(groupId)
            const joinMsg = email + " read"
            groupsNamespace.to(groupId).emit('receiveMessage', joinMsg)
            // socket.to(groupId).emit('joinMessage', joinMsg)
        })

        socket.on("sendMessage", (groupId, message_info) => {
            const messageInfo = {
                email,
                text: message_info.msg,
                firstName: message_info.firstName,
                lastName: message_info.lastName,
                time: (new Date).toISOString()
            }
            sendMessageSQS({...messageInfo, groupId, channelName: "general"})
            groupsNamespace.to(groupId).emit('receiveMessage', messageInfo)
        })

    });
};


export { router, groupsRouter }