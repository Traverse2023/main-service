import DB from './utils/db.js'
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

const db = new DB()

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
        const hashedPassword3 = await bcrypt.hash("123454", 12);
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
                    firstName: "John",
                    lastName: "Doe",
                    email: "jDoe@gmail.com",
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
        await db.createFriendship(user1Email, user2Email)
        return `Created friendship between ${user1Email} and ${user2Email}`

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

const createGroups = async () => {
    try {
        const id = uuidv4()
        await Promise.all([ axios.post(`${process.env.STORAGE_SERVICE_URL}/api/v1/groups/createGroup`, {groupName: `NYU-bros-${id}`}),
            db.createGroup(`NYU-bros-${id}`, `NYU-bros-${id}`, "fmash@gmail.com"),
        ])
        return `Group NYU-bros-${id} created successfully` 
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
        const createFriendReqResponse = await createFriendRequests()
        console.log(createFriendReqResponse)
        const createGroupResponse = await createGroups()
        console.log(createGroupResponse)
    } catch (err) {
        console.log(err)
    }
}

script().then(response => process.exit()).catch(err => console.log(err))