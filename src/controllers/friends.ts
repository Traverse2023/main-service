import express, { Router, Request, Response, NextFunction } from "Express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";

const addFriend = (req: Request, res: Response) => {
  // #swagger.tags = ['Friends']
  // #swagger.description = 'Endpoint para obter um usuário.'
  res.json("Hello World");
};

const sendFriendRequest = async (req: Request, res: Response, next: NextFunction, db?: DB) => {
  const { user1Email, user2Email } = req.body;

  if (!db) db = new DB();

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
  next: NextFunction,
  db?: DB
) => {
  const { user1Email, user2Email } = req.body;

  if (!db) db = new DB();
try {
  const value = await db.createFriendship(user1Email, user2Email);
  console.log("VALUE in CONT", value);
  res.json(value);
} catch (err) {
  console.error(err);
  throw new HttpError(err, 404);
}

};

const getFriendRequests = (req: Request, res: Response, next: NextFunction, db?: DB) => {
  const { userEmail } = req.params;

  if (!db) db = new DB();
  db.getFriendRequests(userEmail)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const getFriends = (req: Request, res: Response, next: NextFunction, db?: DB) => {
  const { user1Email } = req.params;
  if (!db) db = new DB();
  db.getFriends(user1Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const getMutualFriends = (req: Request, res: Response, next: NextFunction, db?: DB) => {
  const { user1Email, user2Email } = req.params;
  if (!db) db = new DB();
  db.getMutualFriends(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const getFriendshipStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
  db?: DB
) => {
  const { user1Email, user2Email } = req.params;
  if (!db) db = new DB();
  db.getFriendshipStatus(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const removeFriendRequest = async(
  req: Request,
  res: Response,
  next: NextFunction,
  db?: DB
) => {
  const { user1Email, user2Email } = req.params;
  if (!db) db = new DB();
  try {
    const value = await db.removeFriendRequest(user1Email, user2Email)
    res.json(value)
  } catch(error) {
    throw new HttpError(error, 400)
  }
};

export {
  addFriend,
  acceptFriendRequest,
  sendFriendRequest,
  getFriendRequests,
  getFriends,
  getMutualFriends,
  getFriendshipStatus,
  removeFriendRequest,
};
