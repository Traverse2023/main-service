import express, { Express, Request, Response } from 'express'

import { router as friendRoutes} from './routes/friends.js'
import { router as chatRoutes } from './routes/chats.js'
import { router as authRoutes} from './routes/auth.js'
import { router as searchRoutes } from './routes/search.js'
import {router as userRoutes} from './routes/user.js'
import {groupsRouter, router as groupRoutes} from './routes/group.js'
import pkg from 'agora-access-token'
const { RtcTokenBuilder, RtcRole } = pkg
import { v4 as uuidv4 } from 'uuid';

//import {setup, serve} from 'swagger-ui-express'
//import swaggerFile from './swagger_output.json' assert {type: "json"}
import * as http from "http";
import {Server} from "socket.io";
import {friendsRouter} from "./routes/friends.js";
import {randomUUID} from "crypto";

const app: Express = express()

const PORT = process.env.PORT || 8000

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.get("/", (req, res) => {
  console.log("Invoking health endpoint")
  res.send("Healthy")
})

function hashStringToInteger(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

app.get("/getAgoraToken/:email/:channelName", (req, res) => {
  const appId = '056e7ee25ec24b4586f17ec177e121d1';
  const appCertificate = 'aa92b0a26b154fb191a2fd43003bf854'; // Or null if not using certificate
  const channelName = req.params.channelName;
  const email = req.params.email
  console.log('channelName', channelName)
  // const uid = 0
  const role = RtcRole.PUBLISHER; // Role of the user (publisher, subscriber)
  const expirationTimeInSeconds = 3600; // 1 hour expiration time
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const uid = uuidv4()
  const uidInt = hashStringToInteger(uid)
  // const uidInt = Math.floor(Math.random() * 1000000)
  console.log('uidInt', uidInt)
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uidInt, role, privilegeExpiredTs);
  console.log('Agora Token:', token, 'uid' , uid);

  res.json({token: token, uid: uidInt, email: email})
})

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/group", groupRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/friends", friendRoutes)
app.use("/api/chats", chatRoutes)
// app.use("/api/notifications", notificationRoutes)
//app.use('/doc', serve, setup(swaggerFile))

app.use((error, req, res, next) => {
if (res.headerSent) {
  return next(error);
}
res.status(error.code || 500)
res.json({message: error.message || 'An unknown error occurred!'});
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],

  }
});

const friendsNamespace = io.of('/friends');
const friendsController = friendsRouter(friendsNamespace)

const groupsNamespace = io.of('/groups');
groupsRouter(groupsNamespace)

const notificationsNamespace = io.of('/notifications');
// notificationRouter(notificationsNamespace)

server.listen(PORT, () => {
    console.log(`Server on ${PORT}... 26`);
})

