import registerModel from "../models/registerModel";
import bodyParser from "body-parser";
import Joi from 'joi'
import express from 'express'
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
export async function validuser(req:any,res:any,next:any){
    const userRegistrationValidation = Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required()
            .messages({ 'any.required': "Email is Requierd", 'string.email': "Please Enter isasd invalid", 'any.lowercase': "Username must be lowercase" }),
        username: Joi.string()
            .min(3)
            .required()
            .messages({ 'string.min': "Username must be at lease 3 characters long", 'any.required': "Username is required"}),
        password: Joi.string()
            .required()
            .messages({ 'any.required': "Password is required"}),
    })

    const {email,username} = req.body;
    console.log(req.body);
    
    
    const checkLowerCase = (str:string) => {
        for(let i = 0 ; i < str.length ; i++ ){
            if(str[i] == str[i].toUpperCase()){
                return true;
            }
        }
        return false;
    }

    if(checkLowerCase(username)){
        return res.status(422).send("User name must be in lowercase")
    }

    const {error} = userRegistrationValidation.validate(req.body);

    if(error) return res.status(422).send(error.details[0].message);

    try{
        const foundData = await registerModel.find({email:email, username:username});
        console.log("found data",foundData);
        if(foundData.length > 0)
         return res.status(409).send("User with email or username already exists")
        
    }catch(err){
        res.send(err)
    }
    next();
}