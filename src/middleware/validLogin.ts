import registerModel from "../models/registerModel";

export async function validLogin(req:any,res:any,next:any){
    
    const {username, password} = req.body;

    if(username == '' || username == null){
       return res.status(400).send("Username or email is required")
    }

    if(password == '' || password == null){
        return res.status(422).send("Password is required");
    }

    try{

        const filter = {"$and": [{username:username},{password:password}]}
        const foundData = await registerModel.find(filter);
        console.log("found data",foundData);
        if(foundData.length == 0){
           return res.status(401).send("Invalid user credentials")
        }  
        req.email = foundData[0].email;          
    }catch(err){
        res.send(err)
    }
    next();
    

}