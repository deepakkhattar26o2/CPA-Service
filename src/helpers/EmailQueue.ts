import Bull , {Job} from "bull";
import sendMail from "./NodeMailer";
require('dotenv').config();

//Configuring process queue on redis
const emailQueue = new Bull('email', {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) ||6379
    }
})



const emailProcess = async (job : Job)=>{
    if(job.data.otp&&job.data.email)    
    {    
        sendMail(job.data.email, "One Time Password for The College Placement App", `Your one-time-password for The College Placement App is ${job.data.otp}`).then().catch((err : Error)=>{console.log(err.message, job.data.email)})
    }
}

emailQueue.process(emailProcess)


export default emailQueue