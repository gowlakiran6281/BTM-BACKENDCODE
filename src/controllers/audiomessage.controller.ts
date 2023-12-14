import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import FirstFolder from "@/models/audiomeassage.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { deleteS3File } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";


export const uploade = async (req,res) =>{
  const {folderName, description } = req.body;
  const Banner = req.files.Banner[0];
  console.log("banner:",Banner);
  console.log(folderName);

  if (!folderName) {
    return res.status(400).json({ error: "folderName required field" });
  }

  if (!description) {
    return res.status(400).json({ error: "description required field" });
  }

  if (!Banner) {
    return res.status(400).json({ error: "Banner required file" });
  }

  const existingFolder = await FirstFolder.findOne({
    folderName: { $regex: new RegExp(`^${folderName}$`, 'i') },
  });

    if (existingFolder) {
      return res.status(400).json({ message:"this Folder name already exists please change Folder name"});
    }

  const file2Name = Banner.originalname;
    console.log(file2Name)
  const BannerName = sanitizeFileName(file2Name);
  
  const Bannerkey = `${uuidv4()}-${BannerName}`
  console.log(Bannerkey)

  try{
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `uploads/${Bannerkey}`,
      Body: Banner.buffer,
      ContentType: Banner.mimetype,
      };
      console.log(params.Key)

      // Create a new command to upload the banner file to S3
    const command = new PutObjectCommand(params);

    const banner = await FirstFolder.create({
      folderName : folderName ,
      description : description,
      BannerKey:Bannerkey,
      Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
    });
// Respond with a success status and the created banner details
    return res.status(200).json({
    message:"banner uploaded sucessfully",
    banner
  });

  }catch(error){
    res.status(500).json("error")
  }
}


export const allfolder = async (req, res) => {
  try {
    // Retrieve all banner entries from the database
    const folders = await FirstFolder.find({});
// Respond with a success status and the retrieved banners
    res.status(200).json(folders);
  } catch (error) {
    // Handle errors during banner retrieval
    res.status(400).json("Folder not found");
  }
};


export const allfolders = async (req, res) => {
  try {
    // Extract page and limit from query parameters (default to page 1 and limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the skip value based on page and limit
    const skip = (page - 1) * limit;

    // Retrieve folders with pagination from the database
    const folders = await FirstFolder.find({}).skip(skip).limit(limit);

    // Respond with a success status and the retrieved folders
    res.status(200).json(folders);
  } catch (error) {
    // Handle errors during folder retrieval
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getFolderByName = async (req,res) =>{
   // Extract the name parameter from the request
   const { name } = req.params;

   // Convert the name to lowercase for a case-insensitive search
   const lowercaseTitle = name.toLowerCase();
 
   try {
     // Find audio details with an exact match to the lowercase title
     const folderDetails = await FirstFolder.find({ folderName: lowercaseTitle });
 
     // Find audio details with a case-insensitive partial match to the lowercase title
     const folderDetailsbyWord = await FirstFolder.find({
      folderName: { $regex: new RegExp(lowercaseTitle, "i") },
     });
 
     // Check if there are no exact matches
     if (folderDetails.length === 0) {
       return res.status(200).json(folderDetailsbyWord);
     } else if (folderDetailsbyWord.length === 0) {
       // Check if there are no partial matches
       return res.status(200).json(folderDetailsbyWord);
     } else {
       // Both exact and partial matches found
       const results = {
        folderDetails,
        folderDetailsbyWord,
       };
       res.status(200).json(results);
     }
   } catch (error) {
     // Respond with a 500 error and an error message
     res.status(500).json({ error: "Error retrieving Folder details" });
   }
}


export const updateFolderDetails = async (req, res) => {
  // Destructure relevant fields from the request body
  const { folderName, description } = req.body;

  // Extract current folder name from the route parameters
  const currentFolderName = req.params.folderName;

  try {
    // Find and update the folder details in the database
    const folder = await FirstFolder.findOneAndUpdate(
      { folderName: currentFolderName },
      { $set: { folderName: folderName, description: description } },
      { new: true } // Set the 'new' option to true to get the updated document
    );

    // Check if the folder details were found and updated
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Respond with the success message and the updated folder details
    return res.status(200).json({
      success: "Details updated successfully",
      folder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const deletefolderNameByName = async (req, res) => {
  const { folderName } = req.params;

  try {
    // Fetch the details of the folder before deletion
    const deletedFolder = await FirstFolder.findOne({ folderName: folderName });

    if (!deletedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    console.log(deletedFolder);

    // Delete the associated files from S3
    await deleteS3File(deletedFolder.BannerKey);

    // Delete the folder from the database
    const deletedFolders = await FirstFolder.deleteOne({ folderName: folderName });

    if (deletedFolders.deletedCount === 1) {
      return res.status(200).json({
        success: `Folder and associated files deleted successfully`,
      });
    } else {
      return res.status(500).json({ error: "Error deleting Folder" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting Folder details" });
  }
};


