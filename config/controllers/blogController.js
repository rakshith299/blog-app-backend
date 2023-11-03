const Joi = require("joi");
const Blog = require("../models/blogmodel");
const Follow = require("../models/followmodel");

const createBlog = async (req, res) => {
    let isValid = Joi.object({
        title: Joi.string().required(),
        textBody: Joi.string().min(20).max(1000).required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: isValid.error
        })
    }

    const {title, textBody} = req.body;

    let blogObj = new Blog({
        title: title,
        textBody: textBody,
        creationDateAndTime: new Date(),
        username: req.locals.username,
        userId: req.locals.userId

    });

    try{

        await blogObj.save();

        return res.status(201).send({
            status: 201,
            message: "New blog Posted"
        });

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to create Blog",
            data: err
        })
    }
}

const getUserBlog = async(req,res) => {
    
    const userId = req.locals.userId;
    const page = Number(req.query.page) || 1;
    const LIMIT = 10;

    let blogData;

    try{

        blogData = await Blog.find({userId, isDeleted: false}).sort({creationDateAndTime: -1}).skip((page - 1) * LIMIT).limit(LIMIT);
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Unable to fetch User Blogs",
            data: err
        })
    }

    res.status(200).send({
        status: 200,
        message: "Fetched user Blogs",
        data: blogData
    })
}

const deleteBlog = async (req, res) => {
    const blogId = req.params.blogid;
    const userId = req.locals.userId;

    let blogData;

    try{

        blogData = await Blog.findById(blogId);

        if(!blogData){
            return res.status(404).send({
                status: 404,
                message: "Blog does not exist",
            })
        }

        if(blogData && blogData.userId != userId){
            return res.status(401).send({
                status: 401,
                message: "Unauthorised to delete this Blog",
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Unable to get Blog",
            data: err
        })
    }

    // find by id and delete
    try{

        //await Blog.findByIdAndDelete(blogId);

        await Blog.findByIdAndUpdate(blogId, {isDeleted: true, deletionDateTime: Date.now()});

        return res.status(200).send({
            status: 200,
            message: "Blog deleted",
        })

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Unable to delete Blog",
            data: err
        })
    }

}

const editBlog = async(req, res) => {
    let isValid = Joi.object({
        blogId: Joi.string().required(),
        title: Joi.string().required(),
        textBody: Joi.string().min(30).max(1000).required()
    }).validate(req.body);


    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Enter Valid Credentials",
            data: isValid.error
        })
    }

    const {blogId, title, textBody} = req.body;
    const userId = req.locals.userId;
    
    let blogData;

    try{

        blogData = await Blog.findById(blogId);

        if(!blogData){
            return res.status(404).send({
                status: 404,
                message: "Blog does not exist"
            })
        }

        if(blogData && blogData.userId != userId){
            return res.status(401).send({
                status: 401,
                message: "Unauthorised to edit this blog"
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to fetch Blog",
            data: err
        })
    }

    // Time check

    const creationDateAndTime = blogData.creationDateAndTime;
    const currentTime = Date.now();

    const diff = (currentTime - creationDateAndTime) / (1000 * 60);

    if(diff > 30){
        return res.status(400).send({
            status: 400,
            message: "Time elapsed, cannot edit",
        })
    }


    // updation

    try{

        await Blog.findByIdAndUpdate(blogId, {title, textBody})

        return res.status(200).send({
            status: 200,
            message: "Update successful",
        })


    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to update Blog",
            data: err
        })
    }
 
    
}

const homePageBlogs = async(req, res) => {
    const currentUserId = req.locals.userId;

    let followingList;

    try{

        followingList = await Follow.find({currentUserId});

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Unable to fetch the blogs of users you follow",
            data: err
        })
    }


    let followingUserIds = [];

    followingList.forEach((each) => {
        followingUserIds.push(each.followingUserId)
    });

    try{

        const homeBlogs = await Blog.find({
            userId: {   $in: followingUserIds   },
            isDeleted: false
        }).sort({creationDateAndTime: -1});

        return res.status(200).send({
            status: 200,
            message: "Fetched all Home Blogs",
            data: homeBlogs
        })
        

    }catch(err){

        return res.status(400).send({
            status: 400,
            message: "Failed to fetch homepage blogs",
            data: err
        })
    }
}


module.exports = {createBlog, getUserBlog, deleteBlog, editBlog, homePageBlogs}