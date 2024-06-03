import { CreateBucketCommand, S3Client, PutObjectCommand, GetObjectCommand, PutBucketPolicyCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import fs from 'node:fs';

const client = new S3Client({region: 'ap-south-1',
credentials: {

}});

export const uploadFileToS3Bucket = async(bucket:any,folderpath:any) => {
    const keys = fs.readdirSync(folderpath);
  
    const files = keys.map((key) => {
      const filepath = `${folderpath}/${key}`;
      console.log(filepath);
      const fileContent = fs.readFileSync(filepath,'utf-8');
      return {
        Key: filepath,
        Body: fileContent,
      }
    })
  
    for( let file of files){
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key:file.Key,
        Body:file.Body,
      })
      const response = await client.send(command);
      console.log('uploaded file'+file.Key);
    } 
  } 
  
