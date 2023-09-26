import test from "ava";
import { Request, Response } from 'express';
import { register } from '../../controllers/auth.js';
import Sinon from 'sinon';
import DB from '../../utils/db.js';
import { findUser as findUserMock, createUser as createUserMock } from '../../utils/mock-db.js';

test("Register route with new user params should create new user", async t => {
    const mockRequest = {
        body: {
            firstName: "Farhan",
            lastName: "Mashud",
            email: "mashudf37+test@gmail.com",
            password: "1234"
        }
    } 
    const mockResponse : Partial<Response> = {
        json: Sinon.stub().returns({}),
        status: Sinon.stub().returns({}) 
    }
    const dbStub = Sinon.createStubInstance(DB)
    dbStub.findUser.callsFake(async (email) => await findUserMock(email, false))
    dbStub.createUser.callsFake(createUserMock)
    await register(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.findUser.called)
    t.true(dbStub.createUser.called)
})
Sinon.restore()

test("Register route with existing user params should not cause createUser call", async t => {
    const mockRequest = {
        body: {
            firstName: "Farhan",
            lastName: "Mashud",
            email: "mashudf37+test@gmail.com",
            password: "1234"
        }
    } 
    const mockResponse : Partial<Response> = {
        json: Sinon.stub().returns({}),
        status: Sinon.stub().returns({}) 
    }
    const dbStub = Sinon.createStubInstance(DB)
    dbStub.findUser.callsFake(async (email) => await findUserMock(email, true))
    dbStub.createUser.callsFake(createUserMock)
    await register(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    t.true(dbStub.findUser.called)
    t.false(dbStub.createUser.called)
})




