import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";


const uploadFileStream = async (params) => {
        // init s3 client
        //TODO: region from env
        const s3 = new S3Client({region: "us-east-1"});
        // Upload file
        const command = new PutObjectCommand(params);
        await s3.send(command);
        // Return s3 url of uploaded file
        let pfpUrl: string = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
        console.log(`S3 file created: ${pfpUrl}`)
        return pfpUrl;
}

const deleteFileS3 = () => {
        const s3 = new S3Client({region: "us-east-1"});
}

export { uploadFileStream };