import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";
import StorageService from "../utils/storage-service.js";

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupName, user1Email } = req.body;

    const storageService = StorageService.getInstance()
    const storageResponse = await storageService.createGroup(groupName)
    const db = DB.getInstance();
    db.createGroup(storageResponse.data.id, groupName, user1Email)
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
    private io
    private userSockets
    constructor(io) {
        this.io = io;
        this.userSockets = new Map();
    }
  
    async getMembersByGroupId(groupId) {
      const db = DB.getInstance();
      db.getMembers(groupId)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      })
      
    }

    async addMember(senderEmail, recipientEmail, groupId, groupsNamespace) {
        const db = DB.getInstance();
        try {
            const value = await db.addMemberToGroup(recipientEmail, groupId);
            groupsNamespace.to(groupId).emit('receiveAddedToGroupNotification', senderEmail, recipientEmail)
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
