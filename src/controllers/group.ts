// @ts-ignore
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";
import {randomUUID} from "crypto";
// @ts-ignore
import {Namespace, Socket} from "socket.io";
import User from "../types/user.js";

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupName } = req.body;
    const userId: string = req.header("x-user")

    const groupId: string = randomUUID().toString();
    console.log(`New group: ${groupId}`);
    const db = DB.getInstance();
    db.createGroup(groupName, userId)
      .then((value) => {
        res.json(value);
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      });
  };


const getGroups = (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user");

    const db = DB.getInstance();
    db.getGroups(userId)
        .then((value) => {
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
            console.log(err.message)
            throw new HttpError(err, 400);
        });
}

const getFriendsWhoAreNotMembers = (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const userId: string = req.header("x-user")

    const db = DB.getInstance();
    db.getFriendsWhoAreNotMembers(userId, groupId)
        .then((value) => {
            res.json(value);
        })
        .catch((err) => {
            throw new HttpError(err, 400);
        });
}

const getUsersInVoiceChannel = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId, channelName } = req.params;
    
    const db = DB.getInstance();
    db.getUsersInVoiceChannel(groupId, channelName)
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


    async addMembers(senderFirstAndLastName: string, newMembers: User[], groupId: string) {
        const db = DB.getInstance();
        newMembers.forEach((member) => {
            db.addMemberToGroup(member.id, groupId).then(() => {
                this.notificationNamespace.to(groupId).emit('globalNotification', `${senderFirstAndLastName} added ${member.firstName} ${member.lastName} to the group!`);
            }).catch((err) => {
            console.error(err);
            throw new HttpError(err, 404);
            })
        })
    }

    // Add users to a channel when they click on the channel
    async addUserToChannel(userId: string, groupId: string, channelName: string){
        const db = DB.getInstance();
        try {
            const value = await db.joinChannel(userId, groupId, channelName);
        } catch (err) {
            console.error(err);
            throw new HttpError(err, 404);
        }
    }

    // Disconnect user from all channels
    async disconnectUserFromChannels(userId: string) {
        console.log("Disconnecting from all channels")
        const db = DB.getInstance();
        try {
            const value = await db.leaveAllChannels(userId);
        } catch (err) {
            console.error(err);
            throw new HttpError(err, 404);
        }
    }

    deleteSocket(userId: any) {
        this.userSockets.delete(userId)
    }
}

export {createGroup, getGroups, getMembers, getFriendsWhoAreNotMembers, getUsersInVoiceChannel, GroupsController}