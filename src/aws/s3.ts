import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";


const uploadFileStream = async (params: PutObjectCommandInput) => {
    const s3 = new S3Client({region: "us-east-1"});
    // Upload file buffer
    const command = new PutObjectCommand(params);

    await s3.send(command)
    return params.Key
}



export { uploadFileStream };