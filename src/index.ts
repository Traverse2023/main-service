import express, { Express, Request, Response } from 'express'

import { router as friendRoutes} from './routes/friends.js'
import { router as chatRoutes } from './routes/chats.js'
import { router as authRoutes} from './routes/auth.js'
import { router as searchRoutes } from './routes/search.js'
import {router as userRoutes} from './routes/user.js'
import {groupsRouter, router as groupRoutes} from './routes/group.js'



//import {setup, serve} from 'swagger-ui-express'
//import swaggerFile from './swagger_output.json' assert {type: "json"}
import * as http from "http";
import {Server} from "socket.io";
import {friendsRouter} from "./routes/friends.js";

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
