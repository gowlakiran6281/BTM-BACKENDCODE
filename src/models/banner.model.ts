import mongoose from "mongoose";

const currentDate = new Date();

type Banner ={
  bannerKey:string,
    Banner_location: string,
    status: string,
    createdAt: Date;
}

// Create a Mongoose schema for the Article type
const articleSchema = new mongoose.Schema<Banner>({
 
  Banner_location: String,
  bannerKey:String,
  status: {
    type: String,
    enum: ["Offline", "Online"],
    default: "Online",
  },
  createdAt: {
    type: Date,
   default: currentDate,
  },
});

// Create a Mongoose model for the Article type
const Banner = mongoose.model("Banner", articleSchema);

export default Banner;
