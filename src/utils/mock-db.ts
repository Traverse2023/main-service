import { createSetup, findOneSetupExisting, findOneSetupNonExisting } from "./mock-consts.js";

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