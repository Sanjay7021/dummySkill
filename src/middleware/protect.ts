import jwt from 'jsonwebtoken';

export function authentication (req:any,res:any,next:any){
    const token = req.headers.authorization;
    const data =  token.split(" ")

    if(!token) return res.status(401).send();
    
    try{
        const payloadData = Object(jwt.verify(data[1],"abcd"));
        console.log(payloadData);
        next();
    }catch(err){
        res.status(401).send();
        console.error(err);
    }
    
}

