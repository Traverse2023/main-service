import DB from './utils/db.js'
import bcrypt from "bcryptjs";
import StorageService from "./utils/storage-service.js";
import {randomUUID} from "crypto";

const db = DB.getInstance()

const storageService: StorageService = StorageService.getInstance();

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

        const response = await Promise.all([
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Isfar",
                    lastName: "Oshir",
                    email: "ioshir@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Isfar");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Farhan",
                    lastName: "Mashud",
                    email: "fmashud@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Farhan");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Bryan",
                    lastName: "Palomo",
                    email: "bpalomo@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Bryan");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Junming",
                    lastName: "Qiu",
                    email: "jqiu@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Junming");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Ahmed",
                    lastName: "Imran",
                    email: "aimran@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Ahmed I");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Ahmed",
                    lastName: "Rahi",
                    email: "arahi@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("Ahmed R");
                }).catch(err => reject(err));
            })
        ]);
        return "Following Users Created: " + response.join();
    } catch (err) {
        return err;
    }
}

// const createFriendships = async () => {
//     try {
//
//         const user1Email = "isfaroshir@gmail.com"
//         const user2Email = "fmash@gmail.com"
//         const user3Email = "bp@gmail.com"
//         await db.createFriendship(user1Email, user2Email)
//         await db.createFriendship(user2Email, user3Email)
//         return `Created friendship between ${user1Email} and ${user2Email} and ${user3Email} and ${user2Email}`
//
//     } catch(error) { return error }
// }

// const createFriendRequests = async () => {
//     try {
//         await Promise.all([
//             db.createFriendRequest("bp@gmail.com", "fmash@gmail.com"),
//             db.createFriendRequest("bp@gmail.com", "isfaroshir@gmail.com")
//         ])
//         return "Friend request from bp@gmail.com successfully sent to fmash@gmail.com & isfaroshir@gmail.com"
//     } catch (error) { return error }
// }


const addUsersToGroup = async (groupId: String) => {
    const members: String[] = [
        'ioshir@traverse.zone',
        'fmashud@traverse.zone',
        'jqiu@traverse.zone',
        'aimran@traverse.zone',
        'arahi@traverse.zone',
    ];
    try {
        for (const memberEmail of members) {
            const res = await db.addMemberToGroup(memberEmail, groupId);
            console.log("User added to group: ", memberEmail);
        }

    } catch (err) {
        console.log(err);
    }
}

const createMainGroup = async (groupName: String, groupUUID: String) => {
    await db.createGroup(groupUUID, groupName, "bpalomo@traverse.zone");
}



const script = async () => {
    try {
        const clearResponse = await clear();
        console.log(clearResponse);
        //const userConstraint = await createUniqueUserConstraint();
        console.log("Loading seed data...");
        const createUsersResponse = await createUsers();
        console.log(createUsersResponse);
        const groupId = randomUUID().toString();
        const name = "Traverse Admins"
        await createMainGroup(name, groupId);
        await addUsersToGroup(groupId);
        console.log("Seed-script executed successfully.");
    } catch (err) {
        console.log("Seed-script failed: ", err);
    }
}

script().then(val => process.exit()).catch(err => console.log(err));
