import express, { Router, Request, Response, NextFunction } from "Express";
import { HttpError } from "../utils/http-error.js";
import DB from "../utils/db.js";

const addFriend = (req: Request, res: Response) => {
  // #swagger.tags = ['Friends']
  // #swagger.description = 'Endpoint para obter um usuário.'
  res.json("Hello World");
};

const sendFriendRequest = (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.body;

  const db = new DB();

  db.createFriendRequest(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.status(200).json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 404);
    });
};

const acceptFriendRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user1Email, user2Email } = req.body;

  const db = new DB();
console.log('34');

  db.createFriendship(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.status(200).json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 404);
    });
};

const getFriendRequests = (req: Request, res: Response, next: NextFunction) => {
  const { userEmail } = req.params;

  const db = new DB();
  db.getFriendRequests(userEmail)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const getFriends = (req: Request, res: Response, next: NextFunction) => {
  const { user1Email } = req.params;
  const db = new DB();
  db.getFriends(user1Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const getMutualFriends = (req: Request, res: Response, next: NextFunction) => {
  const { user1Email, user2Email } = req.params;
  const db = new DB();
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
  next: NextFunction
) => {
  const { user1Email, user2Email } = req.params;
  const db = new DB();
  db.getFriendshipStatus(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
};

const removeFriendRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user1Email, user2Email } = req.params;
  const db = new DB();
  db.removeFriendRequest(user1Email, user2Email)
    .then((value) => {
      console.log(value);
      res.json(value);
    })
    .catch((err) => {
      throw new HttpError(err, 400);
    });
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
