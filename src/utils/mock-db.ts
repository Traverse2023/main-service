// import { createSetup, findOneSetupExisting, findOneSetupNonExisting,
// createFriendReqSetup, makeFriendSetup, removeFriendReqSetup,
// getFriendReqSetup, getFriendsSetup, getMutFriendsSetup, getFriendStatusSetup } from "./mock-consts.js";
//
// export async function createUser({ firstName, lastName, email, password }) {
//   try {
//     const { createUserQuery, session } = createSetup(firstName, lastName, email, password)
//     await session.run(createUserQuery, { firstName, lastName, email, password })
//     await session.close()
//   } catch (error) {
//     console.error(`Something went wrong: ${error}`);
//     throw error
//   } finally {
//     // await session.close()
//   }
// }
//
// export async function findUser(email: string, existing: boolean) {
//   return new Promise(async (res, rej) => {
//     const { session, readQuery } = existing ? findOneSetupExisting(email) : findOneSetupNonExisting(email)
//     try {
//       const readResult = await session.readTransaction((tx) =>
//         tx.run(readQuery, { email })
//       );
//       if (!readResult.records.length) {
//         res({})
//       }
//       readResult.records.forEach((record) => res(record.get("user").properties));
//     } catch (error) {
//       console.error(`Something went wrong: ${error}`);
//       rej(error);
//     } finally {
//       await session.close();
//     }
//   })
// }
//
// export async function createFriendRequest(user1Email : string, user2Email : string) {
//   const { writeQuery, session } = createFriendReqSetup(user1Email, user2Email)
//   return new Promise(async (resolve, reject) => {
//     try {
//       await session.run(writeQuery, { user1Email, user2Email })
//       resolve(`${user1Email} sent ${user2Email} a friend req.`);
//     } catch (err) {
//       reject(err);
//     } finally {
//       session.close();
//     }
//   });
// }
//
// export async function createFriendship(user1Email : string, user2Email : string) {
//   const { writeQuery, session } = makeFriendSetup(user1Email, user2Email)
//   try {
//     const promiseArr = await Promise.all([removeFriendRequest(user1Email, user2Email), new Promise(async (resolve, reject) => {
//       try {
//         await session.run(writeQuery, { user1Email, user2Email })
//         resolve(`CREATED FRIENDSHIP BTWN: ${user1Email} and ${user2Email}`);
//       } catch (err) {
//         reject(`Something went wrong: ${err}`);
//       } finally {
//         await session.close();
//       }
//     })])
//     return promiseArr[1]
//
// } catch(error) { console.log(error) }
// }
//
// export async function removeFriendRequest(user1Email : string, user2Email : string) {
//   const { removeQuery, session } = removeFriendReqSetup(user1Email, user2Email)
//   return new Promise(async (resolve) => {
//   const parameters = {
//     user1Email,
//     user2Email,
//   };
//
//
//   try {
//     await session.run(removeQuery, parameters)
//     resolve("Relationship deleted successfully")
//
//   } catch (error) {
//     console.error(error);
//   }
//   session.close()
//   })
// }
//
// export async function getFriendRequests(userEmail : string, exists : boolean) {
//   const { readQuery, session} = getFriendReqSetup(userEmail, exists)
//   return new Promise(async (resolve, reject) => {
//     try {
//       const readResult = await session.run(readQuery, { userEmail })
//       const results = readResult.records.map(record => record["_fields"][0].properties)
//       resolve(results);
//     } catch (err) {
//       reject(err);
//     } finally {
//       await session.close();
//     }
//   });
// }
//
// export async function getFriends(user1Email : string, exists : boolean) {
//   const {readQuery, session} = getFriendsSetup(user1Email, exists);
//   return new Promise(async (resolve, reject) => {
//     try {
//       const readResult = await session.run(readQuery, {user1Email})
//       await session.close();
//       resolve(readResult.records.map(record => record["_fields"][0].properties))
//
//     } catch (err) {
//       await session.close();
//       reject(err);
//     }
//   });
// }
//
// export async function getMutualFriends(user1Email : string, user2Email : string, exists : boolean) {
//   const { readQuery, session } = getMutFriendsSetup(user1Email, user2Email, exists)
//   return new Promise(async (resolve, reject) => {
//     try {
//       const readResult = await session.run(readQuery, { user1Email, user2Email })
//       await session.close()
//       resolve(readResult.records.map(record => record["_fields"][0].properties))
//     } catch (err) {
//       await session.close()
//       reject(err);
//     }
//   });
// }
//
// export async function getFriendshipStatus(user1Email: string, user2Email: string, exists: boolean) {
//   const { readQuery, session } = getFriendStatusSetup(user1Email, user2Email, exists)
//   let results = {};
//   return new Promise(async (resolve, reject) => {
//     try {
//       const readResult = await session.run(readQuery, { user1Email, user2Email })
//       readResult.records.forEach((record) => {
//         results = {
//           friendshipStatus: record["_fields"][0],
//           initiatedUser: record["_fields"][1].properties.email,
//         };
//       });
//     } catch (err) {
//       reject(err);
//     } finally {
//       await session.close();
//
//       resolve(results);
//     }
//   });
// }
