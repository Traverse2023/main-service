import { createSetup, findOneSetupExisting, findOneSetupNonExisting,
createFriendReqSetup, makeFriendSetup } from "./mock-consts.js";

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
  console.log("+++++++inside mock++++++")
  const { writeQuery, session } = createFriendReqSetup(user1Email, user2Email)
  return new Promise(async (resolve, reject) => {
    try {
      const writeResult = await session.run(writeQuery, { user1Email, user2Email })
      console.log("WRITE", writeResult)
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
  removeFriendRequest(user1Email, user2Email).then(() => {
      return new Promise(async (resolve, reject) => {
          try {
            const writeResult = await session.run(writeQuery, { user1Email, user2Email })
            resolve(`CREATED FRIENDSHIP BTWN: ${user1Email} and ${user2Email}`);
          } catch (err) {
            reject(`Something went wrong: ${err}`);
          } finally {
            await session.close();
          }
        });
  }).catch(err => console.error(err)).finally(() => {
      session.close()
  })
  
}

export async function removeFriendRequest(user1Email, user2Email) {
  const session = this.localDriver.session({ database: "neo4j" });
  console.log(user1Email, user2Email);

  const parameters = {
    user1Email,
    user2Email,
  };

  console.log(parameters);

  const query = `MATCH (:User {email: $user1Email})-[r]-(:User {email: $user2Email}) DELETE r`;

  session
    .run(query, parameters)
    .then(() => {
      console.log("Relationship deleted successfully");
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      session.close();
    });
}