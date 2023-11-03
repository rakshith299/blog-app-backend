const User = require("../models/usermodel");
const Follow = require("../models/followmodel");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);

// register
const registerUser = async(req, res) => {

    //validation using joi 

    let isValid = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().min(3).max(50).required().alphanum(),
        password: Joi.string().min(8).required(),
        email: Joi.string().email().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Enter valid Input",
            data: isValid.error
        })
    }

    // checking if user already exist

    try{

        const userExist = await User.find({
            $or : [{email: req.body.email, username: req.body.username}]
        });

        if(userExist.length !== 0){
            return res.status(400).send({
                status: 400,
                message: "Entered Credentials already exists"
            })
        }


    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while checking in Database",
            data: err
        })
    }


    // all are correct 

    let hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

    let newUserObj = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword
    })

    try{

        await newUserObj.save();

        return  res.status(201).send({
            status: 201,
            message: "New User Added",
            
        })

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error occured while posting data",
            data: err
        })
    }


}


//login

const loginUser = async(req,res) => {
    const {username, password} = req.body;

    //validate
    const isValid = Joi.object({
        username : Joi.string().required(),
        password: Joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Enter valid Credentials",
            data: isValid.error
        })
    }

    //checking in database

    let userObj;
    try{
        userObj = await User.findOne({username});

        if(!userObj){
            return res.status(400).send({
                status: 400,
                message: "User does not exist",
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data from database",
            data: err
        })
    }

    //password check 

    let isPasswordSame= await bcrypt.compare(password, userObj.password);

    if(!isPasswordSame){
        return res.status(400).send({
            status: 400,
            message: "Password not correct",
        })
    }

    //set jwt 

    let payload = {
        username: userObj.username,
        name: userObj.name,
        email: userObj.email,
        userId : userObj._id
    }

    let jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY);

    return res.status(200).send({
        status: 200,
        message: "login success",
        data:{
            token: jwtToken
        }
    })



}

const getAllUsers = async (req,res) => {
    let currentUserId = req.locals.userId;

    let usersData;
    try{

        usersData = await User.find({_id : {$ne: currentUserId}});

        if(!usersData){
            return res.status(400).send({
                status: 400,
                message: "No Users Found"
            })
        }

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to fetch Users",
            data: err
            
        })
    }

    // Following users

    let followingList = [];

    try{
        followingList = await Follow.find({currentUserId});

    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to get following people Data",
            data: err
        })
    }

    let usersList = [];

    // storing all following people in on eobject

    let followingMap = new Map();

    followingList.forEach((each) => {
        followingMap.set(each.followingUserId, true);
    })



    usersData.forEach((each) => {

        if(followingMap.get(each._id.toString())){

            let userObj = {
                name: each.name,
                username: each.username,
                email: each.email,
                _id: each._id,
                follow: true
            }

            usersList.push(userObj);

        }else{

            let userObj = {
                name: each.name,
                username: each.username,
                email: each.email,
                _id: each._id,
                follow: false
            }

            usersList.push(userObj);

        }

    })

    

        return res.status(200).send({
            status: 200,
            message: "All users info successfully fetched",
            data: usersList
        })
    
}

module.exports = {registerUser, loginUser, getAllUsers};