import express, { Express, Request, Response } from 'express'

import { router as friendRoutes} from './routes/friends.js'
import { router as chatRoutes } from './routes/chats.js'
import { router as authRoutes} from './routes/auth.js'
import { router as searchRoutes } from './routes/search.js'
import { router as groupRoutes } from './routes/group.js'

import {setup, serve} from 'swagger-ui-express'
import swaggerFile from './swagger_output.json' assert {type: "json"}
import * as http from "http";
import {Server} from "socket.io";
import {friendsRouter} from "./routes/friends.js";

const app: Express = express()

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

app.use("/api/auth", authRoutes)
app.use("/api/group", groupRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/friends", friendRoutes)
app.use("/api/chats", chatRoutes)
app.use('/doc', serve, setup(swaggerFile))

  
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
friendsRouter(friendsNamespace)

// // Define a namespace for friends
// const friendsNamespace = io.of('/friends');
//
// const userSockets = new Map();

// friendsNamespace.on('connection', (socket) => {
//   // When a user connects, get their email from the query parameter
//   const email = socket.handshake.query.email;
//   console.log(email, "joined")
//   // Store the user's socket with their email
//   userSockets.set(email, socket);
//
//   // Listen for friend requests and emit to the recipient
//   socket.on('sendFriendRequest', (recipientEmail) => {
//     const recipientSocket = userSockets.get(recipientEmail);
//
//     if (recipientSocket) {
//       console.log("sending to friend req to", recipientEmail)
//       console.log('index77', email)
//       recipientSocket.emit('receiveFriendRequest', email);
//     }
//   });
// });

server.listen(8000, () => {
    console.log(`Server on 8000`);
})
