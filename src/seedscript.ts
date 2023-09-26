import DB from './utils/db.js'
import {response} from "express";

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
        const response = await Promise.all([
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Isfar",
                    lastName: "Oshir",
                    email: "isfaroshir@gmail.com",
                    password: "123"
                }).then(response => {
                    resolve("Isfar");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Farhan",
                    lastName: "Mashud",
                    email: "fmash@gmail.com",
                    password: "1234"
                }).then(response => {
                    resolve("Farhan");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "John",
                    lastName: "Doe",
                    email: "jDoe@gmail.com",
                    password: "123454"
                }).then(response => {
                    resolve("John");
                }).catch(err => reject(err));
            })
        ]);
        return "Following Users Created: " + response.join();
    } catch (err) {
        return err;
    }
}

const script = async () => {
    try {
        const clearResponse = await clear()
        // const userConstraint = await createUniqueUserConstraint()
        console.log("Loading seed data...")
        const createUsersResponse = await createUsers()
        console.log(createUsersResponse)
    } catch (err) {
        console.log(err)
    }
}

script().then(response => process.exit()).catch(err => console.log(err))