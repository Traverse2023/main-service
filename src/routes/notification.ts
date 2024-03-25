import {checkAuth} from "../utils/check-auth.js";
import {Router} from "express";


const notificationRouter = (notificationsNamesapce, groupsNamespace, io) => {
    notificationsNamesapce.on('connection', (socket) => {
        console.log(`User ${socket.handshake.query.email} connected to notifications`);




    })

    groupsNamespace.on('connection', (socket) => {
        socket.on("sendMessage", async(groupId, message) => {
            const socketsInGroup = await groupsNamespace.in(groupId).fetchSockets();
            console.log("Got notification!");
            socketsInGroup.forEach(socket => socket.emit('globalNotification', "hello!"));
        })
    })
}

export { notificationRouter }