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


const createUsers = async () => {
    try {
        const plainTextPassword: string = "123";

        const users = Promise.all([
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "ioshir@traverse.zone",
                    firstName: "Isfar",
                    lastName: "Oshir",
                    password: plainTextPassword,
                    }
                ).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "fmashud@traverse.zone",
                    firstName: "Farhan",
                    lastName: "Mashud",
                    password: plainTextPassword,
                    }
                ).then(user => {
                    console.log(`Created user: ${user}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "bpalomo@traverse.zone",
                    firstName: "Bryan",
                    lastName: "Palomo",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "jqiu@traverse.zone",
                    firstName: "Junming",
                    lastName: "Qiu",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "aimran@traverse.zone",
                    firstName: "Ahmed",
                    lastName: "Imran",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "arahi@traverse.zone",
                    firstName: "Ahmed",
                    lastName: "Rahi",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`);
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "hali@traverse.zone",
                    firstName: "Hamza",
                    lastName: "Ali",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
            new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "ssrinivasan@traverse.zone",
                    firstName: "Srinath",
                    lastName: "Srinivasan",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
	    new Promise<string>((resolve, reject) => {
                authService.createUser({
                    pfpUrl: "",
                    username: "zmyantro@gmail.com",
                    firstName: "Anthony",
                    lastName: "Zinsmeyer",
                    password: plainTextPassword,
                }).then(user => {
                    console.log(`Created user: ${JSON.stringify(user)}`)
                    resolve(user.id);
                }).catch(err => reject(err));
            }),
		
        ])
        return(users);
    } catch (err) {
        return err;
    }
}

const addUsersToGroup = async (groupId: string, userIds: string[]) => {
    try {
        console.log('here136', userIds)
        for (const userId of userIds) {
            await db.addMemberToGroup(userId, groupId);
            console.log(`User ${userId} added to group: ${groupId}`);
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
        console.log('here157', usersCreatedIds)
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
