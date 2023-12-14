import { AWS_BUCKET_NAME } from '@/config';
import AWS from 'aws-sdk';// Import necessary types from Express
import { NextFunction, Request, Response } from 'express';
// Define a simple home route handler
export const home = (req: Request, res: Response, next: NextFunction) => {
  try {
   // Respond with a 200 status and a JSON message 
    return res.status(200).json({
      success: true,
      message: 'Hello second cicd',
    });
  } catch (error) {
   // If an error occurs, pass it to the error-handling middleware 
    next(error);
  }
};


// export const readstream = async (req: Request, res: Response) => {

//   const file_key= req.params.key
//   const s3 = new AWS.S3();
//   const bucketName = AWS_BUCKET_NAME; // Replace with your S3 bucket name
//   const objectKey = `uploads/${file_key}`

//   const params = {
//       Bucket: bucketName,
//       Key: objectKey,
//   };
// try{
//   const fileStream = s3.getObject(params).createReadStream();
//   // const fileStream = s3.getObject(params);
//   // console.log(fileStream)
//    fileStream.pipe(res);
//   // res.send(fileStream)
// }catch(error){
//   res.json("key not found")
// }
// }



