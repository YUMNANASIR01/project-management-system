import dotenv from "dotenv";
import app from "./app.js";
import connectMongoDb from "./db/connection.js";
dotenv.config({
  path: "./.env",
});
// ---------------------------------------
const port = process.env.PORT || 8000;

connectMongoDb(process.env.MONGODB_URL).then(
  // ------------------- port listener---------------
  app.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
})
).catch(()=>{
  console.log("❌ failed to connect to Mongo DB , Existing !");
  process.exit(1);
})



