import test from 'ava'
import Sinon from 'sinon'
import { Request, Response } from 'express'
import { sendFriendRequest, acceptFriendRequest, removeFriendRequest } from '../../mock-controllers/friends.js'
import { createFriendRequest as createFriendReqMock } from '../../utils/mock-db.js'
import { createFriendship as createFriendshipMock } from '../../utils/mock-db.js'
import { removeFriendRequest as removeReqMock } from '../../utils/mock-db.js'
import DB from '../../utils/db.js'

test("sendFriendRequest controller with two provided emails leads to successful request creation", async t => {
    const mockRequest = {
        body: {
            user1Email: "mashudf37+test@gmail.com",
            user2Email: "iosh+test@gmail.com"
        }
    } 
    const { user1Email, user2Email } = mockRequest.body
    const jsonSpy = Sinon.spy();
    const statusSpy = Sinon.spy()

    const mockResponse : Partial<Response> = {
        json: jsonSpy,
        status: statusSpy
    }

    const dbStub = Sinon.createStubInstance(DB)
    dbStub.createFriendRequest.callsFake(async (user1Email, user2Email) => await createFriendReqMock(user1Email, user2Email))
    await sendFriendRequest(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(jsonSpy.called)
    t.true(jsonSpy.calledWith(Sinon.match(str => str === `${user1Email} sent ${user2Email} a friend req.`)));

})

Sinon.restore()

test("acceptFriendRequest controller with two provided emails should remove friend request between them and establish friendship", async t => {
    const mockRequest = {
        body: {
            user1Email: "mashudf37+test@gmail.com",
            user2Email: "iosh+test@gmail.com"
        }
    } 
    const { user1Email, user2Email } = mockRequest.body
    const jsonSpy = Sinon.spy();
    const statusSpy = Sinon.spy()

    const mockResponse : Partial<Response> = {
        json: jsonSpy,
        status: statusSpy
    }    
    const dbStub = Sinon.createStubInstance(DB)
    dbStub.createFriendship.callsFake(async (user1Email, user2Email) => await createFriendshipMock(user1Email, user2Email))
    dbStub.removeFriendRequest.callsFake(async (user1Email, user2Email) => await removeReqMock(user1Email, user2Email))
    await acceptFriendRequest(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.createFriendship.called) 
    t.true(jsonSpy.calledWith(Sinon.match(str => str === `CREATED FRIENDSHIP BTWN: ${user1Email} and ${user2Email}`)))
})

Sinon.restore()

test("removeFriendRequest controller with two provided emails should remove the friend request", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            user1Email: "mashudf37+test@gmail.com",
            user2Email: "iosh+test@gmail.com"
        },
        body: {}
    } 
    const jsonSpy = Sinon.spy();
    const statusSpy = Sinon.spy()

    const mockResponse : Partial<Response> = {
        json: jsonSpy,
        status: statusSpy
    }    
    const dbStub = Sinon.createStubInstance(DB)
    dbStub.removeFriendRequest.callsFake(async (user1Email, user2Email) => await removeReqMock(user1Email, user2Email))
    await removeFriendRequest(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.removeFriendRequest.called) 
    t.true(jsonSpy.calledWith(Sinon.match(str => str === `Relationship deleted successfully`)))
})

// test("getFriendRequests with no present relationships in db should return an empty array")

