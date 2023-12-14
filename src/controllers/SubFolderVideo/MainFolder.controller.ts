import { AWS_BUCKET_NAME, AWS_REGION, BASE_URL } from "@/config";
import MainFolder from "@/models/SubFolderPanchayithe/MainFolder.model";
import VideoMainFolder from "@/models/SubFolderVideo/MainFolder.model";

import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { s3client } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";




export const createMainFolder = async (req, res) => {
    const { MainmostFolderName } = req.body;
    const MainFolderBanner = req.file;

    if (!MainmostFolderName) {
      return res.status(400).json({ error: "MainmostFolderName required field" });
    }

    if (!MainFolderBanner) {
      return res.status(400).json({ error: "MainFolderBanner required file" });
    }
  
    // console.log(AblumBanner)
    const file2Name = MainFolderBanner.originalname;
    console.log(file2Name)
    const BannerName = sanitizeFileName(file2Name);
   
    const Bannerkey = `${uuidv4()}-${BannerName}`
    // console.log(Bannerkey)
    // Upload the image to S3 bucket
    try {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `uploads/${Bannerkey}`,
      Body: MainFolderBanner.buffer,
      ContentType: MainFolderBanner.mimetype,
    };
  // Execute S3 upload command  
    const command1 = new PutObjectCommand(params);
    const uploaded1 = await s3client.send(command1);
  
    const existingAlbum = await VideoMainFolder.findOne({
      MainmostFolderName
        : { $regex: new RegExp(`^${MainmostFolderName}$`, 'i') },
    });
  
      if (existingAlbum) {
        return res.status(400).json({ message:"this folder name already exists please change folder name"});
      }
  // Create a new article with the uploaded banner details  
      const ArticleDetails = await VideoMainFolder.create({
        MainmostFolderName,
        SubfolderinMainfolder:`${BASE_URL}/v1/subfolder/${MainmostFolderName}`,
        MainmostFolderNamekey: Bannerkey,
        MainmostFolderName_banner: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
      });
   // Respond with the created article details   
      res.status(201).json(ArticleDetails);
    } catch (error) {
   // Handle errors during article creation/upload   
      res.status(500).json(error);
    }
  };


  export const getMainFolderByName = async (req, res) => {
    // Extract the name parameter from the request
    try {
     const { MainFolderName } = req.params;
       console.log(MainFolderName)
      // Convert the name to lowercase for a case-insensitive search
      const lowercaseTitle = MainFolderName.toLowerCase();
  
  
      // const ArticleDetails = await MainFolder.find({ MainFolderName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await VideoMainFolder.find({
        MainFolderName: { $regex: new RegExp(lowercaseTitle, "i") },
      });
      if (ArticleDetailsbyWord.length === 0) {
            // Check if there are no partial matches
            return res.status(200).json("not found");
          } else {
            // Both exact and partial matches found
            const results = {
              ArticleDetailsbyWord,
            };
            res.status(200).json({
              success: "successfully",
              results,
            }); 
          }
       
        }catch (error) {
      // Respond with a 500 error and an error message
      res.status(500).json(error);
    }
  };

  export const allmainvieofolders = async (req, res) => {
    try {
      const getallsongs = await VideoMainFolder.find(); // Retrieve all audio details from the database
  
      return res.status(200).json({
        success: "Fetched all songs",
        getallsongs,
      });
    } catch (error) {
      res.status(500).json({ error: "Error retrieving audio details." });
    }
  };
  