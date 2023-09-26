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
                "password": "$2a$12$EGcdGeukqMyHefQFBHljI.VpC2SvYw06ay/LePF5oUqzZBAIbRK.y",
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

export const createSetup = (firstName : string, lastName : string, email : string, password : string) => {

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