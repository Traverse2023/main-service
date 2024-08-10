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
        db.addUserUniqueConstraint().then(response => resolve(response)).catch(err => reject(err))
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
                    resolve("ioshir@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Farhan",
                    lastName: "Mashud",
                    email: "fmashud@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("fmashud@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Bryan",
                    lastName: "Palomo",
                    email: "bpalomo@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("bpalomo@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Junming",
                    lastName: "Qiu",
                    email: "jqiu@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("jqiu@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Ahmed",
                    lastName: "Imran",
                    email: "aimran@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("aimran@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Ahmed",
                    lastName: "Rahi",
                    email: "arahi@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("arahi@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Hamza",
                    lastName: "Ali",
                    email: "hali@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("hali@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Carlos",
                    lastName: "Maranon",
                    email: "cmaranon@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("cmaranon@traverse.zone");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Srinath",
                    lastName: "Srinivasan",
                    email: "ssrinivasan@traverse.zone",
                    password: hashedPassword
                }).then( _ => {
                    resolve("ssrinivasan@traverse.zone");
                }).catch(err => reject(err));
            }),
        ]);
        console.log(response, 'response')
        return response
    } catch (err) {
        return err;
    }
}

const addUsersToGroup = async (groupId: String, createUsersResponse) => {
    let members = createUsersResponse
    members = members.filter(email => email !== "bpalomo@traverse.zone")
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
        await addUsersToGroup(groupId, createUsersResponse);
        console.log("Seed-script executed successfully.");
    } catch (err) {
        console.log("Seed-script failed: ", err);
    }
}

script().then(val => process.exit()).catch(err => console.log(err));
