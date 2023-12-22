import express, { Router, Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";

const addFriend = (req: Request, res: Response) => {
  // #swagger.tags = ['Friends']
  // #swagger.description = 'Endpoint para obter um usuário.'
  res.json("Hello World");
};

const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.body;

const db = new DB()
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

  const db = new DB()
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

  const db = new DB();
  try {
    const requests = await db.getFriendRequests(userEmail)
    res.json(requests)
  }
  catch(error) { throw new HttpError(error, 401) }
};

const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email } = req.params;
  const db = new DB()
  try {
    const friends = await db.getFriends(user1Email)
    res.json(friends)
  } catch(error) { throw new HttpError(error, 400) }
};

const getMutualFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.params;
  const db = new DB()
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
  const db = new DB()
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
  const db = new DB()
  try {
    const value = await db.removeFriendRequest(user1Email, user2Email)
    res.json(value)
  } catch(error) {
    throw new HttpError(error, 400)
  }
};

class FriendsController {
  private io
  private userSockets
  constructor(io) {
    this.io = io;
    this.userSockets = new Map();
  }

  getUserSockets() {
    return this.userSockets;
  }

  registerSocket(email, givenSocket) {
    this.userSockets.set(email, givenSocket)
    // console.log(this.userSockets.keys())
  }

  sendGlobalNotification(senderEmail, recipientEmail, notification) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    recipientSocket.emit('globalNotification', notification)
  }

  async sendFriendRequest(senderEmail, recipientEmail) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const db = new DB()
    try {
      const value = await db.createFriendRequest(senderEmail, recipientEmail);
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

  async acceptFriendRequest(senderEmail, recipientEmail) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const db = new DB()
    try {
      const value = await db.createFriendship(senderEmail, recipientEmail);
      if (recipientSocket) {
        console.log("Sending accepted friend request notification to", recipientEmail)
        recipientSocket.emit('receiveAcceptFriendRequest', senderEmail);
      } else {

      }
    } catch (err) {
      console.error(err);
      throw new HttpError(err, 404);
    }
  }

  async declineFriendRequest(senderEmail, recipientEmail) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const db = new DB()
    try {
      if (recipientSocket) {
        const value = await db.removeFriendRequest(senderEmail, recipientEmail)
        recipientSocket.emit('receiveDeclineFriendRequest', senderEmail)
      }
    } catch(error) {
      throw new HttpError(error, 400)
    }
  }

  async unfriend(senderEmail, recipientEmail) {
    const recipientSocket = this.userSockets.get(recipientEmail);
    const db = new DB()
    try {
      if (recipientSocket) {
        const value = await db.unfriend(senderEmail, recipientEmail)
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
