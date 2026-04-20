import dotenv from "dotenv"
import OpenAI from "openai";

dotenv.config();
// console.log( "🎊", process.env.OPENAI_API_KEY );
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default openai