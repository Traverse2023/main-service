import axios from "axios";
import User from "../types/user.js";

class AuthService {

    private static instance: AuthService;
    private static baseURL: string = process.env.AUTH_SERVICE_URL;
    private static registerURI: string = AuthService.baseURL + "/auth/register";


    public static getInstance() {
        console.log("storage-service instance: {}", this.baseURL);
        if (!AuthService.instance) {
            this.instance = new AuthService();
        }
        return this.instance;
    }

    // TODO:
    // async createUser(user: User): Promise<User> {
    //     console.log(`Registering user ${user} at URL: ${AuthService.registerURI}`)
    //     const res = await axios.post(AuthService.registerURI, user)
    //     console.log(res.data);
    //     return new User(
    //
    //     )
    // }

}

export default AuthService;