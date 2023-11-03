const cron = require("node-cron");
const Blog = require("../models/blogmodel");

const cleanUpBin = () => {
    cron.schedule("0 0 1 * * *", async () =>{
        console.log("cron is running");

        let deletedBlogs = await Blog.find({isDeleted: true});

        if(deletedBlogs.length > 0){
            deletedBlogs.forEach(async (each) => {
                let diff = (each.deletionDateTime - each.creationDateAndTime)/ (1000 * 60 * 60* 24);

                if(diff >= 30){

                    try{
                        await Blog.findByIdAndDelete(each._id)

                    }catch(err){
                        console.log(err);
                    }
                }
            })
        }
    }, 
    
    {
        scheduled: true,
        timezone: "Asia/Kolkata"
    }
    
    )
}

module.exports = {cleanUpBin}