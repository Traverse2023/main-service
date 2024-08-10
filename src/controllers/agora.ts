import {NextFunction, Request, Response} from "express";
import {HttpError} from "../utils/http-error.js";
import pkg from 'agora-access-token';
const { RtcRole, RtcTokenBuilder } = pkg;

function hashIdToInteger(userId: string) {
    let idAsInt = 0;
    if (userId.length === 0) return idAsInt;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        idAsInt = ((idAsInt << 5) - idAsInt) + char;
        idAsInt |= 0; // Convert to 32-bit integer
    }
    idAsInt = Math.abs(idAsInt);
    console.log(`Encoded userId: ${userId} into int: ${idAsInt}`);
    return idAsInt;
}

const getAgoraToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Creating agora token...")
    try {
    const userId: string = req.header("x-user")
    const appId = '056e7ee25ec24b4586f17ec177e121d1';
    const appCertificate = 'aa92b0a26b154fb191a2fd43003bf854'; // Or null if not using certificate
    const channelId = req.params.channelId;
    const role = RtcRole.PUBLISHER; // Role of the user (publisher, subscriber)
    const expirationTimeInSeconds = 3600; // 1 hour expiration time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiration = currentTimestamp + expirationTimeInSeconds;
    console.log(`Creating agora token with config: userId: ${userId}\nappId: ${appId}\nappCertificate: ${appCertificate}
    channelId: ${channelId}\nrole: ${role}\nexpiration: ${expiration}`);
    const userIdInt = hashIdToInteger(userId);
    const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelId, userIdInt, role, expiration);
    console.log('Agora Token:', token, 'uid' , userIdInt);
    res.json({token: token, uid: userIdInt})
    } catch (err) {
        console.log(`An error occurred while creating agoraToken: ${err.message}`);
        throw new HttpError(err, 404);
    }
};

export { getAgoraToken };