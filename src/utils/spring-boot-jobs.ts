import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from 'uuid';


export const sendMessageSQS = ({text, email, groupId, channelName, firstName, lastName, time} ) => {
    return new Promise(async (resolve, reject) => {
        console.log("====Sending sendMsgSQS to SQS====")
        const client = new SQSClient({ region: "us-east-1" });
        const params = {
          MessageBody: JSON.stringify({ firstName, lastName, time, text, email ,groupId, channelName}),
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageGroupId: `sendMsg`,
          MessageDeduplicationId: `sendMsg-${uuidv4()}`
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