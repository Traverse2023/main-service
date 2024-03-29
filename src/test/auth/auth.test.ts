import test from "ava";
import { Request, Response } from 'express';
import { register, login } from '../../mock-controllers/auth.js';
import Sinon from 'sinon';
import DB from '../../utils/db.js';
import { findUser as findUserMock, createUser as createUserMock } from '../../utils/mock-db.js';
import { HttpError } from "../../utils/http-error.js";

test("Login route with any caught errors should throw error", async t => {
    const mockRequest = {
        body: {
            firstName: "Farhan",
            lastName: "Mashud",
            email: "mashudf37+test@gmail.com",
            password: "1235"
        }
    } 
    const mockResponse : Partial<Response> = {
        json: Sinon.stub().returns({}),
        status: Sinon.stub().returns({}) 
    }
    const dbStub = Sinon.createStubInstance(DB)
    dbStub.findUser.callsFake(async (email) => await findUserMock(email, true))
    await t.throwsAsync(async () => {
        await login(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub)
    });
})

Sinon.restore()

test("Login route with valid creds should return user's object", async t => {
    const mockRequest = {
        body: {
            firstName: "Farhan",
            lastName: "Mashud",
            email: "mashudf37+test@gmail.com",
            password: "1234"
        }
    } 
    const jsonSpy = Sinon.spy();
    const mockResponse : Partial<Response> = {
        json: jsonSpy,
        status: Sinon.stub().returns({}) 
    }
    const dbStub = Sinon.createStubInstance(DB);
    dbStub.findUser.callsFake(async (email) => await findUserMock(email, true));

    await t.notThrowsAsync(async () => {
        await login(mockRequest as Request, mockResponse as Response, Sinon.mock(), dbStub);
        // Assert that json was called with a non-empty object
        t.true(jsonSpy.calledWith(Sinon.match(obj => Object.keys(obj).length > 0)));
    });
});

Sinon.restore()








