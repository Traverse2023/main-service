import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'

const searchPosts = (req: Request, res: Response, next: NextFunction) => {
    const {userEmail} = req.params
    const db = DB.getInstance()
    db.getFriends(userEmail).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

const searchUsers =(req: Request, res: Response, next: NextFunction) => {
    const {searcher, searched} = req.params
    const db = DB.getInstance()
    db.searchUsers(searcher, searched).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

const getUser = (req: Request, res: Response, next: NextFunction) => {
    const {user1Email} = req.params
    const db = DB.getInstance()
    db.findUser(user1Email).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

export { searchPosts, searchUsers, getUser }