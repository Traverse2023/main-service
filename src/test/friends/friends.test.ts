import test from 'ava'
import Sinon from 'sinon'
import { Request, Response } from 'express'
import { sendFriendRequest, acceptFriendRequest, removeFriendRequest,
getFriendRequests, getFriends, getMutualFriends } from '../../mock-controllers/friends.js'
import { createFriendRequest as createFriendReqMock, createFriendship as createFriendshipMock,
removeFriendRequest as removeReqMock, getFriendRequests as getFriendReqMock,
getFriends as getFriendsMock, getMutualFriends as getMutFriendsMock } from '../../utils/mock-db.js'
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

Sinon.restore()

test("getFriendRequests with present relationships in db should return a non-empty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            userEmail: "isfaroshir@gmail.com"
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
    dbStub.getFriendRequests.callsFake(async (userEmail) => await getFriendReqMock(userEmail, true))
    await getFriendRequests(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getFriendRequests.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => arr.length)))
})

test("getFriendRequests with no present relationships to user should return an empty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            userEmail: "isfaroshir@gmail.com"
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
    dbStub.getFriendRequests.callsFake(async (userEmail) => await getFriendReqMock(userEmail, false))
    await getFriendRequests(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getFriendRequests.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => !arr.length)))    
})

Sinon.restore()

test("getFriends controller with present friend relationship should return nonempty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            user1Email: "isfaroshir@gmail.com"
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
    dbStub.getFriends.callsFake(async (userEmail) => await getFriendsMock(userEmail, true))
    await getFriends(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getFriends.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => arr.length)))    
})

test("getFriends controller with no present friend relationship should return empty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            user1Email: "isfaroshir@gmail.com"
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
    dbStub.getFriends.callsFake(async (userEmail) => await getFriendsMock(userEmail, false))
    await getFriends(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getFriends.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => !arr.length)))    
})

test("getMutualFriends controller with present friends should return nonempty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            user1Email: "isfaroshir@gmail.com",
            user2Email: "mashudf37+test@gmail.com"
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
    dbStub.getMutualFriends.callsFake(async (user1Email, user2Email) => await getMutFriendsMock(user1Email, user2Email, true))
    await getMutualFriends(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getMutualFriends.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => arr.length)))    
})

test("getMutualFriends controller with no present friends should return empty array", async t => {
    const mockRequest : Partial<Request> = {
        params: {
            user1Email: "isfaroshir@gmail.com",
            user2Email: "mashudf37+test@gmail.com"
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
    dbStub.getMutualFriends.callsFake(async (user1Email, user2Email) => await getMutFriendsMock(user1Email, user2Email, false))
    await getMutualFriends(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.getMutualFriends.called) 
    t.true(jsonSpy.calledWith(Sinon.match(arr => !arr.length)))    
})

