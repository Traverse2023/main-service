import express, {Router, Request, Response, NextFunction} from 'express'
import { HttpError } from '../utils/http-error.js'
import DB from '../utils/db.js'
import { v4 as uuid } from "uuid";
import {uploadFileStream} from "../aws/s3.js";
import busboy from "busboy";
import * as stream from "node:stream";
import fs from 'fs';
import {WritableStream} from "node:stream/web";

// Pipe request stream to middleware. Store picture in s3 and save s3 url in user database object.
// Returns the s3 url of pfp to client.
const updatePfp =  async (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.header("x-user")
    const db = DB.getInstance()
    const uploader = busboy({headers: req.headers});
    // TODO: get bucket from envs
    const bucket = "codehive-profile-pics";
    const pfpStream = new stream.PassThrough();
    let contentType = "";
    uploader.on('file', (fieldName: string, fileStream: stream, {filename, encoding, mimeType}) => {
        contentType = mimeType;
        fileStream.pipe(pfpStream);
    });

    uploadFileStream(bucket, userId, contentType, pfpStream)
        .then((url) => {
            console.log(`File uploaded successfully to: ${url}.`);
            db.savePfp(userId, url)
                .then((url) => {
                    console.log(`User ${userId} profile picture updated to ${url}`);
                    res.json({pfpUrl: url});
                })
                .catch((err) => {
                    console.log(`An error occurred when updating user pfp in db:\n${err.message}`);
                })
        })
        .catch((err) => {
            console.log(`An error occurred uploading file ${userId} to S3: ${err.message}`);
        });
    // Pipe request stream to busboy
    return req.pipe(uploader);
}


export { updatePfp }