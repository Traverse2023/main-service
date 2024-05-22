import DB from './utils/db.js'
import bcrypt from "bcryptjs";
import StorageService from "./utils/storage-service.js";
import {randomUUID} from "crypto";
import AuthService from "./utils/auth-service.js";
import User from "./types/user.js";
import user from "./types/user.js";
import Group from "./types/group.js";

const db = DB.getInstance()

const authService: AuthService = AuthService.getInstance();

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


const createUsers = async (): Promise<string[]> => {
    try {
        const plainTextPassword: string = "123";

        const response: string[] = await Promise.all([
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "ioshir@traverse.zone",
                    plainTextPassword,
                    "Isfar",
                    "Oshir",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "fmashud@traverse.zone",
                    plainTextPassword,
                    "Farhan",
                    "Mashud",
                    ""
                    )).then( user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "bpalomo@traverse.zone",
                    plainTextPassword,
                    "Bryan",
                    "Palomo",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "jqiu@traverse.zone",
                    plainTextPassword,
                    "Junming",
                    "Qiu",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "aimran@traverse.zone",
                    plainTextPassword,
                    "Ahmed",
                    "Imran",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "arahi@traverse.zone",
                    plainTextPassword,
                    "Ahmed",
                    "Rahi",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "hali@traverse.zone",
                    plainTextPassword,
                    "Hamza",
                    "Ali",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "cmaranon@traverse.zone",
                    plainTextPassword,
                    "Carlos",
                    "Maranon",
                    ""
                )).then( user => {
                    console.log(`Created user: ${user}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "Srinath",
                    plainTextPassword,
                    "Srinivasan",
                    "ssrinivasan@traverse.zone",
                    ""
                    )).then( user => {
                    console.log(`Created user: ${user}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
        ]);
        return response
    } catch (err) {
        return err;
    }
}

const addUsersToGroup = async (groupId: string, users: string[]) => {
    try {
        for (const userId of users) {
            const res = await db.addMemberToGroup(userId, groupId);
            console.log(`User ${userId} added to group ${groupId}`, res);
        }
    } catch (err) {
        console.log(err);
    }
}


const createMainGroup = async (groupName: string, userId: string)  => {
    const group: Group =  await db.createGroup(groupName, userId);
    console.log(`Seed-script created group: ${group}`)
    return group;
}


const script = async () => {
    try {
        const clearResponse = await clear();
        console.log(clearResponse);
        //const userConstraint = await createUniqueUserConstraint();
        console.log("Loading seed data...");
        const usersCreatedIds: string[] = await createUsers();
        console.log(usersCreatedIds);
        const creatingUser: string = usersCreatedIds.pop();
        const groupName: string = "Traverse Admins";
        const group: Group = await createMainGroup(groupName, creatingUser);
        const groupId: string = group.groupId;
        await addUsersToGroup(groupId, usersCreatedIds);
        console.log("Seed-script executed successfully.");
    } catch (err) {
        console.log("Seed-script failed: ", err);
    }
}

script().then(val => process.exit()).catch(err => console.log(err));
