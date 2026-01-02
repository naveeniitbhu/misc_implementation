import { createInterface } from "node:readline/promises";
import fs from 'fs';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";


const s3Client = new S3Client({
  region: 'us-east-1', credentials: {
    accessKeyId: process.env.accessKey,
    secretAccessKey: process.env.secretKey
  }
});

async function getS3Object(bucket, key) {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  return Body
}

async function getS3Text(bucket, key) {
  const Body = await getS3Object(bucket, key)
  return await Body.transformToString();
}

async function getS3Binary(bucket, key) {
  const Body = await getS3Object(bucket, key)
  return await Body.transformToByteArray()
}

async function putS3Object(bucket, key, body) {
  const Body = await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    }))
  return Body
}

export async function main() {
  const bucketName = 'mycloudfrontwebb';

  const indexHtml = await getS3Text(bucketName, 'index.html')
  console.log('loggin index.html contents: ', indexHtml);

  const imageBuffer = await getS3Binary(bucketName, 'apple.jpeg');
  fs.writeFileSync('apple.jpeg', imageBuffer);
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  console.log(`data:image/jpeg;base64: ,${base64Image.substring(0, 100)} `);

  const bucketNameTest = `test-bucket-1dfafsdfdasf`;
  const createdBucket = await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketNameTest,
    }),
  );
  console.log('Created Bucket:', createdBucket)

  const purFirst = await putS3Object(bucketNameTest, "my-first-object.txt", "Hello JavaScript SDK!")
  console.log('Put first:', purFirst)

  const putFirstRetrieved = await getS3Text(bucketNameTest, "my-first-object.txt")
  console.log('Put retrieved:', putFirstRetrieved)

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const result = await prompt.question("Empty and delete bucket? (y/n) ");
  prompt.close();

  if (result === "y") {
    const paginator = paginateListObjectsV2(
      { client: s3Client },
      { Bucket: bucketNameTest },
    );
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        for (const object of objects) {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketNameTest, Key: object.Key }),
          );
        }
      }
    }

    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketNameTest }));
  }
}

import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
