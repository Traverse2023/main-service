import express, { Router, Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";
import {Namespace, Server, Socket} from "socket.io";
// @ts-ignore
import {DefaultEventsMap} from "socket.io/dist/typed-events.js";
import {NotificationsController} from "./notifications.js";


const addFriend = (req: Request, res: Response) => {
  // #swagger.tags = ['Friends']
  // #swagger.description = 'Endpoint para obter um usuário.'
  res.json("Hello World");
};

const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.body;

const db = DB.getInstance()
  try {
      const value = await db.createFriendRequest(user1Email, user2Email);
      res.json(value);
  } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
  }
};

const acceptFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user1Email, user2Email } = req.body;

  const db = DB.getInstance()
  try {
  const value = await db.createFriendship(user1Email, user2Email);
  res.json(value);
} catch (err) {
  console.error(err);
  throw new HttpError(err, 404);
}

};

const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  const { userEmail } = req.params;

  const db = DB.getInstance()
  try {
    const requests = await db.getFriendRequests(userEmail)
    res.json(requests)
  }
  catch(error) { throw new HttpError(error, 401) }
};

const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email } = req.params;
  const db = DB.getInstance()
  try {
    const friends = await db.getFriends(user1Email)
    res.json(friends)
  } catch(error) { throw new HttpError(error, 400) }
};

const getMutualFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.params;
  const db = DB.getInstance()
  try {
    const mutualFriends = await db.getMutualFriends(user1Email, user2Email)
    res.json(mutualFriends)
  } catch(error) { throw new HttpError(error, 400) }
};

const getFriendshipStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
  ) => {
  const { user1Email, user2Email } = req.params;
  const db = DB.getInstance()
  try {
    const friendshipStatus = await db.getFriendshipStatus(user1Email, user2Email)
    res.json(friendshipStatus)
  } catch(error) { throw new HttpError(error, 400) }
};

const removeFriendRequest = async(
  req: Request,
  res: Response,
  next: NextFunction
  ) => {
  const { user1Email, user2Email } = req.params;
  const db = DB.getInstance()
  try {
    const value = await db.removeFriendRequest(user1Email, user2Email)
    res.json(value)
  } catch(error) {
    throw new HttpError(error, 400)
  }
};

class FriendsController {

  public static instance: FriendsController;
  private userSockets: Map<String, Socket>;
  private notificationNamespace: Namespace;
  private notificationsController: NotificationsController;
  constructor(io: Server< Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>) {
    this.userSockets = new Map();
    this.notificationNamespace = io.of("/notifications");
    this.notificationsController = NotificationsController.getInstance(io);
  }
  public static getInstance(io: Server< Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>): FriendsController {
    if (!FriendsController.instance) {
      FriendsController.instance = new FriendsController(io);
    }
    return FriendsController.instance;
  }

  registerSocket(email: string, givenSocket: Socket) {
    this.userSockets.set(email, givenSocket)
  }

  async sendFriendRequest(senderEmail: string, recipientEmail: string) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const notificationsRecipientSocket = this.notificationsController.getUserSocketById(recipientEmail)
    const db = DB.getInstance()
    try {
      const value = await db.createFriendRequest(senderEmail, recipientEmail);
      if (notificationsRecipientSocket) {
        this.notificationNamespace.in(notificationsRecipientSocket.id).emit('globalNotification', "friendRequest")
      }
      if (recipientSocket) {
        console.log("Sending friend req to", recipientEmail)
        recipientSocket.emit('receiveFriendRequest', senderEmail);
      } else {

      }
    } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
    }
  }

  async acceptFriendRequest(senderEmail: string, recipientEmail: string) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const notificationsRecipientSocket = this.notificationsController.getUserSocketById(recipientEmail)
    const db = DB.getInstance()
    try {
      // TODO: //create notification
      const value = await db.createFriendship(senderEmail, recipientEmail);
      console.log(`Friendship created: ${value}, ${senderEmail}, ${recipientEmail}`);
      if (notificationsRecipientSocket) {
        this.notificationNamespace.in(notificationsRecipientSocket.id).emit('globalNotification', "friendRequestAccepted");
      }
      if (recipientSocket) {
        console.log("Sending accepted friend request notification to", recipientEmail)
        recipientSocket.emit('receiveAcceptFriendRequest', senderEmail);
      } else {
        console.log("acceptFriendRequest no socket found...");
      }
    } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
    }
  }

  async declineFriendRequest(senderEmail: string, recipientEmail: string) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const db = DB.getInstance();
    try {
      const value = await db.removeFriendRequest(senderEmail, recipientEmail);
      if (recipientSocket) {
        recipientSocket.emit('receiveDeclineFriendRequest', senderEmail)
      }
    } catch(error) {
      throw new HttpError(error, 400)
    }
  }

  async unfriend(senderEmail: string, recipientEmail: string) {
    console.log("inUnfriendController")
    const recipientSocket = this.userSockets.get(recipientEmail);
    console.log(recipientSocket)
    const db = DB.getInstance()
    try {
      const value = await db.unfriend(senderEmail, recipientEmail)
      console.log('value', value)
      if (recipientSocket) {
        recipientSocket.emit('receiveUnfriendNotification', senderEmail)
      }
    } catch(error) {
      throw new HttpError(error, 400)
    }
  }
}

export {
  addFriend,
  acceptFriendRequest,
  sendFriendRequest,
  getFriendRequests,
  getFriends,
  getMutualFriends,
  getFriendshipStatus,
  removeFriendRequest,
  FriendsController
};
