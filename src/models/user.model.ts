import mongoose, { Schema, model } from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const currentDate = new Date();

  
type UserDocument = {
    name:String;
    phone: String;
    email:String;
    password:String;
    role:String,
  forgetPasswordToken: string;
  forgetPasswordExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  refreshToken: string;
  accessToken: string;
  recentlyplayed:[{type:Schema.Types.ObjectId,ref:'songs'}]
  // methods
  setPassword: (password: string) => void;
  checkValidPassword: (userSendPassword: string) => Promise<boolean>;
  getJwtToken: () => Promise<string>;
  getForgetPasswordToken: () => Promise<string>;
  getForgetPasswordLink: () => Promise<string>;
  };
  
  export const userSchema = new Schema<UserDocument>({
    name: {
      type: String,
      required: [true, 'Please Provide a name'],
      maxLength: [50, 'Name should be under 50 characters'],
    },
  
    phone: {
      type: String,
      required: [true, 'Please Provide a phone number'],
      unique: true,
    },

    email: {
        type: String,
        validate: {
          validator: validator.isEmail,
          message: 'Please Provide a valid email',
        },
        unique: true,
      },

    password: {
        type: String,
        required: [true, 'password atleast 6 characters'],
        unique: true,
      },

      role: {
        type: String,
        enum: ["user"],
        default: "user",
      },


      forgetPasswordToken: {
        type: String,
      },
      forgetPasswordExpiry: {
        type: Date,
      },
      createdAt: {
        type: Date,
       default: currentDate,
      },
      updatedAt: {
        type: Date,
      },
      provider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local',
      },
      refreshToken: {
        type: String,
      },
      accessToken: {
        type: String,
      },
  });

//   const salt = bcrypt.genSaltSync(10);

// // Set Password
// userSchema.methods.setPassword = async function (password: string) {
//   this.password = bcrypt.hashSync(password, salt);
// };
// // Check Valid Password
// userSchema.methods.checkValidPassword = async function (
//   userSendPassword: string
// ) {
//   return bcrypt.compare(userSendPassword, this.password);
// };
// // Get JWT Token
// userSchema.methods.getJwtToken = async function () {
//   const user = {
//     id: this._id,
//     name: this.name,
//     role: this.role,
//   };
//   return jwt.sign(
//     { ...user, iat: Math.floor(Date.now() / 1000) - 30 },
//     JWT_SECRET,
//     {
//       expiresIn: JWT_EXPIRY,
//     }
//   );
// };

// userSchema.methods.getUserIdFromToken = async function (token: string) {
//     if (!token) throw new Error('Token Required');
//     type Decoded = {
//       _id: string;
//     };
//     const decoded = jwt.verify(token, JWT_SECRET) as Decoded;
//     return decoded._id;
//   };
//   // Get Forget Password Token
//   userSchema.methods.getForgetPasswordToken = async function () {
//     const token = crypto.randomBytes(16).toString('hex');
//     const hashToken = crypto.createHash('sha256').update(token).digest('hex');
//     this.forgetPasswordToken = hashToken;
//     this.forgetPasswordExpiry = (Date.now() + FORGET_PASSWORD_EXPIRE) as any;
//     return hashToken;
//   };
//   // Get Forget Password Link
//   userSchema.methods.getForgetPasswordLink = async function () {
//     const token = await this.getForgetPasswordToken();
//     return `${BASE_URL}/reset-password/${token}`;
//   };
//   // Encrypt password before save
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     this.password = await bcrypt.hash(this.password, salt);
//   });

  const User = model('users', userSchema);
export default User;