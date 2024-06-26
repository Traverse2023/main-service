import { driver, auth, Session, Integer } from "neo4j-driver";
import dotenv from 'dotenv'
import { promiseHooks } from "v8";
import { resolve } from "path";
import { rejects } from "assert";
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
  // Single instance of DB
  private static instance: DB;

  private constructor() {
    this.localDriver = driver(uri, auth.basic(user, password), {
      disableLosslessIntegers: true,
    });
  }

  // To get instance of DB. Will always result in the same DB instance being returned
  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  async clear() {
    const session : Session = this.localDriver.session({ database: "neo4j" });

    try {
      const result = await session.executeWrite(async (tx) => {
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

  async savePFP(user1Email, pfpURL) {
    console.log('savePFP', user1Email, pfpURL)
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const writeQuery = `MERGE (u:User {email: $user1Email})
                                                    SET u.pfpURL = $pfpURL
                                                    RETURN u`;

      const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { user1Email, pfpURL })
      );

      writeResult.records.forEach((record) => {
        const updatedUser = record.get("u");
      });
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    } finally {
      await session.close();
    }
  }


  async createUser({ firstName, lastName, email, password, pfpURL="https://traverse-profile-pics.s3.amazonaws.com/pfps/blank-pfp.png" }) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const writeQuery = `CREATE (u:User { firstName: $firstName,
                                                 lastName: $lastName,
                                                 email: $email,
                                                 password: $password,
                                                 pfpURL: $pfpURL})`;

      const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { firstName, lastName, email, password, pfpURL })
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
          // console.log('findUserDB', record.get("user").properties)
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
                                WITH u, u.firstName + ' ' + u.lastName AS fullname
                                WHERE toLower(fullname) CONTAINS toLower($searched) OR toLower(u.firstName) CONTAINS toLower($searched) OR toLower(u.lastName) CONTAINS toLower($searched) OR u.email CONTAINS $searched
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
        resolve(results);
      }
    });
  }

  async getFriendshipStatus(user1Email, user2Email) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = {};
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (:User{email : $user1Email})-[r]-(:User{email : $user2Email})
                                   RETURN type(r) as type, startNode(r)`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Email, user2Email })
        );

        readResult.records.forEach((record) => {

          results = {
            friendshipStatus: record["_fields"][0],
            initiatedUser: record["_fields"][1].properties.email,
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
        const readQuery = `MATCH (u1:User {email: $user1Email})-[:FRIENDS]-(f:User)
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
    const parameters = {
      user1Email,
      user2Email,
    };
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

  async unfriend(user1Email, user2Email) {
    const session = this.localDriver.session({ database: "neo4j" });
    const parameters = {
      user1Email,
      user2Email,
    };
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

  async createGroup(groupId: String, groupName: String, user1Email: String) {
    const session = this.localDriver.session({ database: "neo4j" });

    try {
      const writeQuery = `CREATE (g:Group {id: $groupId, groupName: $groupName})
                          WITH g
                          MATCH (u:User {email: $user1Email})
                          CREATE (g)<-[:MEMBER]-(u)`;

      const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { groupId, groupName, user1Email })
      );

      writeResult.records.forEach((record) => {
        const createdGroup = record.get("g");
        console.log("CREATED GROUP: ", groupName);
      });
      // await sendCreateGroupJob(groupName, user1Email)
      // Currently initializes channels when a group is created
      // TODO: Replace this with code to add channels through the add channel button
      this.createChannel(groupId, "general");
      this.createChannel(groupId, "announcements");
      this.createChannel(groupId, "events");
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
          console.log('dbGetGroup', record._fields[0].properties)
          results.push({
            groupName: record._fields[0].properties.groupName,
            groupId: record._fields[0].properties.id
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

  async getMembers(id) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u:User)-[:MEMBER]->(Group {id: $id})
                                   RETURN u`;

        const readResult = await session.executeRead((tx) =>
            tx.run(readQuery, { id })
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

  async getFriendsWhoAreNotMembers(user1Email, id) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (:User {email:$user1Email})-[:FRIENDS]-(u:User)
                                                      WHERE NOT (u)-[:MEMBER]-(:Group {id: $id})
                                                      RETURN u`;

        const readResult = await session.executeRead((tx) =>
            tx.run(readQuery, { user1Email, id })
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

  async addMembersToGroup(userEmails: string | string[], groupId: string): Promise<void> {
    const session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (resolve, reject) => {
      try {
        if (Array.isArray(userEmails)) {
          for (const userEmail of userEmails) {
            const writeQuery = `
                        MATCH (u:User {email: $userEmail})
                        MATCH (g:Group {id: $groupId})
                        CREATE (u)-[r:MEMBER]->(g)
                        RETURN u, g
                    `;
            await session.run(writeQuery, { userEmail, groupId });
          }
        } else {
          const writeQuery = `
                    MATCH (u:User {email: $userEmails})
                    MATCH (g:Group {id: $groupId})
                    CREATE (u)-[r:MEMBER]->(g)
                    RETURN u, g
                `;
          await session.run(writeQuery, { userEmails, groupId });
        }
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }
  
  // Creates a channel node and links it the the parent group
  // channelUuid is groupId#channelName
  async createChannel(groupId: String, channelName: String) {
    const channelUuid : String =  groupId.toString() + "#" + channelName.toString();
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];

    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (g:Group {id: $groupId})
        MERGE (c:Channel {groupId: $groupId, channelUuid: $channelUuid})
        MERGE (c)-[:CHANNEL]->(g)
        RETURN g, c`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { groupId, channelUuid })
        );

        console.log("CREATED CHANNEL FOR: ", groupId, "<-", channelUuid);

        // await sendCreateGroupJob(groupName, user1Email)
      } catch (error) {
        console.error(`Something went wrong: ${error}`);
        reject(error);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }

  // Creates a channel node and links it the the parent group
  async deleteChannel(channelUuid: string, groupId: Integer) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (c:Channel {groupId: $groupId, channelUuid: $channelUuid})-[:CHANNEL]->(g:Group {id: $groupId}) 
        DETACH DELETE c`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { groupId, channelUuid })
        );
        console.log("DELETED CHANNEL FOR: ", groupId, "<-", channelUuid);

        // await sendCreateGroupJob(groupName, user1Email)
      } catch (error) {
        console.error(`Something went wrong: ${error}`);
        reject(error);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }

  // Saves when user joins a channel to neo4j, links user's node to channel when user joins
  async joinChannel(userEmail: String, channelUuid: String) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      console.log(userEmail, channelUuid)
      try {
        const writeQuery = `MATCH (u:User {email: $userEmail})
        MATCH (c:Channel {channelUuid: $channelUuid})
        MERGE (u)-[r:CHANNELMEMBER]->(c)
        RETURN u, c`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { userEmail, channelUuid })
        );

        console.log(writeResult);

      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }

  // Removes user's link to channel when user leaves a channel
  async leaveAllChannels(userEmail: String) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (u:User {email: $userEmail})
        MATCH (c:Channel)
        MATCH (u)-[r:CHANNELMEMBER]->(c)
        DELETE r
        RETURN u, c`;

        const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { userEmail })
        );

      } catch (err) {
        console.log("leaveAllChannels FAILED", userEmail);
        reject(err);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }
}


export default DB;
