import {driver, auth, Session, Integer, Record} from "neo4j-driver";
import dotenv from 'dotenv';
import Group from "../types/group.js";

dotenv.config()

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;


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
        return tx.run(query);
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
      const writeQuery = `CREATE CONSTRAINT FOR (u:User) REQUIRE u.username IS UNIQUE`;

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

  async savePFP(userId: string, pfpURL: string) {
    console.log('savePFP', userId, pfpURL)
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const writeQuery = `MERGE (u:User) WHERE elementId(u) = $userId
                                                    SET u.pfpURL = $pfpURL
                                                    RETURN u`;

      const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { userId, pfpURL })
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


  async findUserById(userId : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (res, rej) => {
      try {
        console.log(`Getting user with id: ${userId} from DB`);
        const readQuery = `MATCH (n:User) WHERE elementId(n) = $userId 
        RETURN {id:elementId(n), email:n.username, firstName:n.firstName, lastName:n.lastName, pfpUrl:n.pfpURL } AS user`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { userId })
        );
        const user = readResult.records.map((record: Record) => {
          return record.get("user");
        })[0];
        console.log(`Retrieved user: ${user}`);
        res(user)
      } catch (error) {
        console.error(`An error occurred when performing getUser: ${error}`);
        rej(error);
      } finally {
        await session.close();
      }
    });
  }


  async createFriendRequest(userId : string, potentialFriendId : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });

    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (u1:User) WHERE elementId(u1) = $user1Id,
                                          (u2:User) WHERE elementId(u1) = $user2Id
                                    CREATE (u1)-[r:FRIEND_REQUEST]->(u2)
                                    RETURN u1.username, type(r), u2.username`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { userId, potentialFriendId })
        );
        console.log(`Create friend request result: ${writeResult}`);
        writeResult.records.forEach((record) => {
          resolve(record.get(""));
        });
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  async createFriendship(user1Id : string, user2Id : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    try {
      const promiseArr = await Promise.all([this.removeFriendRequest(user1Id, user2Id), new Promise(async (resolve, reject) => {
        try {
          const writeQuery = `MATCH (u1:User) WHERE elementId(u1) = $user1Id,
                                (u2:User) WHERE elementId(u2) = $user2Id
                          CREATE (u1)-[r:FRIENDS]->(u2)
                          RETURN u1.username, type(r), u2.username`;
          await session.run(writeQuery, {  user1Id, user2Id })
          resolve(`CREATED FRIENDSHIP: ${user1Id} and ${user2Id}`);
        } catch (err) {
          reject(`Something went wrong: ${err}`);
        } finally {
          await session.close();
        }
      })])
      return promiseArr[1]
  
  } catch(error) { console.log(error) }
  }


  async getFriendRequests(userId : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH p=(s:User)-[:FRIEND_REQUEST]->(u:User) WHERE elementId(u) = $userId
                                   RETURN s`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { userId })
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


  async getFriends(userId : string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH p=(s:User)-[:FRIENDS]-(u:User) WHERE elementId(u) = $userId
        RETURN s`;
        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { userId })
        );
        await session.close();
        console.log(`Get friends db response: ${readResult}`);
        resolve(readResult.records.map(record => record["_fields"][0].properties))
        
      } catch (err) {
        await session.close();
        reject(err);
      }
    });
  }


  async searchUsers(searchingUserId: string, searched: string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u:User)
                                WITH u, u.firstName + ' ' + u.lastName AS fullname
                                WHERE toLower(fullname) CONTAINS toLower($searched) OR toLower(u.firstName) CONTAINS toLower($searched) OR toLower(u.lastName) CONTAINS toLower($searched) OR u.username CONTAINS $searched
                                RETURN u, 
                                MATCH (u1:User) WHERE elementId(u1) = $searchingUserId
                                EXISTS( u1-[:FRIENDS]-(u) ),
                                EXISTS( u1-[:FRIEND_REQUEST]-(u) )`;
        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { searched, searchingUserId})
        );
        results = readResult.records.map(record => record["_fields"][0].properties);
        console.log(`Search users executed...`);
        resolve(results);
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  async getFriendshipStatus(user1Id: string, user2Id: string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = {};
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u1:User)-[r]-(u2:User) 
        WHERE elementId(u1) = $user1Id AND elementId(u2) = $user2Id
        RETURN type(r) as type, elementId(startNode(r))`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Id, user2Id })
        );
        readResult.records.forEach((record: Record) => {
          results = {
            friendshipStatus: record["_fields"][0],
            initiatedUser: record["_fields"][1]
          };
        });
        console.log(`Get friendship status succeeded: ${results}`);
        resolve(results);
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  async getMutualFriends(user1Id: string, user2Id: string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });

    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (u1:User)-[:FRIENDS]-(fof:User), 
        (u2:User)-[:FRIENDS]-(fof:User) WHERE elementId(u1) = $user1Id AND elementId(u2) = $user2Id
        RETURN DISTINCT fof`;
        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { user1Id, user2Id })
        );
        console.log(`"Get mutual friends succeeded`)
        resolve(readResult.records.map((record: Record) => record["_fields"][0].properties))
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  async removeFriendRequest(user1Id: string, user2Id: string) {
    const session: Session = this.localDriver.session({ database: "neo4j" });
    const parameters = { user1Id, user2Id };
    const query = `MATCH (u1:User)-[r]-(u2:User) WHERE elementId(u1) = $user1Id AND 
    elementId(u2) = $user2Id DELETE r`;
    return new Promise(async (resolve, reject) => {
      try {
        await session.run(query, parameters);

        resolve("Relationship deleted successfully")
        console.log(`Removed friend request between user: ${user1Id} and user: ${user2Id}`);
      } catch (error) {
        console.log(`Remove friend request failed with error: ${error}`);
        reject(error)
      } finally {
        await session.close()
      }
    })
  }


  async unfriend(user1Id: string, user2Id: string) {
    const session = this.localDriver.session({ database: "neo4j" });
    const parameters = { user1Id, user2Id };
    const query = `MATCH (u1:User)-[r]-(u2:User) 
    WHERE elementId(u1) = $user1Id AND elementId(u2) = $user2Id 
    DELETE r`;
    return new Promise(async (resolve, reject) => {
      try {
        await session.run(query, parameters)
        console.log(`Relationship between user: ${user1Id} and user: ${user2Id} deleted.`);
        resolve("Relationship deleted successfully")
      } catch (error) {
        console.log(error)
        reject(error)
      } finally {
        session.close()
      }
    })
  }


  async createGroup(groupName: string, userId: string): Promise<Group>  {
    const session = this.localDriver.session({ database: "neo4j" });
    return new Promise( async(resolve, reject) => {
      try {
        const writeQuery = `CREATE (g:Group { groupName: $groupName }) WITH g
      MATCH (u:User) WHERE elementId(u) = $userId CREATE (g)<-[:MEMBER]-(u) return g{.*, id: elementId(g)}`;

        const writeResult = await session.executeWrite((tx) =>
            tx.run(writeQuery, {groupName, userId})
        );
        const group: Group = writeResult.records.map((record: Record) => {
          return new Group(record.get("g").id, record.get("g").groupName);
        })[0];

        console.log(`Created group ${JSON.stringify(group)}`);
        // Create default channels with new group
        await this.createChannel("general", group.groupId);
        await this.createChannel("announcements", group.groupId);
        await this.createChannel("plans", group.groupId);
        console.log(`Created group: ${JSON.stringify(group)}`);
        resolve(group);
      } catch (error) {
        console.error(`Create group failed with error: ${error}`);
        reject(error);
      } finally {
        await session.close();
      }
    })
  }


  async getGroups(userId: string) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Getting groups for user ${userId}`);
        const readQuery = `MATCH (u:User)-[:MEMBER]-(g:Group) WHERE elementId(u) = $userId RETURN g{.*, id: elementId(g)}`;

        const readResult = await session.executeRead((tx) =>
          tx.run(readQuery, { userId })
        );
        readResult.records.map((record: Record) => {
          const group: Group =  new Group(record.get("g").id, record.get("g").groupName);
          results.push(group);
        });
        console.log(`Get groups for user ${userId}: ${JSON.stringify(results)}`, );
        resolve(results);
      } catch (err) {
        console.log(`An error occurred when performing getGroups ${err}`)
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  async getMembers(groupId: string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      console.log(`Getting members for group ${groupId}`)
      try {
        const readQuery =
            `MATCH (u:User)-[:MEMBER]->(g:Group) WHERE elementId(g) = $groupId RETURN {id: elementId(u), username: u.username, firstName: u.firstName, lastName: u.lastName, pfpUrl: u.pfpUrl} as u`;
        const readResult = await session.executeRead((tx) =>
            tx.run(readQuery, { groupId })
        );
        results = readResult.records.map(record => record.get("u"));
        console.log(`Get members DB result: ${results}`);
        resolve(results);

      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }

  async addMemberToGroup(userId: string, groupId: string): Promise<void> {
    const session = this.localDriver.session({ database: "neo4j" });
    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `
                          MATCH (u:User) WHERE elementId(u) = $userId
                          MATCH (g:Group) WHERE elementId(g) = $groupId
                          CREATE (u)-[r:MEMBER]->(g)
                          RETURN u, g`;
        await session.run(writeQuery, {userId, groupId});
        resolve();
      } catch (err) {
        console.log(`An error occurred when performing addMembersToGroup: ${err.message}`);
        reject(err);
      } finally {
        await session.close();
      }
    });
  }

  async getFriendsWhoAreNotMembers(userId: string, groupId: string) {
    const session : Session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const readQuery = `MATCH (g:Group) WHERE elementId(g) = $groupId MATCH (u:User)-[:FRIENDS]-(u2:User) WHERE NOT 
        (u)-[:MEMBER]-(g) AND elementId(u) = $userId RETURN u`;

        const readResult = await session.executeRead((tx) =>
            tx.run(readQuery, { userId, groupId })
        );
        results = readResult.records.map(record => record["_fields"][0].properties);
        console.log(`Get friends who aren't members result: ${results}`);
        resolve(results);
      } catch (err) {
        reject(err);
      } finally {
        await session.close();
      }
    });
  }


  // Creates a channel node and links it the parent group
  // channelUuid is groupId+channelName
  async createChannel(channelName: string, groupId: string) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    const channelUuid = groupId + "#" + channelName;

    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (g:Group {id: $groupId})
        MERGE (c:Channel {groupId: $groupId, channelUuid: $channelUuid})
        MERGE (c)-[:CHANNEL]->(g)
        RETURN g, c`;

        const response = await session.executeWrite((tx) =>
          tx.run(writeQuery, { groupId, channelUuid })
        );
        const newChannel = response.records.map((record) => record.get("c"))
        console.log(`Created channel: ${newChannel}`);
        resolve(newChannel);
      } catch (error) {
        console.error(`An error occurred performing createChannel with channel ${channelUuid}: ${error}`);
        reject(error);
      } finally {
        await session.close();
      }
    })
  }

  // Creates a channel node and links it the parent group
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
  async joinChannel(userId: String, channelUuid: String) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      console.log(userId, channelUuid)
      try {
        const writeQuery = `MATCH (u:User) WHERE elementID(u) = $userId
        MATCH (c:Channel {channelUuid: $channelUuid})
        MERGE (u)-[r:CHANNELMEMBER]->(c)
        RETURN u, c`;

        const writeResult = await session.executeWrite((tx) =>
          tx.run(writeQuery, { userId, channelUuid })
        );

      } catch (err) {
        reject(err);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }

  // Removes user's link to channel when user leaves a channel
  async leaveAllChannels(userId: String) {
    const session = this.localDriver.session({ database: "neo4j" });
    let results = [];
    return new Promise(async (resolve, reject) => {
      try {
        const writeQuery = `MATCH (u:User) WHERE elementId(u) = $userId
        MATCH (c:Channel)
        MATCH (u)-[r:CHANNELMEMBER]->(c)
        DELETE r
        RETURN u, c`;

        const writeResult = await session.executeWrite((tx) =>
        tx.run(writeQuery, { userId })
        );

      } catch (err) {
        console.log("leaveAllChannels FAILED", userId);
        reject(err);
      } finally {
        await session.close();
        resolve(results);
      }
    })
  }
}


export default DB;
