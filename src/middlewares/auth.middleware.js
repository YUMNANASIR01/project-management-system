// src\middlewares\auth.middleware.js
import { asyncHandler } from "../utils/async-handler.js";
import {userTable} from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js";
import passport  from "../config/passport.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {


    // getting client token from cookies
    const token = req.cookies?.accessToken

    // if token is not present , throw error
    if(!token){
        throw new ApiError(401, "Access token is missing.")
    }

    try {
        // token decoded from jwt verify
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await userTable.findById(decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")
        // if user not found , throw error
        if(!user){
            throw new ApiError(401, "User not found with this token.")
        }
        // attach user to req object (asscess token ky zariya user ko dhundata hai)
        req.user = user
        next() //proceed to api function

    }
    catch (error) {
        throw new ApiError(401, "user not found.")
    }
})



// -------------- login with google -------------
export const passAuth =  (req,res, next)=> {
    passport.authenticate("google", {session : false}, (err, user, info) => {
        console.log("❌", err);
        console.log("✅", user);
        console.log("ℹ️", info);
        
        if(err || !user){
            return res.status(401).json(
                {
                    message : "Gooooooogle Authentication failed",
                    error : err.message || info
                }
            )
        }

        req.user = user
        next()

    }  )(req , res, next)

}




// export const verifyJWT = asyncHandler(async (req, res, next) => {
// //chatGPT code
//     const token =
//         req.cookies?.accessToken ||
//         req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         throw new ApiError(401, "Access token is missing.");
//     }

//     try {
//         const decodedToken = jwt.verify(
//             token,
//             process.env.ACCESS_TOKEN_SECRET
//         );

//         const user = await userTable
//             .findById(decodedToken._id)
//             .select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

//         if (!user) {
//             throw new ApiError(401, "User not found with this token.");
//         }

//         req.user = user;
//         next();

//     } catch (error) {
//         throw new ApiError(401, "Invalid or expired token.");
//     }
// });