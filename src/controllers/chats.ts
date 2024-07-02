// @ts-ignore
import express, {Router, Request, Response} from 'express'

const createChat = (req: Request, res: Response) => {
    res.json("createchat")
}

export { createChat }