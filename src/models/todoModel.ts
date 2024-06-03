import {Schema, model} from 'mongoose';

const registerSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    isComplete:{
        type:Boolean,
        default:false
    }
})

const todoModel = model('todo',registerSchema);
export default todoModel;