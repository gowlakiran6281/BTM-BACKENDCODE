
import mongoose from "mongoose";

const currentDate = new Date();

const VideoSchema = new mongoose.Schema({
  Videotitle:String,
  description:String,
  MainmostFolderName:String,
  SubFolderName:String,
  YoutubeUrl:String,
  createdAt: {
    type: Date,
   default: currentDate,
  },
});


const  Video = mongoose.model('VideoFolder', VideoSchema); // 'Song' is the model name
export default  Video;