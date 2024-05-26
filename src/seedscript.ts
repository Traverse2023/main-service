import DB from './utils/db.js'
import AuthService from "./utils/auth-service.js";
import User from "./types/user.js";
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
                    "Isfar",
                    "Oshir",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "fmashud@traverse.zone",
                    "Farhan",
                    "Mashud",
                    "",
                    plainTextPassword,
                    )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "bpalomo@traverse.zone",
                    "Bryan",
                    "Palomo",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "jqiu@traverse.zone",
                    "Junming",
                    "Qiu",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "aimran@traverse.zone",
                    "Ahmed",
                    "Imran",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "arahi@traverse.zone",
                    "Ahmed",
                    "Rahi",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "hali@traverse.zone",
                    "Hamza",
                    "Ali",
                    "",
                    plainTextPassword,
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser( new User(
                    "cmaranon@traverse.zone",
                    "Carlos",
                    "Maranon",
                    "",
                    plainTextPassword
                )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser(new User(
                    "ssrinivasan@traverse.zone",
                    "Srinath",
                    "Srinivasan",
                    "",
                    plainTextPassword,
                    )).then( user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
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
            await db.addMemberToGroup(userId, groupId);
            console.log(`User ${userId} added to group ${groupId}`);
        }
    } catch (err) {
        console.log(err);
    }
}


const createMainGroup = async (groupName: string, userId: string)  => {
    return await db.createGroup(groupName, userId);
}


const script = async () => {
    try {
        console.log("Running seed-script with default data...");
        await clear();
        const usersCreatedIds: string[] = await createUsers();
        const creatingUser: string = usersCreatedIds.pop();
        const groupName: string = "Traverse Admins";
        const group: Group = await createMainGroup(groupName, creatingUser);
        console.log(`Successfully created group: ${JSON.stringify(group)}`);
        const groupId: string = group.groupId;
        await addUsersToGroup(groupId, usersCreatedIds);
        console.log("Seed-script executed successfully.");
    } catch (err) {
        console.log("Seed-script failed with error: ", err);
    }
}


script().then(() => process.exit()).catch(err => console.log(err));
