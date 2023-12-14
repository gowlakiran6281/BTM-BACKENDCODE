import SecondFolder from "@/models/audiomessagecategory.model";
import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";
import { sanitizeFileName } from "@/utils/SanitizeFileName";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { s3client } from "@/utils/s3service";
import FirstFolder from "@/models/audiomeassage.model";



// export const uploads = async (req, res) => {
//   const { folderName, description } = req.body;
//   const Banner = req.files.Banner[0];
//   console.log(Banner);
//   console.log(folderName);

//   const existingFolder = await SecondFolder.findOne({
//     folderName: { $regex: new RegExp(`^${folderName}$`, 'i') },
//   });

//   if (existingFolder) {
//     return res.status(400).json({ message: "This folder name already exists. Please change the folder name." });
//   }

//   const file2Name = Banner.originalname;
//   console.log(file2Name);
//   const BannerName = sanitizeFileName(file2Name);

//   const Bannerkey = `${uuidv4()}-${BannerName}`;
//   console.log(Bannerkey);

//   try {
//     const params = {
//       Bucket: AWS_BUCKET_NAME,
//       Key: `uploads/${Bannerkey}`,
//       Body: Banner.buffer,
//       ContentType: Banner.mimetype,
//     };

//     // Create a new command to upload the banner file to S3
//     const command = new PutObjectCommand(params);

//     // Upload banner file to S3
//     await s3client.send(command);

//     const banner = await SecondFolder.create({
//         folderName: folderName,
//         description: description,
//       bannerKey: params.Key,
//       Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
//     });

//     // Respond with a success status and the created banner details
//     return res.status(200).json({
//       message: "Banner uploaded successfully",
//       banner,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

///////////////////////////////////////////////////////////////////////////////////
//main 


export const uploads = async (req, res) => {
    const { subfolderName, description, folderName } = req.body;
    const Banner = req.files.Banner[0];

    if (!folderName) {
      return res.status(400).json({ error: "folderName required field" });
    }

    if (!subfolderName) {
      return res.status(400).json({ error: "subfolderName required field" });
    }

    if (!description) {
      return res.status(400).json({ error: "description required field" });
    }

    if (!Banner) {
      return res.status(400).json({ error: "Banner required file" });
    }
  
    const file2Name = Banner.originalname;

    const BannerName = sanitizeFileName(file2Name);
    
    const Bannerkey = `${uuidv4()}-${BannerName}`;
  
    // Check if the corresponding FirstFolder exists
    const existingFirstFolder = await FirstFolder.findOne({
      folderName: { $regex: new RegExp(`^${folderName}$`, 'i') },
        // _id: id,
    });
     
    if (!existingFirstFolder) {
      return res.status(400).json({ message: "FirstFolder does not exist. Please create the FirstFolder first." });
    }
  console.log(existingFirstFolder)
  
    // Check if the SecondFolder already exists for the given FirstFolder
    const existingsecondFolder = await SecondFolder.findOne({
        subfolderName: { $regex: new RegExp(`^${subfolderName}$`, 'i') },
    });
  
    if (existingsecondFolder) {
      return res.status(400).json({ message: "This subfolder name already exists. Please change the subfolder name." });
    }
  
    try {
      const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: `uploads/${Bannerkey}`,
        Body: Banner.buffer,
        ContentType: Banner.mimetype,
      };
  
      // Create a new command to upload the banner file to S3
      const command = new PutObjectCommand(params);
  
      // Upload banner file to S3
      await s3client.send(command);
  
      const banner = await SecondFolder.create({
        subfolderName,
        description,
        BannerKey: Bannerkey,
        Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
      });
  
      // Respond with a success status and the created banner details
      return res.status(200).json({
        message: "Banner uploaded successfully",
        banner,
      });

    } 
    catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

// export const uploads = async (req, res) => {
//     try {
//       const { subfolderNames, description, folderName } = req.body;
//       const Banner = req.files.Banner[0];
//       console.log(Banner);
//       console.log(subfolderNames);
  
//       // Check if subfolderNames is not defined or not an array
//       if (!Array.isArray(subfolderNames)) {
//         return res.status(400).json({ message: "subfolderNames should be an array." });
//       }
  
//       // Check if the corresponding FirstFolder exists
//       const existingFirstFolder = await FirstFolder.findOne({
//         folderName: { $regex: new RegExp(`^${folderName}$`, 'i') },
//       });
  
//       if (!existingFirstFolder) {
//         return res.status(400).json({ message: "FirstFolder does not exist. Please create the FirstFolder first." });
//       }
  
//       // Array to store the created subfolders
//       const createdSubfolders = [];
  
//       for (const subfolderName of subfolderNames) {
//         // Check if the subfolder already exists for the given FirstFolder
//         const existingFolder = await SecondFolder.findOne({
//           subfolderName: { $regex: new RegExp(`^${subfolderName}$`, 'i') },
//           mainFolder: existingFirstFolder._id,
//         });
  
//         if (existingFolder) {
//           // Skip existing subfolders
//           console.log(`Subfolder "${subfolderName}" already exists. Skipping...`);
//           continue;
//         }
  
//         const file2Name = Banner.originalname;
//         console.log(file2Name);
//         const BannerName = sanitizeFileName(file2Name);
  
//         const Bannerkey = `${uuidv4()}-${BannerName}`;
//         console.log(Bannerkey);
  
//         const params = {
//           Bucket: AWS_BUCKET_NAME,
//           Key: `uploads/${Bannerkey}`,
//           Body: Banner.buffer,
//           ContentType: Banner.mimetype,
//         };
  
//         // Create a new command to upload the banner file to S3
//         const command = new PutObjectCommand(params);
  
//         // Upload banner file to S3
//         await s3client.send(command);
  
//         const banner = await SecondFolder.create({
//           subfolderName: subfolderName,
//           description: description,
//           BannerKey: params.Key,
//           mainFolder: existingFirstFolder._id,
//           Banner_location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`,
//         });
  
//         // Add the created subfolder to the array
//         createdSubfolders.push(banner);
//       }
  
//       // Respond with a success status and the created subfolders details
//       return res.status(200).json({
//         message: "Subfolders uploaded successfully",
//         subfolders: createdSubfolders,
//       });
  
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   };
  


// export const createSubFolder = async (req, res) => {
//   const { subfolderName, description, folderName } = req.body;

//   try {
//     // Check if the main folder exists
//     const mainFolder = await FirstFolder.findById(folderName);

//     if (!mainFolder) {
//       return res.status(400).json({ message: "Main folder does not exist. Please provide a valid main folder ID." });
//     }

//     // Create the SubFolder with the provided main folder ID
//     const subFolder = await SecondFolder.create({
//       subfolderName,
//       description,
//       mainFolder: folderName,
//       // Other SubFolder properties...
//     });

//     // Respond with a success status and the created SubFolder details
//     return res.status(201).json({
//       message: "SubFolder created successfully",
//       subFolder,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

  









/////////////////////////////////////////////////////////////////////////////////////////
export const getBannerById = async (req, res) => {
    const bannerId = req.params.id;
  
    try {
      const banner = await SecondFolder.findById(bannerId);
  
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }
  
      return res.status(200).json({ banner });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  export const getAllBanners = async (req, res) => {
    try {
      const banners = await SecondFolder.find();
      return res.status(200).json({ banners });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  export const getBannerByName = async (req, res) => {
    const bannerName = req.params.name;
  
    try {
      const banner = await SecondFolder.findOne({
        folderName: { $regex: new RegExp(`^${bannerName}$`, 'i') },
      });
  
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }
  
      return res.status(200).json({ banner });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  export const deleteBannerById = async (req, res) => {
    const bannerId = req.params.id;
  
    try {
      const deletedBanner = await SecondFolder.findByIdAndDelete(bannerId);
  
      if (!deletedBanner) {
        return res.status(404).json({ message: "Banner not found" });
      }
  
      return res.status(200).json({ message: "Banner deleted successfully", deletedBanner });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };