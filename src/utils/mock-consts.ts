import { QuerySpec, mockSessionFromQuerySet } from "neo-forgery";
import { Session } from "neo4j-driver";

export const findOneSetupExisting = (email: string) => {
  const readQuery = `MATCH (u:User)
    WHERE u.email = $email
    RETURN u AS user`;

  const findUserParams = {
    email,
  }

  const findUserOutput = {
    records: [
      {
        "keys": [
          "user"
        ],
        "length": 1,
        "_fields": [
          {
            "identity": {
              "low": 0,
              "high": 0
            },
            "labels": [
              "User"
            ],
            "properties": {
              "firstName": "Farhan",
              "lastName": "Mashud",
              "password": "$2a$12$1T9WF48g3RRtgdHrGAeCGOh2OWfx5gEK8kKP/gIsK8/QyykgOe0j6",
              "email": "mashudf37+test@gmail.com"
            },
            "elementId": "4:e1e5a7ba-afdd-44ef-9983-d6ab64875723:0"
          }
        ],
        "_fieldLookup": {
          "user": 0
        }
      }
    ]
  }

  const querySet: QuerySpec[] = [
    {
      name: 'createUser',
      query: readQuery,
      params: findUserParams,
      output: findUserOutput,
    }
  ]
  const session = mockSessionFromQuerySet(querySet)
  return {
    readQuery,
    findUserParams,
    findUserOutput,
    querySet,
    session
  }
}

export const findOneSetupNonExisting = (email: string) => {
  const readQuery = `MATCH (u:User)
  WHERE u.email = $email
  RETURN u AS user`;

  const findUserParams = {
    email,
  }

  const findUserOutput = {
    records: []
  }

  const querySet: QuerySpec[] = [
    {
      name: 'createUser',
      query: readQuery,
      params: findUserParams,
      output: findUserOutput,
    }
  ]
  const session = mockSessionFromQuerySet(querySet)
  return {
    readQuery,
    findUserParams,
    findUserOutput,
    querySet,
    session
  }
}

export const createSetup = (firstName: string, lastName: string, email: string, password: string) => {

  const createUserQuery = `CREATE (u:User { firstName: $firstName,
      lastName: $lastName,
      email: $email,
      password: $password})`


  const createUserParams = {
    firstName,
    lastName,
    email,
    password
  }

  const createUserOutput = {
    records: []
  }

  const querySet: QuerySpec[] = [
    {
      name: 'createUser',
      query: createUserQuery,
      params: createUserParams,
      output: createUserOutput,
    }
  ]
  const session: Session = mockSessionFromQuerySet(querySet)
  return {
    createUserQuery,
    createUserParams,
    createUserOutput,
    querySet,
    session
  }
}

export const createFriendReqSetup = (user1Email: string, user2Email: string) => {
  const writeQuery = `MATCH (u1:User {email: $user1Email}),
    (u2:User {email: $user2Email})
  CREATE (u1)-[r:FRIEND_REQUEST]->(u2)
  RETURN u1.email, type(r), u2.email`;

  const createFriendReqParams = {
    user1Email,
    user2Email
  }

  const createFriendReqOutput = {
    records: [
      {
        "keys": [
          "u1.email",
          "type(r)",
          "u2.email"
        ],
        "length": 3,
        "_fields": [
          user1Email,
          "FRIEND_REQUEST",
          user2Email
        ],
        "_fieldLookup": {
          "u1.email": 0,
          "type(r)": 1,
          "u2.email": 2
        }
      }
    ]
  }

  const querySet: QuerySpec[] = [
    {
      name: 'createFriendReq',
      query: writeQuery,
      params: createFriendReqParams,
      output: createFriendReqOutput,
    }
  ]

  const session: Session = mockSessionFromQuerySet(querySet)

  return {
    writeQuery,
    createFriendReqParams,
    createFriendReqOutput,
    querySet,
    session
  }

}

export const makeFriendSetup = (user1Email: string, user2Email: string) => {
  const writeQuery = `MATCH (u1:User {email: $user1Email}),
  (u2:User {email: $user2Email})
CREATE (u1)-[r:FRIENDS]->(u2)
RETURN u1.email, type(r), u2.email`

  const createFriendParams = {
    user1Email,
    user2Email
  }

  const createFriendOutput = {
    records: [
      {
        "keys": [
          "u1.email",
          "type(r)",
          "u2.email"
        ],
        "length": 3,
        "_fields": [
          user1Email,
          "FRIENDS",
          user2Email
        ],
        "_fieldLookup": {
          "u1.email": 0,
          "type(r)": 1,
          "u2.email": 2
        }
      }
    ]
  }

  const querySet: QuerySpec[] = [
    {
      name: 'createFriend',
      query: writeQuery,
      params: createFriendParams,
      output: createFriendOutput,
    }
  ]

  const session: Session = mockSessionFromQuerySet(querySet)

  return {
    writeQuery,
    createFriendParams,
    createFriendOutput,
    querySet,
    session
  }

}

export const removeFriendReqSetup = (user1Email: string, user2Email: string) => {
  const removeQuery = `MATCH (:User {email: $user1Email})-[r]-(:User {email: $user2Email}) DELETE r`

  const removeReqParams = {
    user1Email,
    user2Email
  }

  const removeReqOutput = {
    records: []
  }

  const querySet: QuerySpec[] = [
    {
      name: 'removeReq',
      query: removeQuery,
      params: removeReqParams,
      output: removeReqOutput,
    }
  ]

  const session: Session = mockSessionFromQuerySet(querySet)

  return {
    removeQuery,
    removeReqParams,
    removeReqOutput,
    querySet,
    session
  }

}

