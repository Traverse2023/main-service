import express, {Router, Request, Response} from 'Express'

const createChat = (req: Request, res: Response) => {
    // #swagger.tags = ['Chats']
    // #swagger.description = 'Endpoint para obter um usuário.'
    res.json("createchat")
}

export { createChat }