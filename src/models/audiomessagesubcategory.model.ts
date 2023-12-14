import mongoose from "mongoose";
const currentDate = new Date();
const curr_date = currentDate.toLocaleTimeString();

const audioFilesSchema = new mongoose.Schema({
  description: String,
  MusicKey: String,
  BannerKey: String,
  Audio_location: String,
  Banner_location: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Audiofiles = mongoose.model("audioFiles", audioFilesSchema);
export default Audiofiles;
