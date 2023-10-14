import express, { Router, Request, Response } from "express";
import { check } from "express-validator";
import { register, login } from "../controllers/auth.js";

const router = Router();

router.post("/register", register);

router.post("/login", check("firstName").not().isEmpty()
, login);

export { router };
