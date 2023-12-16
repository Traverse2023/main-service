import express, { Router, Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";
import axios from "axios";

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupName, user1Email } = req.body;
    // console.log('====================================');
    // console.log('reqbody', req.body);
    // console.log('====================================');
    const groupResponse = await axios.post(`${process.env.STORAGE_SERVICE_URL}/api/v1/groups/createGroup`, {groupName})
    // console.log(groupResponse.data.id)
    const db = new DB();
    db.createGroup(groupResponse.data.id, groupName, user1Email)
      .then((value) => {
        res.json(value);
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      });
  };

  const getGroups = (req: Request, res: Response, next: NextFunction) => {
    const { user1Email } = req.params;
  
    const db = new DB();
    db.getGroups(user1Email)
      .then((value) => {
        // console.log('line29controllergroup', value);
        res.json(value);
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      });
  };

  const getMembers = (req: Request, res: Response, next: NextFunction) => {
      const { groupId } = req.params;

      const db = new DB();
      db.getMembers(groupId)
          .then((value) => {
              // console.log(value);
              res.json(value);
          })
          .catch((err) => {
              throw new HttpError(err, 400);
          });
  }

const getFriendsWhoAreNotMembers = (req: Request, res: Response, next: NextFunction) => {
    const { user1Email, groupId } = req.params;

    const db = new DB();
    db.getFriendsWhoAreNotMembers(user1Email, groupId)
        .then((value) => {
            // console.log(value);
            res.json(value);
        })
        .catch((err) => {
            throw new HttpError(err, 400);
        });
}

// const addMember = (req: Request, res: Response, next: NextFunction) => {
//     const { user1Email, groupId } = req.params;
//
//     const db = new DB();
//     db.addMemberToGroup(user1Email, groupId)
//         .then((value) => {
//             console.log(value);
//             res.json(value);
//         })
//         .catch((err) => {
//             throw new HttpError(err, 400);
//         });
// };

class GroupsController {
    private io
    private userSockets
    constructor(io) {
        this.io = io;
        this.userSockets = new Map();
    }

    registerSocket(email, givenSocket) {
        this.userSockets.set(email, givenSocket)
        // console.log(this.userSockets.keys())
    }

    async addMember(senderEmail, recipientEmail, groupId, groupsNamespace) {
        const recipientSocket = this.userSockets.get(recipientEmail);
        const db = new DB()
        try {
            const value = await db.addMemberToGroup(recipientEmail, groupId);
            groupsNamespace.to(groupId).emit('receiveAddedToGroupNotification', senderEmail, recipientEmail)
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