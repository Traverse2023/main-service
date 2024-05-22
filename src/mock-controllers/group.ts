// import express, { Router, Request, Response, NextFunction } from "express";
// import { HttpError } from "../utils/http-error.js";
// import DB from "../utils/db.js";
//
// const createGroup = (req: Request, res: Response, next: NextFunction, db?: DB) => {
//     const { groupName, user1Email } = req.body;
//     console.log('====================================');
//     console.log('reqbody', req.body);
//     console.log('====================================');
//     if (!db) db = DB.getInstance();
//     db.createGroup("1" ,groupName, user1Email)
//       .then((value) => {
//         console.log(value);
//         res.json(value);
//       })
//       .catch((err) => {
//         throw new HttpError(err, 400);
//       });
//   };
//
//   const getGroups = (req: Request, res: Response, next: NextFunction, db?: DB) => {
//     const { user1Email } = req.params;
//
//     if (!db) db = DB.getInstance();
//     db.getGroups(user1Email)
//       .then((value) => {
//         console.log(value);
//         res.json(value);
//       })
//       .catch((err) => {
//         throw new HttpError(err, 400);
//       });
//   };
//
//   export {createGroup, getGroups}