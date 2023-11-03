const Joi = require("joi");
const User = require("../models/usermodel");
const Follow = require("../models/followmodel");


const followUser = async (req, res) => {
    const {followingUserId} = req.body;
    const currentUserId = req.locals.userId;

    let isValid = Joi.object({
        followingUserId: Joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid userId to follow",
            data: isValid.error
        })
    }

    //verify following userid exist

    let followingUserData;

    try{

        followingUserData = await User.findById(followingUserId);

        if(!followingUserData){
            return res.status(400).send({
                status: 400,
                message: "Following userId does not exist",
            })
        }
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching following userId",
            data: err
        })
    }

    //check if current user follows other user already


    try{

        let followObj = await Follow.findOne({currentUserId, followingUserId});

        if(followObj){
            return res.status(400).send({
                status: 400,
                message: "You already follow this user",
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching follows data",
            data: err
        })
    }

    // adding follow object to db

    let followObject = new Follow({
        creationDateTime: Date.now(),
        currentUserId: currentUserId,
        followingUserId: followingUserId
    });


    try{

        await followObject.save();

        return res.status(200).send({
            status: 200,
            message: "following a user successful",
        })

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while posting follow object",
            data: err
        })
    }

}

const unfollowUser = async (req, res) => {

    const {followingUserId} = req.body;
    const currentUserId = req.locals.userId;

    let isValid = Joi.object({
        followingUserId: Joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid userId to follow",
            data: isValid.error
        })
    }

    //verify following userid exist

    let followingUserData;

    try{

        followingUserData = await User.findById(followingUserId);

        if(!followingUserData){
            return res.status(400).send({
                status: 400,
                message: "Following userId does not exist",
            })
        }
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching following userId",
            data: err
        })
    }

    //check if current user follows other user 


    try{

        let followObj = await Follow.findOne({currentUserId, followingUserId});

        if(!followObj){
            return res.status(400).send({
                status: 400,
                message: "You dont follow this user",
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching follows data",
            data: err
        })
    }

    // find and delete the follow object

    try{

        await Follow.findOneAndDelete({currentUserId, followingUserId});

        return res.status(200).send({
            status: 200,
            message: "unFollow successful"
        })

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Unable to unfollow the user",
            data: err
        })
    }
        

}

module.exports = {followUser, unfollowUser}