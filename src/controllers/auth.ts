import express, { Router, Request, Response, NextFunction } from "Express";
import { HttpError } from "../utils/http-error.js";
import { validationResult } from "express-validator";
import DB from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mock_users = [];

interface User {
  email: string
  firstName: string
  lastName: string
  password: string
}

const register = async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Authentication']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const errors = validationResult(req);
  // console.log('errors', errors);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  const { firstName, lastName, email, password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    throw new HttpError(`Password hashing failed: ${err}`, 404);
  }

  const createdUser = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
  };
  console.log(createdUser);
  const db = new DB();
  db.findUser(email).then(value => {
      console.log(value);
      res.json(value)
  }).catch(err => {
      // console.log(err)
      res.send(new HttpError(err, 400))
      // throw new HttpError(err, 400)
  })

  db.createUser(createdUser)
    .then((value) => {
      let token;
      try {
        token = jwt.sign(
          { email: createdUser.email },
          "supersecret_dont_share",
          {
            expiresIn: "1h",
          }
        );
      } catch (err) {
        throw new HttpError("jwt failed", err);
      }
      res.status(201).json({ user: createdUser, token: token });
    })
    .catch((err) => {
      console.error(err);
      throw new HttpError("User was not correct", 404);
    });
};

const login = (req: Request, res, next: NextFunction) => {
  // #swagger.tags = ['Authentication']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const { email, password } = req.body;
  console.log('====================================');
  console.log('here64auth');
  console.log('====================================');
  const db = new DB();


  db.findUser(email)
    .then(async (value: User) => {
      console.log('value70', value);
      let isValidPassword = false;
      try {
        isValidPassword = await bcrypt.compare(
          password,
          value.password
        );
      } catch (err) {
        new HttpError("Could not log in", 404);
        return next(err);
      }

      if (!isValidPassword) {
        throw new HttpError("Invalid creds", 401);
      }
      let token;
      try {
        token = jwt.sign(
          { email: email },
          "supersecret_dont_share",
          {
            expiresIn: "1h",
          }
        );
      } catch (err) {
        throw new HttpError("jwt failed", err);
      }
      res.status(200).json({
        token: token,
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName
      });
    })
    .catch((err) => {
      res.json("could not log in");
    });
};

export { register, login };
