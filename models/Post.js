const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const Postschema=new Schema({
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    img:{
        type:String
    },
    likes:{
        type:Array,
        default:[]
    },
    commentuser:{
        type:Array,
        default:[]
    },
    commentmsg:{
        type:Array,
        default:[]
    }
    
});

const Post=mongoose.model('Post',Postschema);

module.exports=Post;
