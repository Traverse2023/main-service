import axios from "axios";
import { response } from "express";


class StorageService {

    private static instance: StorageService;
    private static groupsURI = "/api/v1/groups/createGroup"
    private static notificationURI = ""


    public static getInstance() {
        if (!StorageService.instance) {
            this.instance = new StorageService();
        }
        return this.instance;
    }

    async createGroup(groupName) {
        const res = await axios.post(process.env.STORAGE_SERVICE_URL+StorageService.groupsURI, {groupName});
        console.log(res);
        return res;
    }

    async createNotification(notification) {
        const res = axios.post(process.env.STORAGE_SERVICE_URL+StorageService.notificationURI, {notification})
        console.log(res);
        return res;
    }

}

export default StorageService;