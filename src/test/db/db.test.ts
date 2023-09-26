import test from 'ava'
import { createUser  as createUserMock} from "../../utils/mock-db.js"
import bcrypt from 'bcrypt'

test("createUser no error thrown", async t => {

    const createUserParams = {
        "firstName": "Farhan",
        "lastName": "Mashud",
        "email": "mashudf37+test@gmail.com",
        "password": "1234"
      }

    await t.notThrowsAsync(async () => {
        await createUserMock(createUserParams)
    })
    
})

