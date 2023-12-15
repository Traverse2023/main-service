import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from 'uuid';


export const sendCreateGroupJob = (groupName: string, userEmail: string) => {
    return new Promise(async (resolve, reject) => {
        console.log("====Sending create group job to SQS====")
        const client = new SQSClient({ region: "us-east-1" });
        const params = {
          MessageBody: JSON.stringify({ groupName, userEmail, task: "createGroup" }),
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageGroupId: `createGroup-${uuidv4()}`,
          MessageDeduplicationId: `createGroup-${uuidv4()}`
        };
        try {
            await client.send(new SendMessageCommand(params));
            resolve("successfully sent message");
        } catch(error) {
            console.log(error)
            reject(error);
        }
    });

}