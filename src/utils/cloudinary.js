import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
 //file systems of node used to read,write, etc 
// Configuration
cloudinary.config({ 
    cloud_name: 'dvte3roul', 
    api_key: '675114951764684', 
    api_secret: '0yiWYtleDs0-M7KPkpiLEzMSRi0' // Click 'View API Keys' above to copy your API secret
});

const upload_on_cloudinary=async (localFilepath)=>{
    try {
        if(!localFilepath){
            return null
        }
        //upload pth on cloudinary
        const response=await cloudinary.uploader.upload(localFilepath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localFilepath)//remove the temorary locally saved file
        //file uploaded successfully
        console.log("file is uploaded on cloudinary successfully",response)
        return response
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        fs.unlinkSync(localFilepath)//remove the temorary locally saved file
        return null
    }
}
export {upload_on_cloudinary}
