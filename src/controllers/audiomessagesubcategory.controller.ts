import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import Audiofiles from "@/models/audiomessagesubcategory.model";
import { sanitizeFileName } from "@/utils/SanitizeFileName";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { deleteS3File, s3client } from "@/utils/s3service";
import FirstFolder from "@/models/audiomeassage.model";
import { uploadMusicFiles } from "./audio.controller";

export const uploade = async (req, res) => {
  // Extract relevant data from the request body
  const { description, folderName } = req.body;

  // Extract music and banner files from the request
  const Music = req.files.Music[0];
  const Banner = req.files.Banner[0];

  if (!folderName) {
    return res.status(400).json({ error: "folderName required field" });
  }

  if (!description) {
    return res.status(400).json({ error: "description required field" });
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
  const Bannerkey = `${uuidv4()}-${BannerName}`;

  const existingAlbum = await FirstFolder.findOne({
    folderName: { $regex: new RegExp(`^${folderName}$`, "i") },
  });

  if (!existingAlbum) {
    return res.status(404).json({ error: "Folder not found" });
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

    // Create a new audio entry in the database
    const audio = await Audiofiles.create({
      Music,
      Banner,
      description,
      MusicKey: MusicKey,
      BannerKey: Bannerkey,
      Audio_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params1.Key}`,
      Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params2.Key}`,
    });

    // Respond with success message and the created audio entry
    return res.status(201).json({
      success: "song added successfully",
      audio,
    });
  } catch (error) {
    // Handle errors by responding with the error details
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allsongs = async (req, res) => {
  try {
    const folders = await Audiofiles.find({});
    res.status(200).json(folders);
  } catch (error) {
    res.status(400).json("Songs not found");
  }
};

export const allsong = async (req, res) => {
  try {
    // Extract page and limit from query parameters (default to page 1 and limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the skip value based on page and limit
    const skip = (page - 1) * limit;

    // Retrieve songs with pagination from the database
    const songs = await Audiofiles.find({}).skip(skip).limit(limit);

    // Respond with a success status and the retrieved songs
    res.status(200).json(songs);
  } catch (error) {
    // Handle errors during folder retrieval
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteSongById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the song in the database based on the ID
    const songToDelete = await Audiofiles.findById(id);

    // Check if the song exists
    if (!songToDelete) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Delete the associated files from S3
    await deleteS3File(songToDelete.MusicKey);
    await deleteS3File(songToDelete.BannerKey);

    // Delete the song from the database
    await Audiofiles.deleteOne({ _id: songToDelete._id });

    return res.status(200).json({
      success: "Song and associated files deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateSongDetails = async (req, res) => {
  const { description } = req.body;
  const id = req.params.id;

  try {
    const folder = await Audiofiles.findOneAndUpdate(
      { _id: id },
      { $set: { description: description } },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: "Song not found" });
    }
    return res.status(200).json({
      success: "Details updated successfully",
      folder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
