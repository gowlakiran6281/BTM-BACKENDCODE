import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import AudioMesssage from "@/models/SubFolderPanchayithe/AudioMessage.model";
import MainFolder from "@/models/SubFolderPanchayithe/MainFolder.model";
import SubFolder from "@/models/SubFolderPanchayithe/SubFolder.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { s3client } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";


export const uploadAudioMessage = async (req, res) => {
    // Extract relevant data from the request body
    const { AudioMesssagetitle, artist, description, MainmostFolderName,SubFolderName} = req.body;
  
    // Extract music and banner files from the request
    const Music = req.files.Music[0];
    const Banner = req.files.Banner[0];

    if (!AudioMesssagetitle) {
      return res.status(400).json({ error: "AudioMesssagetitle required field" });
    }

    if (!artist) {
      return res.status(400).json({ error: "artist required field" });
    }

    if (!description) {
      return res.status(400).json({ error: "description required field" });
    }

    if (!MainmostFolderName) {
      return res.status(400).json({ error: "MainmostFolderName required field" });
    }

    if (!SubFolderName) {
      return res.status(400).json({ error: "SubFolderName required field" });
    }

    if (!Music) {
      return res.status(400).json({ error: "Music required file" });
    }

    if (!Banner) {
      return res.status(400).json({ error: "Banner required file" });
    }
  
    // Process music details
    const AudioName = req.files.Music[0].originalname;
    const MusicName = sanitizeFileName(AudioName);
    const MusicKey = `${uuidv4()}-${MusicName}`;
  
    // Process banner details
    const file2Name = req.files.Banner[0].originalname;
    const BannerName = sanitizeFileName(file2Name);
    const Bannerkey = `${uuidv4()}-${BannerName}`
  
    const existingSub = await SubFolder.findOne({
        SubFolderName
        : { $regex: new RegExp(`^${SubFolderName}$`, 'i') },
    });

    const existingMain = await MainFolder.findOne({
        MainmostFolderName
        : { $regex: new RegExp(`^${MainmostFolderName}$`, 'i') },
    });
  if(!existingSub || !existingMain){
    return res.status(500).json({ message:"Please provide valid folder name"})
  }
    try {
      // Set up parameters for uploading music file to S3
      const params1 = {
        Bucket: AWS_BUCKET_NAME,
        Key: `uploads/${MusicKey}`,
        Body: Music.buffer,
        ContentType: Music.mimetype,
      };
  
      // Set up parameters for uploading banner file to S3
      const params2 = {
        Bucket: AWS_BUCKET_NAME,
        Key: `uploads/${Bannerkey}`,
        Body: Banner.buffer,
        ContentType: Banner.mimetype,
      };
  
      // Create S3 upload commands for music and banner files
      const command1 = new PutObjectCommand(params1);
      const command2 = new PutObjectCommand(params2);
  
      // Upload music file to S3
      const uploaded1 = await s3client.send(command1);
  
      // Upload banner file to S3
      const uploaded2 = await s3client.send(command2);
  
      // Format lyrics (replace newline characters with '<br>')
  
      if(existingSub && existingMain){
        const audiomesssage = await AudioMesssage.create({
            AudioMesssagetitle,
            artist,
            description,
            MainmostFolderName,
            SubFolderName,
            AudioMesssageKey: MusicKey,
            AudioMesssageBannerKey: Bannerkey,
            AudioMesssage_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params1.Key}`,
            AudioMesssageBanner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params2.Key}`,
          });
      
          // Respond with success message and the created audio entry
          return res.status(201).json({
            success: "song added successfully",
            audiomesssage,
          });
      }
      
    } catch (error) {
      // Handle errors by responding with the error details
      return res.status(500).json(error);
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
  
      const ArticleDetailsbyWord = await AudioMesssage.find({
        MainmostFolderName: { $regex: new RegExp(lowercaseTitle, "i") },
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

  export const getsubFolderByName = async (req, res) => {
    // Extract the name parameter from the request
    try {
     const { SubFolderName } = req.params;
    //    console.log(MainFolderName)
      // Convert the name to lowercase for a case-insensitive search
      const lowercaseTitle = SubFolderName.toLowerCase();
    //   console.log(lowercaseTitle)
  
    //   const ArticleDetails = await SubFolder.find({ MainmostFolderName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await AudioMesssage.find({
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



  export const getAudioMessageById = async (req,res) => {
    const { id } = req.params;
  
    try {
      // Find an audio message by ID
      const audioMessage = await AudioMesssage.findById(id);
  
      if (!audioMessage) {
        return res.status(404).json({ error: "Audio message not found" });
      }
  
      // Do not include sensitive information like the music key or banner key in the response
      const {
        AudioMesssagetitle,
        artist,
        description,
        MainmostFolderName,
        SubFolderName,
        AudioMesssage_location,
        AudioMesssageBanner_location,
      } = audioMessage.toObject();
  
      res.status(200).json({
        id,
        AudioMesssagetitle,
        artist,
        description,
        MainmostFolderName,
        SubFolderName,
        AudioMesssage_location,
        AudioMesssageBanner_location,
      });
    } catch (error) {
      // Handle any errors that occurred during the retrieval process
      console.error(error);
      res.status(500).json({ error: "Error retrieving audio message details" });
    }
  };