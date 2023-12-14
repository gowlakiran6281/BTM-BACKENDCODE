// models/Album.js
import mongoose from 'mongoose';
const currentDate = new Date();
const subchema = new mongoose.Schema({
    SubFolderName: {
    type: String,
    required: true,
  },
  MainmostFolderName: {
    type: String,
    required: true,
  },
  SubFolderkey: {
    type: String,
    required: true,
  },
  SubFolder_banner: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
   default: currentDate,
  },
});

const SubFolder = mongoose.model('SubFolder', subchema);

export default SubFolder;
