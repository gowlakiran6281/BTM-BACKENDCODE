
import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import Video from "@/models/SubFolderVideo/Video.model";
import MainFolder from "@/models/SubFolderPanchayithe/MainFolder.model";
import SubFolder from "@/models/SubFolderPanchayithe/SubFolder.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { s3client } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const uploadVideo = async (req, res) => {
  // Extract relevant data from the request body
  const { Videotitle, description, MainmostFolderName, SubFolderName,YoutubeUrl } = req.body;

  // Extract music and banner files from the request
  // const VideoFile = req.files.Video && req.files.Video[0];


  if (!Videotitle) {
    return res.status(400).json({ error: "Video title required field" });
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

  // if (!VideoFile) {
  //   return res.status(400).json({ error: "Video required file" });
  // }


  // Process music details
  // const VideoName = VideoFile.originalname;
  // const VideosName = sanitizeFileName(VideoName);
  // const VideoKey = `${uuidv4()}-${VideosName}`;

  // Process banner details


  const existingSub = await SubFolder.findOne({
    SubFolderName: { $regex: new RegExp(`^${SubFolderName}$`, 'i') },
  });

  const existingMain = await MainFolder.findOne({
    MainmostFolderName: { $regex: new RegExp(`^${MainmostFolderName}$`, 'i') },
  });

  if (!existingSub || !existingMain) {
    return res.status(500).json({ message: "Please provide valid folder name" });
  }

  try {
    // Set up parameters for uploading music file to S3
    // const params1 = {
    //   Bucket: AWS_BUCKET_NAME,
    //   Key: `uploads/${VideoKey}`,
    //   Body: VideoFile.buffer,
    //   ContentType: VideoFile.mimetype,
    // };

    // Set up parameters for uploading banner file to S3

    // Create S3 upload commands for music and banner files
    // const command1 = new PutObjectCommand(params1);
   
    // Upload music file to S3
    // const uploaded1 = await s3client.send(command1);

    // Upload banner file to S3


    if (existingSub && existingMain) {
      const VideosMessage = await Video.create({
        Videotitle,
        YoutubeUrl,
        description,
        MainmostFolderName,
        SubFolderName,
    
        // Video_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params1.Key}`,
        // VideoBanner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params2.Key}`,
      });

      // Respond with success message and the created audio entry
      return res.status(201).json({
        success: "Video added successfully",
        VideosMessage,
      });
    }

  } catch (error) {
    // Handle errors by responding with the error details
    return res.status(500).json(error);
  }
};

// Rest of the code remains the same...


  export const getMainFolderByName = async (req, res) => {
    // Extract the name parameter from the request
    try {
     const { MainFolderName } = req.params;
       console.log(MainFolderName)
      // Convert the name to lowercase for a case-insensitive search
      const lowercaseTitle = MainFolderName.toLowerCase();
  
  
      // const ArticleDetails = await MainFolder.find({ MainFolderName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await Video.find({
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
  
      const ArticleDetailsbyWord = await Video.find({
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


 
