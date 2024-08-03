import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import * as stream from "node:stream";


const uploadFileStream = async (bucket: string, key: string, contentType: string, pfpStream ) => {

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        endpoint: process.env.S3_ENDPOINT,
    });
                // Create multi-part upload request. Takes stream
    const upload= new Upload({
        client: s3,
        params: {
            Bucket: bucket,
            Key: key,
            Body: pfpStream,
            ContentType: contentType,
        },
    });
    // Wait for upload to completely finish
    await upload.done();
    // Return s3 url of uploaded file
    let pfpUrl: string = process.env.S3_ENDPOINT ? `http://${bucket}.${process.env.S3_ENDPOINT}/${key}` : `https://${bucket}.s3.amazon.com/${key}`;
    return pfpUrl;
}


const deleteFile = (bucket: string, key: string) => {
        const s3 = new S3Client({region: "us-east-1"});
}

export { uploadFileStream };