import DB from './utils/db.js'
import bcrypt from "bcryptjs";

const db = DB.getInstance()

const clear = () => {
    return new Promise((resolve, reject) => {
        db.clear().then(response => resolve(response)).catch(err => reject(err))
    })
}

const createUniqueUserConstraint = () => {
    return new Promise((resolve, reject) => {
        db.createUserUnique().then(response => resolve(response)).catch(err => reject(err))
    })
}

const createUsers = async () => {
    try {
        const hashedPassword = await bcrypt.hash("123", 12);
        const hashedPassword2 = await bcrypt.hash("1234", 12);
        const hashedPassword3 = await bcrypt.hash("123", 12);
        const response = await Promise.all([
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Isfar",
                    lastName: "Oshir",
                    email: "isfaroshir@gmail.com",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Isfar");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Farhan",
                    lastName: "Mashud",
                    email: "fmash@gmail.com",
                    password: hashedPassword2
                }).then( _ => {
                    resolve("Farhan");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Bryan",
                    lastName: "Palomo",
                    email: "bp@gmail.com",
                    password: hashedPassword3
                }).then( _ => {
                    resolve("John");
                }).catch(err => reject(err));
            })
        ]);
        return "Following Users Created: " + response.join();
    } catch (err) {
        return err;
    }
}

const createFriendships = async () => {
    try {

        const user1Email = "isfaroshir@gmail.com"
        const user2Email = "fmash@gmail.com"
        const user3Email = "bp@gmail.com"
        await db.createFriendship(user1Email, user2Email)
        await db.createFriendship(user2Email, user3Email)
        return `Created friendship between ${user1Email} and ${user2Email} and ${user3Email} and ${user2Email}`

    } catch(error) { return error }
}

const createFriendRequests = async () => {
    try {
        await Promise.all([ 
            db.createFriendRequest("jDoe@gmail.com", "fmash@gmail.com"),
            db.createFriendRequest("jDoe@gmail.com", "isfaroshir@gmail.com")
        ])
        return "Friend request from jDoe@gmail.com successfully sent to fmash@gmail.com & isfaroshir@gmail.com"  
    } catch (error) { return error }
}


const script = async () => {
    try {
        const clearResponse = await clear()
        // const userConstraint = await createUniqueUserConstraint()
        console.log("Loading seed data...")
        const createUsersResponse = await createUsers()
        console.log(createUsersResponse)
        const createFriendshipsResponse = await createFriendships()
        console.log(createFriendshipsResponse)
        // const createFriendReqResponse = await createFriendRequests()
        // console.log(createFriendReqResponse)
    } catch (err) {
        console.log(err)
    }
}

script().then(response => process.exit()).catch(err => console.log(err))