import express, { Express, Request, Response } from 'express'

import { router as friendRoutes} from './routes/friends.js'
import { router as chatRoutes } from './routes/chats.js'
import { router as authRoutes} from './routes/auth.js'
import { router as searchRoutes } from './routes/search.js'
import { router as groupRoutes } from './routes/group.js'

import {setup, serve} from 'swagger-ui-express'
import swaggerFile from './swagger_output.json' assert {type: "json"}


const app: Express = express()

app.use(express.json())

app.use((req, res, next) => {
  console.log("HEADERS SET")

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
app.get("/Z", (req, res) => {
  res.json("HELLO")
})


// app.use((req, res, next) => {
//     const error = new HttpError('Could not find this route.', 404);
//     throw error;
//   });
  
  app.use((error, req, res, next) => {
    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
  });

app.listen(8001, () => {
    console.log(`Server on 8001`);
})