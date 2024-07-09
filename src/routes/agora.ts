// @ts-ignore
import {Router} from 'express'
import {getAgoraToken} from "../controllers/agora.js";

const router = Router()

router.get('/getToken/:channelId', getAgoraToken);

export { router }