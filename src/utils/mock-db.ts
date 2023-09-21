import { Session } from "neo4j-driver";

export async function createUser({ firstName, lastName, email, password }, session: Session) {
    try {
      const writeQuery = `CREATE (u:User { firstName: $firstName,
                                                 lastName: $lastName,
                                                 email: $email,
                                                 password: $password})`;

      const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { firstName, lastName, email, password })
      );

      writeResult.records.forEach((record) => {
        const createdUser = record.get("u");
        console.info("CREATED USER: ", firstName);
      });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      await session.close();
    }
}