import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";
export const signup = async (req,res) => {
    
    const {fullName, email, password} = req.body
    try{
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All field required"});
        }
        
        if(password.length < 8)
        {
            return res.status(400).json({message: "Password must be at least 8 characters"});

        }

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email))
            return res.status(400).json({message: "Invalid email format"});
        
        const user=await User.findOne({email});

        if(user){
            return res.status(400).json({message:"Email Aleady exists"});
        }
        
        const salt=await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            fullName,
            email,
            password:hashPassword,
        });

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id,res);

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

            try{
                await sendWelcomeEmail(savedUser.email,savedUser.fullName,process.env.CLIENT_URL);
            } catch (error) {
                console.error("Failed to send welcome email:", error);
            }


        }else{
            res.status(400).json({message:"Invalid user data"});
        }


    }catch(error){

        console.log("Error in signup controller");
        res.status(500).json({message:"Internal server error"});
    }
}

export const login = async (req,res) =>{

    const { email, password } = req.body;

    try {
        const user=await User.findOne({email});

        if(!user)
        {
            return res.status(400).json({message:"Invalid Credentials"});
            
        }
        const check= await bcrypt.compare(password,user.password);
        if(!check){
            return res.status(400).json({message : "Invalid Credentials"});

        }

        generateToken(user.id,res);

        res.status(200).json({
            _id : user.id,
            fullName : user.fullName,
            email:user.email,
            profilePic:user.profilePic,

        });

        
    } catch (err) {
        
        console.error("Error in Login controller");
        res.status(500).json({message : "Internal Server Error"});
    }
}

export const logout = async(req,res) =>{

     res.cookie("jwt","",{maxAge:0});
     res.status(200).json({message:"Logged out Successfully"});
}