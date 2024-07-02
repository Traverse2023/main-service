import axios from "axios";

class StorageService {

    private static instance: StorageService;
    private static baseURL: string = process.env.STORAGE_SERVICE_URL;
    private static notificationURI: string = StorageService.baseURL + "/api/v1/notifications/createNotification";
    private static messageURI: string = StorageService.baseURL + "/api/v1/messages/addMessage";


    public static getInstance() {
        console.log("storage-service instance: {}", this.baseURL);
        if (!StorageService.instance) {
            this.instance = new StorageService();
        }
        return this.instance;
    }


    async createNotification(notification) {
        console.log(`Creating notification: ${JSON.stringify(notification)}`);
        const res = await axios.post(StorageService.notificationURI, notification)
        console.log(res.data);
        return res;
    }

    async createMessage(message) {
        console.log(`Message URL: ${StorageService.messageURI}`)
        const res = await axios.post(StorageService.messageURI, message)
        console.log(res.data);
        return res;
    }

}

export default StorageService;