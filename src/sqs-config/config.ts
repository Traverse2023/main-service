export type SQSConfigType = {
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    }
}


console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)

export const configObject : SQSConfigType = {
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}