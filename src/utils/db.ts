import { driver, auth, Session } from "neo4j-driver";
import dotenv from 'dotenv'
dotenv.config()

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

// const localDriver = driver(uri, auth.basic(user, password), {
//   disableLosslessIntegers: true,
// });

interface DB {
  localDriver: any;
}

class DB {
  constructor() {
    this.localDriver = driver(uri, auth.basic(user, password), {
      disableLosslessIntegers: true,
    });
  }

  async clear() {
    const session : Session = this.localDriver.session({ database: "neo4j" });

    try {
      const result = await session.writeTransaction(async (tx) => {
        // Cypher query to delete all nodes and relationships
        const query = 'MATCH (n) DETACH DELETE n';
        return await tx.run(query);
      });

      console.log('Database cleared successfully.');
    } catch (error) {
      console.error('Error clearing the database:', error);
    } finally {
      await session.close();
    }
  }

  async createUserUnique() {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const writeQuery = `CREATE CONSTRAINT FOR (u:User) REQUIRE u.email IS UNIQUE`;

      const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery)
      );

      // writeResult.records.forEach((record) => {
      //   const createdUser = record.get("u");
      //   console.info("CREATED USER: ", firstName);
      // });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      await session.close();
    }
  }
  async createUser({ firstName, lastName, email, password }) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
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
      });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      await session.close();
    }
  }

  async findUser(email : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (res, rej) => {
      try {
        const readQuery = `MATCH (u:User)
                                WHERE u.email = $email
                                RETURN u AS user`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { email })
        );

        readResult.records.forEach((record) => {
          res(record.get("user").properties);
        });
        res({})
      } catch (error) {
        console.error(`Something went wrong: ${error}`);
        rej(error);
      } finally {
        await session.close();
      }
    });
  }

  async createFriendRequest(user1Email : string, user2Email : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });

    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (u1:User {email: $user1Email}),
                                          (u2:User {email: $user2Email})
                                    CREATE (u1)-[r:FRIEND_REQUEST]->(u2)
                                    RETURN u1.email, type(r), u2.email`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { user1Email, user2Email })
        );
        writeResult.records.forEach((record) => {
          resolve(`${user1Email} sent ${user2Email} a friend req.`);
        });
      } catch (err) {
        reject(err);
      } finally {
        session.close();
      }
    });
  }

  async createFriendship(user1Email : string, user2Email : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const promiseArr = await Promise.all([this.removeFriendRequest(user1Email, user2Email), new Promise(async (resolve, reject) => {
        try {
          const writeQuery = `MATCH (u1:User {email: $user1Email}),
                                (u2:User {email: $user2Email})
                          CREATE (u1)-[r:FRIENDS]->(u2)
                          RETURN u1.email, type(r), u2.email`;
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

  async getFriendRequests(userEmail : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH p=(s:User)-[:FRIEND_REQUEST]->(u:User {email: $userEmail})
                                   RETURN s`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { userEmail })
        );
        results = readResult.records.map(record => record["_fields"][0].properties)
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        resolve(results);
      }
    });
  }

  async getFriends(user1Email : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH p=(s:User)-[:FRIENDS]-(u:User {email: $user1Email})
        RETURN s`;
        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Email })
        );
        await session.close();
        resolve(readResult.records.map(record => record["_fields"][0].properties))
        
      } catch (err) {
        await session.close();
        reject(err);
      }
    });
  }

  async searchUsers(searcher, searched) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u:User)
                                WHERE u.firstName CONTAINS $searched OR u.lastName CONTAINS $searched OR u.email CONTAINS $searched
                                RETURN u, 
                                EXISTS( (:User {email: $searcher})-[:FRIENDS]-(u) ),
                                EXISTS( (:User {email: $searcher})-[:FRIEND_REQUEST]-(u) )`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { searched, searcher })
        );
        results = readResult.records.map(record => record["_fields"][0].properties)
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        // console.log("178", results);

        resolve(results);
      }
    });
  }

  async getFriendshipStatus(user1Email, user2Email) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = {};
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (:User{email : $user1Email})-[r]-(:User{email : $user2Email})
                                   RETURN type(r) as type, startNode(r)`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Email, user2Email })
        );

        readResult.records.forEach((record) => {
          console.log("record", record);
          console.log("recordfields", record._fields);

          results = {
            friendshipStatus: record._fields[0],
            initiatedUser: record._fields[1].properties.email,
          };
        });
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        // console.log("178", results);

        resolve(results);
      }
    });
  }

  async getMutualFriends(user1Email, user2Email) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u1:User {email: $user1Email})-[:FRIENDS]-(f:User) [1,2,3,4,6]
                                    WHERE (f)-[:FRIENDS]-(:User {email: $user2Email}) 
                                    RETURN DISTINCT f`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Email, user2Email })
        );
        await session.close()
        resolve(readResult.records.map(record => record["_fields"][0].properties))
      } catch (err) {
        await session.close()
        reject(err);
      } 
    });
  }

  async removeFriendRequest(user1Email, user2Email) {
    const session = this.localDriver.session({ database: "neo4j" });
    console.log(user1Email, user2Email);

    const parameters = {
      user1Email,
      user2Email,
    };

    console.log(parameters);

    const query = `MATCH (:User {email: $user1Email})-[r]-(:User {email: $user2Email}) DELETE r`;
    return new Promise(async (resolve, reject) => {
      try {
        await session.run(query, parameters)
        console.log("Relationship deleted successfully");
        resolve("Relationship deleted successfully")
      }
      catch (error) {
        console.log(error)
        reject(error)
      }
      session.close()
    })
  }

  async createGroup(groupName, user1Email) {
    const session = this.localDriver.session({ database: "neo4j" });
    console.log('params', groupName, user1Email);
    
    try {
      const writeQuery = `CREATE (g:Group {groupName: $groupName})
                          WITH g
                          MATCH (u:User {email: $user1Email})
                          CREATE (g)<-[:MEMBER]-(u)`;

      const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { groupName, user1Email })
      );

      writeResult.records.forEach((record) => {
        const createdGroup = record.get("g");
        console.info("CREATED GROUP: ", groupName);
      });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      await session.close();
    }
  }

  async getGroups(user1Email) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u:User {email: $user1Email})-[:MEMBER]-(g:Group)
                           RETURN g`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Email })
        );

        readResult.records.forEach((record) => {
          console.log("record", record);
          console.log("recordfields", record._fields);
          results.push({
            groupName: record._fields[0].properties.groupName,
          });
        });
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        // console.log("178", results);

        resolve(results);
      }
    });
  }
}

export default DB;
