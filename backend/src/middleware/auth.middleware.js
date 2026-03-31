import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "..model/User.js";

export const protectedRoute = async (req,res,next) => {
     
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message:"unauthorized-no token provided"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded)
            return res.status(401).json({message:"unauthorized-Invalid token "});

        const user = User.findById(decoded.userId);

        if(!user)
            return res.status(404).json({message: "User not found"});

        req.user=user;
        next();

    } catch (error) {

            console.log("error in ProtectedRoute middleware", error);
            res.status(500).json({message:"Internal server error"});
    }
}