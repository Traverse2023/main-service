// import express, { Router, Request, Response, NextFunction } from "express";
// import { HttpError } from "./http-error.js";
// import jwt from 'jsonwebtoken'
//
// const checkAuth = (req: Request, res: Response, next: NextFunction) => {
//   if (req.method === 'OPTIONS') {
//     return next()
//   }
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) {
//       throw new Error("Authentication failed!");
//     }
//     const decodedToken = jwt.verify(token, process.env.JWT_WEB_TOKEN)
//     //@ts-ignore
//     req.userData = {email: decodedToken.email}
//     next()
//   } catch (err) {
//     const error = new HttpError("Authentication failed!", 401);
//     return next(error);
//   }
// };
//
// export {checkAuth}