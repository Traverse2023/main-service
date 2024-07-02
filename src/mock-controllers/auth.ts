// import { Request, Response, NextFunction } from "express";
// import { HttpError } from "../utils/http-error.js";
// import { body, validationResult } from "express-validator";
// import DB from "../utils/db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
//
// interface User {
//     email?: string
//     firstName?: string
//     lastName?: string
//     password?: string
//   }
//
//
// export const register = async (req: Request, res: Response, next: NextFunction, db?: DB) => {
//     // #swagger.tags = ['Authentication']
//     // #swagger.description = 'Endpoint para obter um usuário.'
//     body('firstName').notEmpty().isString();
//     body('lastName').notEmpty().isString();
//     body('email').notEmpty().isEmail();
//     const errors = validationResult(req);
//     // console.log('errors', errors);
//
//     if (!errors.isEmpty()) {
//       throw new HttpError("Invalid inputs passed, please check your data.", 422);
//     }
//     const { firstName, lastName, email, password } = req.body;
//
//     let hashedPassword;
//     try {
//       hashedPassword = await bcrypt.hash(password, 12);
//     } catch (err) {
//       throw new HttpError(`Password hashing failed: ${err}`, 404);
//     }
//
//     const createdUser = {
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//     };
//     if (!db) db = DB.getInstance()
//     const anyUsers = await db.findUserById(email)
//     if (Object.keys(anyUsers).length) res.json(anyUsers)
//     else {
//       db.createUser(createdUser)
//         .then((value) => {
//           let token;
//           try {
//             token = jwt.sign(
//               { email: createdUser.email },
//               process.env.JWT_WEB_TOKEN,
//               {
//                 expiresIn: "1h",
//               }
//             );
//           } catch (err) {
//             throw new HttpError("jwt failed", err);
//           }
//           res.status(201)
//           res.json({ user: createdUser, token: token });
//         })
//         .catch((err) => {
//           console.error(err);
//           throw new HttpError("User was not correct", 404);
//         });
//     }
//
//   };
//
//   export const login = async (req: Request, res: Response, next: NextFunction, db?: DB) => {
//     // #swagger.tags = ['Authentication']
//     // #swagger.description = 'Endpoint para obter um usuário.'
//     const { email, password } = req.body;
//     if (!db) db = DB.getInstance();
//
//     try {
//       const value: User = await db.findUserById(email);
//       const isValidPassword = await bcrypt.compare(password, value.password);
//
//       if (!isValidPassword) {
//         throw new HttpError("Invalid creds", 401);
//       }
//
//       console.log("WEB TOKEN", process.env.JWT_WEB_TOKEN)
//       let token = jwt.sign(
//         { email: email },
//         process.env.JWT_WEB_TOKEN,
//         {
//           expiresIn: "1h",
//         }
//       );
//       const ret = {
//         token: token,
//         email: value.email,
//         firstName: value.firstName,
//         lastName: value.lastName
//       }
//       res.json(ret);
//     } catch (err) {
//       throw err
//     }
//   }