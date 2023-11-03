const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    let token = req.headers["x-blog"];

    let verified;

    try{

        verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

    }catch(Err){
        return res.status(400).send({
            status: 400,
            message: "Could not verify jwtToken",
            data: Err
        })
    }

    if(verified){
        req.locals = verified;
        next();
    }else{
        res.status(401).send({
            status: 401,
            message: "Not Authenticated",
        })
    }
}

module.exports = {isAuth}


