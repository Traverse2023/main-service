





<<<<<<< HEAD
// const router = Router()

// router.use(checkAuth)

// router.get("/getNotifications/:userEmail", getNotifications)

// const notificationRouter = (notificationNamespace) => {
//     const notificationController = new NotificationController(notificationNamespace);

//     groupsNamespace.on('connection', (socket)=> {
//         const email = socket.handshake.query.email
//         notificationController.registerSocket(email, socket)

//         socket.on("disconnect", (recipientEmail, groupId))
//     })
// }
=======
const router = Router()

router.use(checkAuth)

router.get("/getNotifications/:userEmail", getNotifications)

const notificationRouter = (notificationNamespace) => {
    const notificationController = new NotificationController(notificationNamespace);

    groupsNamespace.on('connection', (socket)=> {
        const email = socket.handshake.query.email
        notificationController.registerSocket(email, socket)

        socket.on("disconnect", (recipientEmail, groupId)
    })
}
>>>>>>> fb425316e12174c43cdec421770adc37e6bd7d09
