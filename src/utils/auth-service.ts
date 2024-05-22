import axios from "axios";
import User from "../types/user.js";

class AuthService {

    private static instance: AuthService;
    private URI: string = process.env.AUTH_SERVICE_URL + "/auth/register"


    public static getInstance() {
        if (!AuthService.instance) {
            this.instance = new AuthService();
        }
        return this.instance;
    }


    async createUser(user: User): Promise<User> {
        console.log(`Registering user: ${JSON.stringify(user)}`)
        const res = await axios.post(this.URI, user)
        console.log(`Main service  create user: ${res.data}`);
        return res.data;
    }

}

export default AuthService;