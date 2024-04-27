
class User {
    public id: string;
    public username: string;
    public password: string;
    public firstName: string;
    public lastName: string;
    public pfpUrl: string;

    constructor(username:string, password: string, firstName: string, lastName: string, pfpUrl: string = "", id?: string) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.pfpUrl = pfpUrl
    }

}

export default User;