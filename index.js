//mongodb
require('./config/db')

const app=require('express')();
const port =6666

const UserRouter=require('./api/User')
const PostRouter=require('./api/posts')
//for accepting post from data
const bodyParser=require('express').json;
app.use(bodyParser())

app.use('/user',UserRouter)
app.use('/posts',PostRouter)

app.listen(port,()=>{
    console.log('Server is running ');
})
