import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import registerModel from './models/registerModel';
import { validuser } from './middleware/validuser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { validLogin } from './middleware/validLogin';
import todoModel from './models/todoModel';
import { authentication } from './middleware/protect';
const app = express();
import {uploadFileToS3Bucket} from '../src/s3Upload';

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dummyExam')
        .then(result => {
            console.log('database connected');
        }).catch(err=>{
            console.log(err);
        });
    }catch(err){
        console.error('Mongodb connection error',err);
        process.exit(1);
    }
}

connectDB();


const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'uploades/');
    },
    filename:(req,file,cb)=>{
        cb(null,(file.originalname).replace(/\s/g, ''));
    }
})

const upload = multer({storage:storage})
app.post('/api/v1/users/register',upload.array("images"),validuser,async function(req:any,res:any,next:any){

    const {email,password,username} = req.body;

    let images:any = [];

    for(let i = 0; i < req.files.length;i++){
        images.push(req.files[i].path);
    }

    try {
        
        const data = new registerModel({
            email:email,
            password:password,
            username:username,
            images:images
        })
        
        const userCreated = await registerModel.insertMany(data);

        uploadFileToS3Bucket('sanjay-s3-bucket-2025','uploades');

        res.status(201).send({data:{
            user:{
                email:userCreated[0].email,
                username:userCreated[0].username
            }
        }});

        console.log(userCreated);
        
    } catch (error) {
        console.log(error);
    }
})

// uploadFileToS3Bucket('sanjay-s3-bucket-2025','uploades');


app.post('/api/v1/users/login',validLogin,async function(req:any,res:any,next:any){
    const {username, password} = req.body;
    // const username = req.username   
    const email = req.email;  

    const token:any = jwt.sign({
        username:username
    },'abcd',{ algorithm: 'HS256' })

    res.status(200).send({data:{
        user:{
            email:email,
            username:username
        },
        accessToken:token
    }})
})

app.get('/api/v1/todos', async function (req:any,res:any,next:any){
    try {
        const data = await todoModel.find({});
        res.status(200).json({
            data:data,
            message:"Todos fetched successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
        
    }
})

app.get('/api/v1/todos/:todoId', async function (req:any,res:any,next:any){
    try {
        const {todoId} =  req.params;

        // if(!mongoose.Types.ObjectId.isValid(todoId)) return res.status(422).send("id is not valid");

        
        const data = await todoModel.findById(todoId);
        if(!data) return res.status(404).send();

        res.status(200).json({
            data:[data]
        })
    } catch (error) {
        console.log(error);
        
    }
    
    // res.status(200).send('get by id');
})

app.delete('/api/v1/todos/:todoId',authentication, async function (req:any,res:any,next:any){
    try {
        const {todoId} =  req.params;
        const found = await todoModel.findById(todoId);
        if (!found) return res.status(404).send();

        // if(!mongoose.Types.ObjectId.isValid(todoId)) return res.status(422).send("id is not valid");

        const id = new mongoose.Types.ObjectId(todoId);
        const data = await todoModel.findByIdAndDelete(id);
        res.status(200).json({
            data:{
                deletedTodo:data
            }
        })
    } catch (error) {
        console.log(error);
        
    }
})

app.patch('/api/v1/todos/:todoId', authentication,async function (req:any,res:any,next:any){
    
    try {
        const {todoId} = req.params;
        const found = await todoModel.findById(todoId);
        if (!found) return res.status(404).send();

        // console.log(todoID);
        
        // if(!mongoose.Types.ObjectId.isValid(todoId)) return res.status(422).send("id is not valid");


        const {description,title} = req.body;
        
        if(!title) return res.status(422).send("Todo title is required");

        if(!description) return res.status(422).send("Todo description is required");


        const data = await todoModel.findByIdAndUpdate(todoId,{
            $set : {
                description:description,
                title:title
            }
        },{new:true});
        res.status(200).json({
            data:data
        })

    } catch (error) {
        res.send(error)
    }

})

app.post('/api/v1/todos', authentication,async function (req:any,res:any,next:any){

    const {title,  description} = req.body;



    if(!title) return res.status(422).send("Todo title is required");

    if(!description) return res.status(422).send("Todo description is required");

    try {
        
        const data  = new  todoModel({
            title:title,
            description:description    
        })

        const todo = await todoModel.insertMany(data);

        res.status(201).send({data:{
            _id:todo[0]._id,
            title:todo[0].title,
            description:todo[0].description,
            isComplete:todo[0].isComplete
        }});
    } catch (error) {
        console.log(error);
        
    }

})

app.patch('/api/v1/todos/toggle/status/:todoId', authentication,async function (req:any,res:any,next:any){
    const { todoId } = req.params
    const found = await todoModel.findById(todoId).select('isComplete -_id')
    if (!found) return res.status(404).send()
    const toggleer = () => {
        return found.isComplete == false ? true : false
    }
    const data = await todoModel.findByIdAndUpdate(todoId, {
        isComplete: toggleer()
    }, { new: true }).select('-__v')
    res.status(200).json({ data })
})

app.listen(3005);