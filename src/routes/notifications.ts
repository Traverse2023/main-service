import {Namespace, Socket} from "socket.io";
import {checkAuth} from "../utils/check-auth.js";
import {Router} from "express";
import {NotificationsController} from "../controllers/notifications.js";

const router = Router()
router.use(checkAuth)
const notificationsRouter = (notificationNamespace: Namespace, io) => {
    const notificationsController: NotificationsController = NotificationsController.getInstance(io);

    notificationNamespace.on('connection', (socket: Socket) => {
        console.log("Notifications connection")
        const id: string = socket.handshake.query.userId as string;
        notificationsController.registerSocket(id, socket);

        socket.on('joinRoom', (chatId: string) => {
            console.log(`12345 User ${id} joined notification room ${chatId}`);
            socket.join(chatId);
        })

        socket.on('leaveRoom', (chatId: string) => {
            console.log(`User ${id} leaving notification room ${chatId}`);
            socket.leave(chatId);
        })


    })
}

export {notificationsRouter}