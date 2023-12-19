import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'

const savePFP = (req: Request, res: Response, next: NextFunction) => {
    const {user1Email, pfpURL} = req.body
    const db = new DB()
    db.savePFP(user1Email, pfpURL).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err, 400)
    })
}

export { savePFP }