// import mongoose from "mongoose";

// const audiomessageSchema = new mongoose.Schema({
//   audiomessage:String,
//   artist:String,
//   lyrics:String,
//   MusicKey:String,
//   BannerKey:String,
//   Audio_location:String,
//   Banner_location:String,
//   download_file:String
// });

// const AudioMessage = mongoose.model('audiomessage', audiomessageSchema); // 'Song' is the model name
// export default AudioMessage;

import mongoose from "mongoose";
const currentDate = new Date();

const MainFolderSchema = new mongoose.Schema({
  folderName: {
    type: String,
  },
  description: String,
  Banner: String,
  BannerKey: String,
  Banner_location: String,

  createdAt: {
    type: Date,
    default: currentDate,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const FirstFolder = mongoose.model("mainfolder", MainFolderSchema);
export default FirstFolder;
