import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'
import { v4 as uuid } from "uuid";
import {uploadFileStream} from "../aws/s3.js";
import busboy from "busboy";

// Get uploaded profile picture. Store picture in s3 and save s3 url in user database object.
const savePfp = (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user")
    const db = DB.getInstance()
    const uploader = busboy({headers: req.headers})


    const bucket: string = "codehive-profile-pics";
    const key: string  = `${userId}`;
    uploader.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        // Set s3 params for uploading. We will use the object key make s3 url
        const params = {
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: mimetype
        }
        // which will be stored in database
        // Try upload file using params and file buffer
        uploadFileStream(params).then((key) => console.log(`Uploaded image ${key}`))
            .catch(error => {
                const msg: string = `An error occurred when uploading profile pic to s3: ${error}`
                console.log(msg)
                return res.status(500).json({message: msg})
            });

    })

    req.pipe(uploader);

    // Create url string from bucket and key once file is stored in s3
    const pfpUrl: string = `s3://${bucket}/${key}`;
    // Store s3 url as field in user node in DB
    db.savePFP(userId,pfpUrl).then(value => {
        console.log(value);
        res.json(value)
    }).catch(err => {
        throw new HttpError(err.message, 500)
    })

}


export { savePfp }