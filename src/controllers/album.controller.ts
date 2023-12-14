import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import Album from "@/models/album.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { deleteS3File, s3client } from "@/utils/s3service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

interface UpdateFields {
  AlbumName?: string;
}

export const createAlbum = async (req, res) => {
  const { AlbumName } = req.body;
  const AblumBanner = req.file;

  if (!AlbumName) {
    return res.status(400).json({ error: "AlbumName required field" });
  }

  if (!AblumBanner) {
    return res.status(400).json({ error: "AblumBanner required file" });
  }

  // console.log(AblumBanner)
  const file2Name = AblumBanner.originalname;
  
  const BannerName = sanitizeFileName(file2Name);
  console.log(BannerName)
  const Bannerkey = `${uuidv4()}-${BannerName}`
  console.log(Bannerkey)
  // Upload the image to S3 bucket
  try {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `uploads/${Bannerkey}`,
    Body: AblumBanner.buffer,
    ContentType: AblumBanner.mimetype,
  };
// Execute S3 upload command  
  const command1 = new PutObjectCommand(params);
  const uploaded1 = await s3client.send(command1);

  const existingAlbum = await Album.findOne({
    AlbumName: { $regex: new RegExp(`^${AlbumName}$`, 'i') },
  });

    if (existingAlbum) {
      return res.status(400).json({ message:"this album name already exists please change album name"});
    }
// Create a new article with the uploaded banner details  
    const ArticleDetails = await Album.create({
      AlbumName,
      albumkey: Bannerkey,
      album_banner: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
    });
 // Respond with the created article details   
    res.status(201).json(ArticleDetails);
  } catch (error) {
 // Handle errors during article creation/upload   
    res.status(500).json({ error: "Failed to create the article" });
  }
};



  export const getallAlbums =async (req, res) => {
    try {
      const album = await Album.find(); // Only fetch the 'title' field
      if (album.length===0) {
        return res.status(404).json({ message:"no albums are found"});
      }
      res.json(album);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving album' });
    }
  };

  export const getAlbumByName = async (req, res) => {
    // Extract the name parameter from the request
    const { AlbumName } = req.params;
    console.log(AlbumName)
    // Convert the name to lowercase for a case-insensitive search
    const lowercaseTitle = AlbumName.toLowerCase();
  
    try {
      const ArticleDetails = await Album.find({ AlbumName: lowercaseTitle });
  
      const ArticleDetailsbyWord = await Album.find({
        AlbumName: { $regex: new RegExp(lowercaseTitle, "i") },
      });
  
      // Check if there are no exact matches
      if (ArticleDetails.length === 0 && ArticleDetailsbyWord.length === 0) {
        return res.status(404).send("No articles found");
      } else if (ArticleDetails.length === 0) {
    // Respond with partial matches if no exact matches are found     
        return res.status(200).json(ArticleDetailsbyWord);
      } else if (ArticleDetailsbyWord.length === 0) {
        // Check if there are no partial matches
        return res.status(200).json(ArticleDetailsbyWord);
      } else {
        // Both exact and partial matches found
        const results = {
          ArticleDetails,
          ArticleDetailsbyWord,
        };
        res.status(200).json({
          success: "successfully",
          results,
        }); 
      }
    } catch (error) {
      // Respond with a 500 error and an error message
      res.status(500).json({ error: "Error retrieving audio details" });
    }
  };

  export const UpdateAlbumTitle = async (req, res) => {
    // Destructure relevant fields from the request body
    const { AlbumName } = req.body;
  
    // Extract audio ID from the route parameters
    const AlbumId = req.params.id; // Assuming you pass the audio ID in the route URL
  
    try {
      // Create an object to store fields to be updated
      const updateFields: UpdateFields = {};
  
      // Check if each field is provided in the request body and add it to updateFields
      if (AlbumName) updateFields.AlbumName = AlbumName;
  
      // Find and update the audio details in the database
      const audio = await Album.findByIdAndUpdate(
        { _id: AlbumId },
        { $set: updateFields },
        { new: true } // Set the 'new' option to true to get the updated document
      );
  
      // Check if the audio details were found and updated
      if (!audio) {
        return res.status(404).json({ error: "Album not found" });
      }
  
      // Create a comma-separated string of updated fields for the success message
      const updatedDetails = Object.keys(updateFields).join(", "); // Create a comma-separated string of updated fields
  
      // Respond with the success message and the updated audio details
      return res.status(200).json({
        success: `Details (${updatedDetails}) updated successfully`,
        audio,
      });
    } catch (error) {
      return res.status(400).json({ error: "Details not updated." });
    }
  };
  


  export const deleteAlbumById = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch the details of the song before deletion
      const deletedAlbum = await Album.findById(id);
      // console.log(deletedAlbum);
      if (!deletedAlbum) {
        return res.status(404).json({ error: "Album not found" });
      }
      // Delete the associated files from S3
      // await deleteS3File(deletedSong.MusicKey);
      await deleteS3File(deletedAlbum.albumkey);
  
      // Delete the song from the database
      const deleteAlbum = await Album.deleteOne({ _id: id });
  // Check if the deletion was successful (deletedCount === 1)
      if (deleteAlbum.deletedCount === 1) {
         // If successful, respond with a success message
        return res.status(200).json({
          success: `Song '${deletedAlbum.AlbumName}' and associated files deleted successfully`,
        });
      } else {
        // If deletion was not successful, respond with a 500 error
        return res.status(500).json({ error: "Error deleting song" });
      }
    } catch (error) {
      // Handle any errors that occurred during the deletion process
      return res.status(500).json({ error: "Error deleting audio details" });
    }
  };
  

  export const getAlbumById = async (req,res) => {
    const { id } = req.params;
  
    try {
      // Find an album by ID
      const album = await Album.findById(id);
  
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
  
      // Do not include sensitive information like the password in the response
      const { AlbumName, album_banner } = album.toObject();
  
      res.status(200).json({
        id,
        AlbumName,
        album_banner,
      });
    } catch (error) {
      // Handle any errors that occurred during the retrieval process
      console.error(error);
      res.status(500).json({ error: "Error retrieving album details" });
    }
  };
  