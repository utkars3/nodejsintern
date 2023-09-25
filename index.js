//mongodb
require('./config/db')
var jwt = require('jsonwebtoken');
const app=require('express')();
const port =6666

const UserRouter=require('./api/User')
const PostRouter=require('./api/posts')
//for accepting post from data
const bodyParser=require('express').json;
app.use(bodyParser())


const auth=(req,res,next)=>{
    // console.log(typeof(decoded)," ",typeof(req.body.userId));
    // next()
    try {
        const authtoken=req.headers['authorization'].split('Bearer ')[1]
        var decoded = jwt.verify(authtoken, 'shhhhh');
        if(decoded===req.body.userId){
            next();
        }
        else{
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(401);
    }
   
    
}


app.use('/user',UserRouter)
app.use('/posts',auth,PostRouter)

app.listen(port,()=>{
    console.log('Server is running ');
})
