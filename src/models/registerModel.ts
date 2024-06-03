import {Schema, model} from 'mongoose';

const registerSchema = new Schema({
    email:{
        type:String,
        // required:true
    },
    password:{
        type:String,
        // required:true
    },
    username:{
        type:String,
        // required:true
    },
    images:{
        type:Array,
        required:true
    }
})

const registerModel = model('register',registerSchema);
export default registerModel;