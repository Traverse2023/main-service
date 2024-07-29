import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'
import { v4 as uuid } from "uuid";
import {uploadFileStream} from "../aws/s3.js";
import busboy from "busboy";

// Pipe request stream to middleware. Store picture in s3 and save s3 url in user database object.
// Returns the s3 url of pfp to client.
const updatePfp = (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user")
    const db = DB.getInstance()
    // Middleware handles request stream
    const uploader = busboy({headers: req.headers})
    // Init pfpUrl which will be given after s3 upload
    let pfpUrl: string;
    // Function executes when busboy finds file on form. Busboy processes stream
    uploader.on('file', async (fieldName, file, info) => {
        // Set s3 params for uploading
        // TODO: bucket from env
        const params = {
            Bucket: "codehive-profile-pics",
            Key: `${userId}-${info.filename}`,
            Body: file.buffer,
            ContentType: info.mimetype
        };
        // TODO: delete previous image from s3
        // Try upload file using params and file buffer
        uploadFileStream(params)
            .then((pfpS3Url) => {
            console.log(`Uploaded image ${pfpS3Url}.`);
            pfpUrl = pfpS3Url;
            res.json({pfpUrl: pfpS3Url});
            })
            .catch(error => {
                const msg: string = `An error occurred when uploading profile pic to s3: ${error}`
                console.log(msg)
                return res.status(500).json({message: msg})
            });
        // Once file stream is complete
        file.on('close', () => {
            console.log(`Saving pfp: ${pfpUrl} for user: ${userId}...`);
            // Store s3 url as field in user node in DB
            db.savePfp(userId, pfpUrl).then(value => {
                res.json(value);
            }).catch((error: any) => {
                throw new HttpError(error.message, 500);
            })
        })
    })
    // Pipe request stream to busboy instance
    req.pipe(uploader);
}


export { updatePfp }