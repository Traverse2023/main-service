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
    db.createGroup(groupName, user1Email)
      .then((value) => {
        console.log(value);
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
        console.log(value);
        res.json(value);
      })
      .catch((err) => {
        throw new HttpError(err, 400);
      });
  };

  export {createGroup, getGroups}