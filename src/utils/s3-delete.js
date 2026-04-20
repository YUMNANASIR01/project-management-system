import dotenv from "dotenv"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import s3_Client from "../config/s3.js"


dotenv.config()

export const deleteFromS3 = async (fileUrl) => {

try {
    const url = new URL(fileUrl)
    //         forward clash ko decoded kar raha hata raha hai
    const key = decodeURIComponent(url.pathname.slice(1)) //removing leading "/"

    await s3_Client.send( new DeleteObjectCommand({
        Bucket : process.env.AWS_S3_BUCKET_NAME,
        // yah file ky name sy delete kar rahi hai jo key mai hai
        key : key
    }) )

    console.log(`✅  Deleted from s3 : ${key}`);
    
}
catch (error) {
    console.log(` ❌  failed to delete from s3 : ${error.message} `);
    
}
}
