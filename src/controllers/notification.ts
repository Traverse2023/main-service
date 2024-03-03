import StorageService from "../utils/storage-service.js";
import {SocketType} from "dgram";
import {Namespace} from "socket.io";


interface NotificationResponse {
    id: String,
    recipient: String,
    notificationType: String,
    time: String,
    groupId: String,
    groupName: String,
    sender: String
    message: String
}

class NotificationController {

    private storageService;
    private notificationNamespace;

    constructor(notificationNamespace: Namespace) {
        this.storageService = StorageService.getInstance();
        this.notificationNamespace = notificationNamespace;
    }


    async createNotification(senderEmail, recipientEmail, groupId, groupName, messageInfo, notificationType) : Promise<NotificationResponse> {
        const notification = {
            recipientEmail: recipientEmail,
            groupId,
            groupName: groupName,
            message: messageInfo.text,
            sender:senderEmail,
            notificationType
        }

        console.log('Creating notification:', notification);

        return new Promise((resolve, reject) => {
            this.storageService.createNotification(notification).then(({data})=> {
                const notification: NotificationResponse = {
                    id: data.id,
                    recipient: data.recipient,
                    groupId: data.groupId,
                    groupName: data.groupName,
                    sender: data.sender,
                    time: data.time,
                    notificationType: data.notificationType,
                    message: data,
                }
                console.log("51Notification", notification)
                resolve(notification);
            }).catch(err => {
                console.error(err);
                reject(err);
            })
        });
    }

    async sendNotification(senderEmail: string, recipientSocket: any, groupId: string, groupName: string, messageInfo, notificationType: string) {
        this.createNotification(senderEmail, recipientSocket.handshake.query.email, groupId, groupName, messageInfo, notificationType)
            .then(res => {
                console.log("Created: ", res);
                console.log('groupnamespace socket', recipientSocket, recipientSocket.id, recipientSocket.handshake.query.email)
                const socket = this.notificationNamespace.sockets
                console.log('notification socket.id', socket);
                // this.notificationNamespace.fetchSockets().forEach(socket => console.log('sockets notification namespace', socket.id))
                socket.emit("notification", res);
            })
            .catch(err => console.log(err))
    }

}


export { NotificationController };
//'rn6r0J8MkBjkTp6jAAAz'
//'rn6r0J8MkBjkTp6jAAAz'