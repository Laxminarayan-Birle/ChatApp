import cloudinary from "../lib/cloudinary";
import Message from "../models/Message";
import User from "../models/User";

export const getAllContacts = async (req,res) => {
    try{
         const loggedInUserId = req.user._id;
         const filteredUsers = await User.find({_id: { $ne : loggedInUserId }}).select("-password");
         
         res.status(200).json(filteredUsers);
         
    } catch (error) {
        console.log("Error in getAllContacts", error);
        res.status(500).json({message:"Server Error"});
    }
}

export const getMessagesByUserId = async (req, res) =>{
    try{
        const myId=req.user._id;
        const {id:userToChatId}=req.params;

        const message=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId},
            ]
        });

        res.status(200).json(message);

    } catch (error) {
        console.log("Error in getMessage controllers",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text,image}=req.body;
        const {id:receiverId} = req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image)
        {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
            const newMessage = new Message({
                senderId,
                receiverId,
                text,
                image,
                imageUrl,
            });

            await newMessage.save();
            res.status(201).json(newMessage);

        
    } catch (error) {
        console.log("Error in sendMessage controller",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const getChatPartners = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;

        const message=await Message.find({
                $or:[
                    {senderId:loggedInUserId},
                    {receiverId:loggedInUserId},
                ]
            });

            const chatParterIds = [
                ...new Set(
                 message.map(msg => msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString())
                ),
            ];

            const chatParteners = await User.find({_id: {$in:chatParterIds}}).select("-password");
            res.status(200).json(chatParteners);

    } catch (error) {
        console.log("Error in getChatParterns contollers", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}