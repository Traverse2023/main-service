import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'

// const searchPosts = (req: Request, res: Response, next: NextFunction) => {
//     const { userEmail} = req.params
//     const db = DB.getInstance()
//     db.getFriends(userEmail).then(value => {
//         console.log(value);
//         res.json(value)
//     }).catch(err => {
//         throw new HttpError(err, 400)
//     })
// }

const searchUsers =(req: Request, res: Response, next: NextFunction) => {
    const searcherUserId: string = req.header("x-user")
    const { searched} = req.params
    const db = DB.getInstance()
    db.searchUsers(searcherUserId, searched).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

const getUser = (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user")
    const db = DB.getInstance()
    console.log(`Getting user with id ${userId}`)
    db.findUserById(userId).then(value => {
        console.log(`Retrieved user: ${JSON.stringify(value)}`);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

export { searchUsers, getUser }