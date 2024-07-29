import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'
import { v4 as uuid } from "uuid";
import {uploadFileStream} from "../aws/s3.js";


// Get uploaded profile picture. Store picture in s3 and save s3 url in user database object.
const savePFP = (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user")
    const { file } = req.body
    const db = DB.getInstance()
    // If not valid file return 400
    if (!file) {
        console.log("File does not exist to upload!")
        return res.status(400).json({message: "Bad request: No file present!"})
    }
    // Set s3 params for uploading. We will use the object key make s3 url
    // which will be stored in database
    const params = {
        Bucket: "codehive-profile-pics",
        Key: `${userId}/${uuid()}`,
        Body: file.buffer,
        ContentType: file.mimetype
    }
    // Try upload file using params and file buffer
    uploadFileStream(params).then((key) => console.log(`Uploaded image ${key}`))
        .catch(error => {
            const msg: string = `An error occurred when uploading profile pic to s3: ${error}`
            console.log(msg)
            return res.status(500).json({message: msg})
        })
    // Create url string from bucket and key once file is stored in s3
    const pfpUrl: string = `s3://${params.Bucket}/${params.Key}`;
    // Store s3 url as field in user node in DB
    db.savePFP(userId,pfpUrl).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err.message, 500)
    })
}


export { savePFP }