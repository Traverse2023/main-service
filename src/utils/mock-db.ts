import { rejects } from "assert";
import { createSetup, findOneSetupExisting, findOneSetupNonExisting,
createFriendReqSetup, makeFriendSetup, removeFriendReqSetup } from "./mock-consts.js";

export async function createUser({ firstName, lastName, email, password }) {
  try {
    const { createUserQuery, session } = createSetup(firstName, lastName, email, password)
    await session.run(createUserQuery, { firstName, lastName, email, password })
    await session.close()
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
    throw error
  } finally {
    // await session.close()
  }
}

export async function findUser(email: string, existing: boolean) {
  return new Promise(async (res, rej) => {
    const { session, readQuery } = existing ? findOneSetupExisting(email) : findOneSetupNonExisting(email)
    try {
      const readResult = await session.readTransaction((tx) =>
        tx.run(readQuery, { email })
      );
      if (!readResult.records.length) {
        res({})
      }
      readResult.records.forEach((record) => res(record.get("user").properties));
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
      rej(error);
    } finally {
      await session.close();
    }
  })
}

export async function createFriendRequest(user1Email : string, user2Email : string) {
  const { writeQuery, session } = createFriendReqSetup(user1Email, user2Email)
  return new Promise(async (resolve, reject) => {
    try {
      await session.run(writeQuery, { user1Email, user2Email })
      resolve(`${user1Email} sent ${user2Email} a friend req.`);
    } catch (err) {
      reject(err);
    } finally {
      session.close();
    }
  });
}

export async function createFriendship(user1Email : string, user2Email : string) {
  const { writeQuery, session } = makeFriendSetup(user1Email, user2Email)
  try {
    const promiseArr = await Promise.all([removeFriendRequest(user1Email, user2Email), new Promise(async (resolve, reject) => {
      try {
        await session.run(writeQuery, { user1Email, user2Email })
        resolve(`CREATED FRIENDSHIP BTWN: ${user1Email} and ${user2Email}`);
      } catch (err) {
        reject(`Something went wrong: ${err}`);
      } finally {
        await session.close();
      }
    })])
    return promiseArr[1]

} catch(error) { console.log(error) }
}

export async function removeFriendRequest(user1Email, user2Email) {
  const { removeQuery, session } = removeFriendReqSetup(user1Email, user2Email)
  return new Promise(async (resolve) => {
  const parameters = {
    user1Email,
    user2Email,
  };

  console.log(parameters);

  try {
    await session.run(removeQuery, parameters)
    console.log("Relationship deleted successfully");
    resolve("Relationship deleted successfully")

  } catch (error) {
    console.error(error);
  }
  session.close()
  })
}