// src\routes\auth.routes.js
import express from "express"
import { registerUser , login, verifyEmail , logoutUser, resendEmailVerification,getCurrentUser,refreshAccessToken,forgetPasswordRequest,resetForgetPassword,changeCurrentPassword, cbFunction,updateAvatar} from "../controllers/auth.controllers.js"
const router = express.Router()
import { verifyJWT, passAuth } from "../middlewares/auth.middleware.js"
import {uploadAvatar} from "../middlewares/upload.middleware.js"


// http://localhost:8000/api/v1/auth/register
router.route("/register").post(registerUser) //register is a sign up
// -------------------------------
//  http://localhost:8000/api/v1/auth/verify-email/:verificationToken
//                                                           un-hashed token
// http://localhost:8000/api/v1/auth/verify-email?token=c48884f458d88d5ff01fb5388df6ea11958a9b0e
router.route("/verify-email/:verificationToken").get(verifyEmail) // user verify email route
// ------------------------------------
router.route("/resend-email-verification").get(resendEmailVerification) // user verify email route

router.route("/login").post(login) // user login route
// ------------------------------------
router.route("/logout").post(verifyJWT ,logoutUser) // user logout route
// ----------------------------------------
router.route("/current-user").post(verifyJWT, getCurrentUser) // get current login user route
// ----------------------------------------
router.route("/refresh-token").post(refreshAccessToken) // refresh access token route
// ----------------------------------------
router.route("/forget-password").post(forgetPasswordRequest) // forget-password token route
// --------/api/v1/auth/reset-password/${unHashedToken}-----------------
router.route("/reset-password/:resetToken").get(resetForgetPassword) // reset forget token route
// ----------------------------------------
router.route("/change-password").post(verifyJWT,changeCurrentPassword) // change password route
// ----------------------------------------
// ------------------ login with google route --------------------
// redirect to user in google screen 
import passport from "../config/passport.js" 

router.route("/google").get( passport.authenticate("google", {scope : ["profile", "email"]} ))
 
// google redirect back from here after login
//     google condole redirect url set kia tha woh yahn ayi ga
router.route("/google/callback").all(passAuth).get(cbFunction)

//  ------------ failure route -------------
router.route("/google/failure").get( (req,res) => {
    return res.status(401).json({message : "Google authentication failed /google/failure"})
} )

// --------------------------------------------------------------------------
// Avatar upload in s3 bucket 
// to update Avatar                            uploadAvatar yah ek object hai
router.route("/update-avatar").all(verifyJWT, uploadAvatar.single("avatar")).patch(updateAvatar)

// create 

// ------------------------------------------------
export default router