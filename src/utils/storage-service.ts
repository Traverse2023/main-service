import axios from "axios";

class StorageService {

    private static instance: StorageService;
    private static groupsURI = "/api/v1/groups/createGroup"
    private static notificationURI = "/api/v1/notifications/createNotification"


    public static getInstance() {
        if (!StorageService.instance) {
            this.instance = new StorageService();
        }
        return this.instance;
    }

    async createGroup(groupName) {
        console.log(`Group URL: ${process.env.STORAGE_SERVICE_URL+StorageService.groupsURI}`)
        const res = await axios.post(process.env.STORAGE_SERVICE_URL+StorageService.groupsURI, {groupName});
        // console.log(res.data);
        return res;
    }

    async createNotification(notification) {
        console.log(`Notification URL: ${process.env.STORAGE_SERVICE_URL+StorageService.notificationURI}`)
        const res = await axios.post(process.env.STORAGE_SERVICE_URL+StorageService.notificationURI, notification)
        // console.log(res.data);
        return res;
    }

}

export default StorageService;