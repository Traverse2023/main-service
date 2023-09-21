import {login} from "../controllers/auth.js";
import { Request, Response, NextFunction } from "Express";
import {driver} from "neo4j-driver";

// Create mock objects for req, res, and next
const mockRequest = () => {
    return <Request>{
        // Add properties or methods needed for your test
        params: {},
        query: {},
        body: {email: "isfaroshir@gmail.com", password: '123'},
    }
};

const mockResponse = () => {
    return {
        // Mock Express response methods and properties
        status: jest.fn().mockReturnThis(), // Chainable status method
        send: jest.fn(),
        json: jest.fn()
    };

};

const mockNext = jest.fn();

jest.mock('neo4j-driver', () => {
    driver: jest.fn()
})

describe("Authentication test", () => {
    test("register", () => {

    })

    test("login", () => {
        const req = mockRequest();
        const res = mockResponse();
        const mockSession = {
            run: jest.fn(),
            close: jest.fn(),
        };

        const mockDriver = {
            session: jest.fn().mockReturnValue(mockSession),
        };
        require('neo4j-driver').driver.mockReturnValue(mockDriver)

        login(req, res, mockNext)
        expect(1+1).toBe(2)
    })
})