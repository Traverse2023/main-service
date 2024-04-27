import express, { Express, Request, Response } from 'express'

import { router as friendRoutes} from './routes/friends.js'
import { router as chatRoutes } from './routes/chats.js'
import { router as searchRoutes } from './routes/search.js'
import {router as userRoutes} from './routes/user.js'
import {groupsRouter, router as groupRoutes} from './routes/group.js'
import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg
import * as http from "http";
import {Server} from "socket.io";
import {friendsRouter} from "./routes/friends.js";
import {notificationsRouter} from "./routes/notifications.js";
// @ts-ignore
import {DefaultEventsMap} from "socket.io/dist/typed-events.js";


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

app.get("/getAgoraToken/:channelName", (req, res) => {
  const appId = '056e7ee25ec24b4586f17ec177e121d1';
  const appCertificate = 'aa92b0a26b154fb191a2fd43003bf854'; // Or null if not using certificate
  const channelName = req.params.channelName;
  const userId = req.header("x-user");

  const role = RtcRole.PUBLISHER; // Role of the user (publisher, subscriber)
  const expirationTimeInSeconds = 3600; // 1 hour expiration time
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expiration = currentTimestamp + expirationTimeInSeconds;
  const userIdInt = hashStringToInteger(userId);
  console.log('uidInt', userIdInt);
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, expiration, expiration);
  console.log('Agora Token:', token, 'uid' , userIdInt);

  res.json({token: token, uid: userIdInt})
})


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

const io:  Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

const notificationsNamespace = io.of('/notifications');
notificationsRouter(notificationsNamespace, io);

const friendsNamespace = io.of('/friends');
friendsRouter(friendsNamespace, notificationsNamespace, io);

const groupsNamespace = io.of('/groups');
groupsRouter(groupsNamespace, notificationsNamespace);




server.listen(PORT, () => {
    console.log(`Server on ${PORT}...`);
})

