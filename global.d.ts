
export {}
 
declare global {
    interface HttpError {
        code: number
    }
    interface User {
        id: string
        name: string
        friends?: User[]
    }
    interface Chat {
        id: string
        name: string
        members?: User[]
    }
}