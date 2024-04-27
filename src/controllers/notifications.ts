import {Namespace, Server, Socket} from "socket.io";
// @ts-ignore
import {DefaultEventsMap} from "socket.io/dist/typed-events.js";


class NotificationsController {

    public static instance: NotificationsController;
    private userSockets: Map<String, Socket>;
    private notificationNamespace: Namespace;

    constructor(io: Server<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>) {
        this.userSockets = new Map();
        this.notificationNamespace = io.of("/notifications");
    }

    public getUserSocketById(userId: String) {
        return this.userSockets.get(userId);
    }

    public static getInstance(io: Server<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>): NotificationsController {
        if (!NotificationsController.instance) {
            NotificationsController.instance = new NotificationsController(io);
        }
        return NotificationsController.instance;
    }

    registerSocket(userId: string, givenSocket: Socket) {
        this.userSockets.set(userId, givenSocket)
    }
}
export {
    NotificationsController
};