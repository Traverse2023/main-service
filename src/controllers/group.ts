import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";
import StorageService from "../utils/storage-service.js";
import {randomUUID} from "crypto";
import {Namespace, Socket} from "socket.io";

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupName, user1Email } = req.body;

    const groupId: string = randomUUID().toString();
    console.log(`New group: ${groupId}`);
    const db = DB.getInstance();
    db.createGroup(groupId, groupName, user1Email)
      .then((value) => {
        res.json(value);
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      });
  };


const getGroups = (req: Request, res: Response, next: NextFunction) => {
    const { user1Email } = req.params;

    const db = DB.getInstance();
    db.getGroups(user1Email)
        .then((value) => {
            console.log('getGroupController', value)
        res.json(value);
        })
        .catch((err) => {
        throw new HttpError(err, 400);
        });
};


const getMembers = (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;

    const db = DB.getInstance();
    db.getMembers(groupId)
        .then((value) => {
            res.json(value);
        })
        .catch((err) => {
            throw new HttpError(err, 400);
        });
}

const getFriendsWhoAreNotMembers = (req: Request, res: Response, next: NextFunction) => {
    const { user1Email, groupId } = req.params;

    const db = DB.getInstance();
    db.getFriendsWhoAreNotMembers(user1Email, groupId)
        .then((value) => {
            res.json(value);
        })
        .catch((err) => {
            throw new HttpError(err, 400);
        });
}

// Responsible for handling methods to do with sockets
class GroupsController {

    private userSockets: Map<string, Socket>;
    private notificationNamespace: Namespace;
    constructor(notificationNamespace: Namespace) {
        this.notificationNamespace = notificationNamespace;
        this.userSockets = new Map();
    }
  
    async getMembersByGroupId(groupId: string) {
      const db = DB.getInstance();
      db.getMembers(groupId)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      })
      
    }
  
    async addMember(senderEmail: string, recipientEmail: string, groupId: string) {
        const db = DB.getInstance();
        try {
            const value = await db.addMemberToGroup(recipientEmail, groupId);
            this.notificationNamespace.to(groupId).emit('globalNotification', `${senderEmail} added ${recipientEmail} to the group!`)
        } catch (err) {
            console.error(err);
            throw new HttpError(err, 404);
        }
    }

    // Add users to a channel when they click on the channel
    async addUserToChannel(email: string, groupId: string, channelName: string){
        const db = DB.getInstance();
        try {
            const value = await db.joinChannel(email, groupId+channelName);
        } catch (err) {
            console.error(err);
            throw new HttpError(err, 404);
        }
    }

    // Disconnect user from all channels
    async disconnectUserFromChannels(email: string) {
        const db = DB.getInstance();
        try {
            const value = await db.leaveAllChannels(email);
        } catch (err) {
            console.error(err);
            throw new HttpError(err, 404);
        }
    }

    deleteSocket(email: any) {
        this.userSockets.delete(email)
    }
}

export {createGroup, getGroups, getMembers, getFriendsWhoAreNotMembers, GroupsController}
