import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema({
    avatar : { 
        type : String ,
         default : null
        },
    username : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        
        lowercase : true,
        trim : true
    },
    fullName : {
        type : String,
        trim: true,
    },
    password : {
        type : String ,
        required : [true, "Password is required"],
    } ,
    isEmailVerified : {
        type : Boolean,
        default : false,
    },
    refreshToken : {
        type : String,
    },
    forgotPasswordToken : {
        type : String,
    },
    forgotPasswordTokenExpiry : {
        type : Date,
    },
    emailVerificationToken : {
        type : String,
    },
    emailVerificationTokenExpiry : {
        type : Date,
    },
    googleId : {
        type : String,
        default : null
    }
},{timestamps : true})

// ----------------------  pre Hooks ------------------------------

userSchema.pre("save", async function(){
    if(!this.isModified("password")) {
        // if the password is not modified , move to the next middleware
        return 
    }
        // hash the password
        this.password = await bcrypt.hash(this.password, 10)
    
   
})

// ------------------------- methods --------------------------
// ------------------------------ comapre password
// ------------ compare password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// ------------------------ method  generateJwtAccessToken -------------------
userSchema.methods.generateAccessToken =  function(){
     
    const payload = {
        _id : this._id,
        email :  this.email,
        username : this.username
    }

    return jwt.sign(payload , process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
}

// ------------------------ method  generateJwt-refresh-Token -------------------
userSchema.methods.generateRefreshToken =  function(){
     
    const payload = {
        _id : this._id
    }

    return jwt.sign(payload , process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}

// ----------------- temporary tokens for email verification and password reset 
userSchema.methods.generateTemporaryToken = function (){
    const unHashedToken  = crypto.randomBytes(20).toString('hex')
     
    const hashedToken = crypto
    .createHash('sha256')
    .update(unHashedToken)
    .digest('hex') 

    const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now 
    return {unHashedToken, hashedToken , tokenExpiry}

}

// ---------------------------------------------------
const userTable = mongoose.model("User", userSchema)
export {userTable}