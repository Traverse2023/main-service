import DB from './utils/db.js'
import {response} from "express";
import bcrypt from "bcryptjs";
import {HttpError} from "./utils/http-error.js";

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
                }).then(response => {
                    resolve("Isfar");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "Farhan",
                    lastName: "Mashud",
                    email: "fmash@gmail.com",
                    password: hashedPassword2
                }).then(response => {
                    resolve("Farhan");
                }).catch(err => reject(err));
            }),
            new Promise((resolve, reject) => {
                db.createUser({
                    firstName: "John",
                    lastName: "Doe",
                    email: "jDoe@gmail.com",
                    password: hashedPassword3
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