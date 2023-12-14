import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import MainFolder from "@/models/SubFolderPanchayithe/MainFolder.model";
import SubFolder from "@/models/SubFolderPanchayithe/SubFolder.model";
import VideoMainFolder from "@/models/SubFolderVideo/MainFolder.model";
import VideoSubFolder from "@/models/SubFolderVideo/SubFolder.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { s3client } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";



export const createSubFolder = async (req, res) => {
    const { SubFolderName,MainmostFolderName } = req.body;
    const SubFolderBanner = req.file;

    if (!SubFolderName) {
      return res.status(400).json({ error: "SubFolderName required field" });
    }

    if (!MainmostFolderName) {
      return res.status(400).json({ error: "MainmostFolderName required field" });
    }

    if (!SubFolderBanner) {
      return res.status(400).json({ error: "SubFolderBanner required file" });
    }
  
    // console.log(AblumBanner)
    const file2Name = SubFolderBanner.originalname;
    console.log(file2Name)
    const BannerName = sanitizeFileName(file2Name);
    
    const Bannerkey = `${uuidv4()}-${BannerName}`
    // console.log(Bannerkey)
    // Upload the image to S3 bucket
    try {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `uploads/${Bannerkey}`,
      Body: SubFolderBanner.buffer,
      ContentType: SubFolderBanner.mimetype,
    };
  // Execute S3 upload command  
    const command1 = new PutObjectCommand(params);
    const uploaded1 = await s3client.send(command1);
  
    const existingSub = await VideoSubFolder.findOne({
        SubFolderName
        : { $regex: new RegExp(`^${SubFolderName}$`, 'i') },
    });

    const existingMain = await VideoMainFolder.findOne({
        MainmostFolderName
        : { $regex: new RegExp(`^${MainmostFolderName}$`, 'i') },
    });
    // console.log(existingMain)
  
      if (!existingMain) {
        return res.status(400).json({ message:`${MainmostFolderName} doesnt exist please create a main folder`});
      }

      if(existingSub){
        return res.status(400).json({ message:`${SubFolderName} already exits please cahnge the name`});
      }

      if(!existingSub && existingMain){
        const ArticleDetails = await VideoSubFolder.create({
            SubFolderName,
            MainmostFolderName,
            SubFolderkey: Bannerkey,
            SubFolder_banner: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
          });
       // Respond with the created article details   
          res.status(201).json(ArticleDetails);
      }
  // Create a new article with the uploaded banner details  
     
    } catch (error) {
   // Handle errors during article creation/upload   
      res.status(500).json(error);
    }
  };
  
  export const getMainFolderinsubFolderByName = async (req, res) => {
    // Extract the name parameter from the request
    try {
     const { MainFolderName } = req.params;
    //    console.log(MainFolderName)
      // Convert the name to lowercase for a case-insensitive search
      const lowercaseTitle = MainFolderName.toLowerCase();
  
  
    //   const ArticleDetails = await SubFolder.find({ MainmostFolderName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await VideoMainFolder.find({
        MainmostFolderName: { $regex: new RegExp(lowercaseTitle, "i") },
      });
  
    if (ArticleDetailsbyWord.length === 0) {
            // Check if there are no partial matches
            return res.status(400).json(`no sub filders by ${MainFolderName} found`);
    }
        res.status(200).json({
          success: "successfully",
          ArticleDetailsbyWord,
        }); 
    } catch (error) {
      // Respond with a 500 error and an error message
      res.status(500).json(error);
    }
  };



  export const getallsongs = async (req, res) => {
    try {
      const getallsongs = await VideoSubFolder.find(); // Retrieve all audio details from the database
  
      return res.status(200).json({
        success: "Fetched all songs",
        getallsongs,
      });
    } catch (error) {
      res.status(500).json({ error: "Error retrieving audio details." });
    }
  };
  


  export const getsubFolderByName = async (req, res) => {
    // Extract the name parameter from the request
    try {
     const { SubFolderName } = req.params;
    //    console.log(MainFolderName)
      // Convert the name to lowercase for a case-insensitive search
      const lowercaseTitle = SubFolderName.toLowerCase();
    //   console.log(lowercaseTitle)
  
    //   const ArticleDetails = await SubFolder.find({ MainmostFolderName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await VideoSubFolder.find({
        SubFolderName: { $regex: new RegExp(lowercaseTitle, "i") },
      });
  console.log(ArticleDetailsbyWord)
    if (ArticleDetailsbyWord.length === 0) {
            // Check if there are no partial matches
            return res.status(400).json(`no sub filders by ${SubFolderName} found`);
    }
        res.status(200).json({
          success: "successfully",
          ArticleDetailsbyWord,
        }); 
    } catch (error) {
      // Respond with a 500 error and an error message
      res.status(500).json(error);
    }
  };

