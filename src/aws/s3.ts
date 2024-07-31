import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import * as stream from "node:stream";


const uploadFileStream = async (bucket: string, key: string, contentType: string, pfpStream ) => {
    // TODO: get region from envs
    const s3 = new S3Client({region: "us-east-1"});
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
    let pfpUrl: string = `https://${bucket}.s3.amazonaws.com/${key}`;
    return pfpUrl;
}


const deleteFile = (bucket: string, key: string) => {
        const s3 = new S3Client({region: "us-east-1"});
}

export { uploadFileStream };