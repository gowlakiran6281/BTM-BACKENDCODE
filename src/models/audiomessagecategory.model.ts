// import mongoose from "mongoose";
// const currentDate = new Date();
// const curr_date= currentDate.toLocaleTimeString();

// type SubFolder ={

//     folderName:string;
//     BannerKey:String,
//     Banner_Location:String,
//     createdAt: String;
//     updatedAt: String;
//   }

// const SubFolderSchema = new mongoose.Schema({

//   folderName: String,
//     Banner:String,
//     BannerKey:String,
//     Banner_Location:String,
//     BannerUpload:String,
    
//     createdAt: {
//         type: String,
//        default:new Date()+ curr_date,
//       },
//       updatedAt: {
//         type: String,
//       },
//     });

// const SecondFolder = mongoose.model("secondfolder",SubFolderSchema)
// export default SecondFolder;


// import mongoose from "mongoose";

// const currentDate = new Date();
// const curr_date = currentDate.toLocaleTimeString();

// type SubFolder = {
//   folderName: string;
//   BannerKey: string;
//   Banner_Location: string;
//   createdAt: string;
//   updatedAt: string;
// };

// const SubFolderSchema = new mongoose.Schema({
//   folderName: String,
//   Banner: String, // Corrected field name from "BannerKey" to "Banner"
//   BannerKey: String,
//   Banner_Location: String,
//   BannerUpload: String, // Added field for banner upload, adjust as needed

//   createdAt: {
//     type: String,
//     default: new Date() + curr_date,
//   },
//   updatedAt: {
//     type: String,
//   },
// });

// const SecondFolder = mongoose.model("secondfolder", SubFolderSchema);
// export default SecondFolder;


// import mongoose from "mongoose";
// const currentDate = new Date();
// const curr_date= currentDate.toLocaleTimeString();

// type SubFolder ={

//   folderName:string;
//   description:String;
//     BannerKey:String,
//     Banner_location:String,
//     createdAt: String;
//     updatedAt: String;
//   }




//   const SubFolderSchema = new mongoose.Schema({
//     subfolderName: {
//       type: String,
//       unique: true,
//     },
//     description: String,
//     Banner: String,
//     BannerKey: String,
//     Banner_location: String,
//     mainFolder: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'FirstFolder', // Reference to the FirstFolder model
//       required: true,
//     },
//     createdAt: {
//       type: String,
//       default: new Date() + curr_date,
//     },
//     updatedAt: {
//       type: String,
//     },
//   });
  
//   SubFolderSchema.index({ subfolderName: 1, mainFolder: 1 }, { unique: false });

// const SecondFolder = mongoose.model("secondfolder", SubFolderSchema);


//     //const SecondFolder = mongoose.model("secondfolder", SubFolderSchema);
    
//     export default SecondFolder;
    
    
import mongoose from "mongoose";

const currentDate = new Date();
const curr_date = currentDate.toLocaleTimeString();

const SubFolderSchema = new mongoose.Schema({
  subfolderName: {
    type: String  },
  folderName:String,
  description: String,
  BannerKey: String,
  Banner_location: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const SubFolder = mongoose.model("secondfolder", SubFolderSchema);

export default SubFolder;
