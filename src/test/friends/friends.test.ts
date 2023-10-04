import test from 'ava'
import Sinon from 'sinon'
import { Request, Response } from 'express'
import { sendFriendRequest } from '../../controllers/friends.js'
import { createFriendRequest as createFriendReqMock } from '../../utils/mock-db.js'
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