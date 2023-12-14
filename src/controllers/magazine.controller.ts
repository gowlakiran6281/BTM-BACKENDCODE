import { Request, Response } from "express";
import { deleteS3File, listUploads, s3client } from "@/utils/s3service";
import Magazine from '@/models/magazine.model'

import { AWS_BUCKET_NAME, AWS_REGION, BASE_URL } from "@/config";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

//const app = express(); // Create an Express app
// app.use(multer().array("myFile")); // Use multer middleware to handle file uploads

export const uploadMagazine = async (req, res) => {
  // Extract relevant data from the request body
  const { MagazineTitle, description } = req.body;

  if (!MagazineTitle) {
    return res.status(400).json({ error: "MagazineTitle required field" });
  }

  if (!description) {
    return res.status(400).json({ error: "description required field" });
  }

  // Extract music and banner files from the request
  const pdf = req.files.pdf[0];
  const Bannerpdf = req.files.Bannerpdf[0];

  if (!pdf) {
    return res.status(400).json({ error: "pdf required file" });
  }

  if (!Bannerpdf) {
    return res.status(400).json({ error: "Bannerpdf required file" });
  }

  // Process music details
  const pdfName = req.files.pdf[0].originalname;
  const MusicName = sanitizeFileName(pdfName);
  const pdfKey = `${uuidv4()}-${MusicName}`;

  // Process banner details
  const file2Name = req.files.Bannerpdf[0].originalname;
  const BannerName = sanitizeFileName(file2Name);
  const Bannerpdfkey = `${uuidv4()}-${BannerName}`

  try {
    // Set up parameters for uploading music file to S3
    const params1 = {
      Bucket: AWS_BUCKET_NAME,
      Key: `uploads/${pdfKey}`,
      Body: pdf.buffer,
      ContentType: pdf.mimetype,
    };

    // Set up parameters for uploading banner file to S3
    const params2 = {
      Bucket: AWS_BUCKET_NAME,
      Key: `uploads/${Bannerpdfkey }`,
      Body: Bannerpdf.buffer,
      ContentType: Bannerpdf.mimetype,
    };

    // Create S3 upload commands for music and banner files
    const command1 = new PutObjectCommand(params1);
    const command2 = new PutObjectCommand(params2);

    // Upload music file to S3
    const uploaded1 = await s3client.send(command1);

    // Upload banner file to S3
    const uploaded2 = await s3client.send(command2);


    // Create a new audio entry in the database
    const audio = await Magazine.create({
      MagazineTitle,
      description,
      pdfKey: pdfKey,
      BannerKey: Bannerpdfkey,
      pdf: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params1.Key}`,
      Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params2.Key}`,
    });

    // Respond with success message and the created audio entry
    return res.status(201).json({
      success: "Magazine added successfully",
      audio,
    });
  } catch (error) {
    // Handle errors by responding with the error details
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




//  Retrieve all magazines

export const allmagazine =async (req , res) => {
  try {
      const banners= await Magazine.find({});
// Respond with the retrieved magazine entries
      res.status(200).json(banners)
  }catch(error){// // Handle errors during magazine retrieval
      res.status(400).json("not found")
  }
}


export const updateMagazineDetails = async (req, res) => {
  const { MagazineTitle, description } = req.body;
  const Id = req.params.id; // Assuming you pass the audio ID in the route URL
  // const currentDate = new Date();
  // const curr_date= currentDate.toLocaleTimeString();
 
  try {
    // Find and update the magazine details in the databas
    const magazine = await Magazine.findByIdAndUpdate({_id: Id},
      {$set:{MagazineTitle,description}}, 
     { new:true})
   // If the magazine is not found, respond with a 404 error
    if (!magazine) {
      return res.status(404).json({ error: "Audio not found" });
    }
    // Save the updated magazine details
    await magazine.save();
    // Respond with the updated magazine details
    return res.status(200).json(magazine);
  } catch (error) {
    //Handle errors during magazine update
    return res.status(400).json({ error: "Details not updated." });
  }
};




export const getMagazineByName = async (req, res) => {
  // Extract the name parameter from the request
  const { name } = req.params;

  // Convert the name to lowercase for a case-insensitive search
  const lowercaseTitle = name.toLowerCase();

  try {
    // Find audio details with an exact match to the lowercase title
    const MagazineDetails = await Magazine.find({ MagazineTitle: lowercaseTitle });

    // Find audio details with a case-insensitive partial match to the lowercase title
    const MagazineDetailssbyWord = await Magazine.find({
      MagazineTitle: { $regex: new RegExp(lowercaseTitle, "i") },
    });

    // Check if there are no exact matches
    if (MagazineDetails.length === 0 && MagazineDetailssbyWord.length === 0) {
      return res.status(404).send("No articles found");
    } else if (MagazineDetails.length === 0) {
      return res.status(200).json(MagazineDetailssbyWord);
    } else if (MagazineDetailssbyWord.length === 0) {
      // Check if there are no partial matches
      return res.status(200).json(MagazineDetailssbyWord);
    } else {
      // Both exact and partial matches found
      const results = {
        MagazineDetails,
        MagazineDetailssbyWord,
      };
      res.status(200).json(results);
    }
  } catch (error) {
    // Respond with a 500 error and an error message
    res.status(500).json({ error: "Error retrieving audio details" });
  }
};



export const deleteMagazineByID = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the details of the song before deletion
    const deletedMagazine = await Magazine.findById(id);
    // console.log(deletedMagazine);
    if (!deletedMagazine) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Delete the associated files from S3
    await deleteS3File(deletedMagazine.pdfKey);
    await deleteS3File(deletedMagazine.BannerKey);

    // Delete the song from the database
    const deletemagazine = await Magazine.deleteOne({ _id: id });

    if (deletemagazine.deletedCount === 1) {
      return res.status(200).json({
        success: `Song '${deletedMagazine.MagazineTitle}' and associated files deleted successfully`,
      });
    } else {
      return res.status(500).json({ error: "Error deleting song" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error deleting audio details" });
  }
};

export const getMagazineById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find a magazine by ID
    const magazine = await Magazine.findById(id);

    if (!magazine) {
      return res.status(404).json({ error: "Magazine not found" });
    }

    res.status(200).json(magazine);
  } catch (error) {
    // Handle any errors that occurred during the retrieval process
    console.error(error);
    res.status(500).json({ error: "Error retrieving magazine details" });
  }
};

