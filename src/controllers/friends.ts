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
  const userId: string = req.header("x-user")
  const { friendUserId } = req.body;

const db = DB.getInstance()
  try {
      const value = await db.createFriendRequest(userId, friendUserId);
      res.json(value);
  } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
  }
};

const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user")
  const { user2Id: friendUserId } = req.body;

  const db = DB.getInstance()
  try {
  const value = await db.createFriendship(userId, friendUserId);
  res.json(value);
} catch (err) {
  console.error(err);
  throw new HttpError(err, 404);
}

};

const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user")
  console.log(userId)

  const db = DB.getInstance()
  try {
    const requests = await db.getFriendRequests(userId)
    res.json(requests)
  }
  catch(error) { throw new HttpError(error, 401) }
};

const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user");
  const db = DB.getInstance()
  try {
    const friends = await db.getFriends(userId)
    res.json(friends)
  } catch(error) { throw new HttpError(error, 400) }
};

const getMutualFriends = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user");
  const { friendUserId } = req.params;
  const db = DB.getInstance();
  try {
    const mutualFriends = await db.getMutualFriends(userId, friendUserId);
    res.json(mutualFriends);
  } catch(error) { throw new HttpError(error, 400) }
};

const getFriendshipStatus = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user");
  const { friendUserId } = req.params;
  const db = DB.getInstance();
  try {
    const friendshipStatus = await db.getFriendshipStatus(userId, friendUserId);
    res.json(friendshipStatus)
  } catch(error) { throw new HttpError(error, 400) }
};

const removeFriendRequest = async(req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.header("x-user");
  const { friendUserId } = req.params;
  const db = DB.getInstance()
  try {
    const value = await db.removeFriendRequest(userId, friendUserId);
    res.json(value);
  } catch(error) {
    throw new HttpError(error, 400);
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

  registerSocket(id: string, givenSocket: Socket) {
    this.userSockets.set(id, givenSocket)
  }

  async sendFriendRequest(senderId: string, recipientId: string) {
    const recipientSocket = this.userSockets.get(recipientId);
    const notificationsRecipientSocket = this.notificationsController.getUserSocketById(recipientId)
    const db = DB.getInstance()
    try {
      const value = await db.createFriendRequest(senderId, recipientId);
      if (notificationsRecipientSocket) {
        this.notificationNamespace.in(notificationsRecipientSocket.id).emit('globalNotification', "friendRequest")
      }
      if (recipientSocket) {
        console.log("Sending friend req to", recipientId)
        recipientSocket.emit('receiveFriendRequest', senderId);
      } else {

      }
    } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
    }
  }

  async acceptFriendRequest(senderId: string, recipientId: string) {
    const recipientSocket = this.userSockets.get(recipientId);
    const notificationsRecipientSocket = this.notificationsController.getUserSocketById(recipientId)
    const db = DB.getInstance()
    try {
      // TODO: //create notification
      const value = await db.createFriendship(senderId, recipientId);
      console.log(`Friendship created: ${value}, ${senderId}, ${recipientId}`);
      if (notificationsRecipientSocket) {
        this.notificationNamespace.in(notificationsRecipientSocket.id).emit('globalNotification', "friendRequestAccepted");
      }
      if (recipientSocket) {
        console.log("Sending accepted friend request notification to", recipientId)
        recipientSocket.emit('receiveAcceptFriendRequest', senderId);
      } else {
        console.log("acceptFriendRequest no socket found...");
      }
    } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
    }
  }

  async declineFriendRequest(senderId: string, recipientId: string) {
    const recipientSocket = this.userSockets.get(recipientId);
    const db = DB.getInstance();
    try {
      const value = await db.removeFriendRequest(senderId, recipientId);
      if (recipientSocket) {
        recipientSocket.emit('receiveDeclineFriendRequest', senderId)
      }
    } catch(error) {
      throw new HttpError(error, 400)
    }
  }

  async unfriend(senderId: string, recipientId: string) {
    console.log("inUnfriendController")
    const recipientSocket = this.userSockets.get(recipientId);
    console.log(recipientSocket)
    const db = DB.getInstance()
    try {
      const value = await db.unfriend(senderId, recipientId)
      console.log('value', value)
      if (recipientSocket) {
        recipientSocket.emit('receiveUnfriendNotification', senderId)
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
