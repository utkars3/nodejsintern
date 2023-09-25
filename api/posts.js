const router=require('express').Router();
// const { findById } = require('../models/User.js');
const Post=require('./../models/Post.js')



//create a post
router.post("/",async (req,res)=>{
    const newPost=new Post(req.body);
    try {
        const savedPost=await newPost.save()
        console.log(req.body);
        res.status(200).json(savedPost)
    } catch (err) {
        res.status(500).json(err)
    }
})



//update a post

router.put("/:id",async (req,res)=>{
    const post=await Post.findById(req.params.id)
    
    try {
        if(post.userId === req.body.userId){
            await post.updateOne({$set:req.body})
            res.status(200).json("post has been updated")

        }else{
            res.status(403).json("you can update only your post")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


//delete
router.delete("/:id",async (req,res)=>{
    const post=await Post.findById(req.params.id)
    
    try {
        if(post.userId === req.body.userId){
            await post.deleteOne()
            res.status(200).json("post has been deleted")

        }else{
            res.status(403).json("you can delete only your post")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


//like a post
router.put("/:id/like",async (req,res)=>{
    const post=await Post.findById(req.params.id)
    
    try {
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}})
            res.status(200).json("post has been liked")

        }else{
            await post.updateOne({$pull:{likes:req.body.userId}})
            res.status(200).json("post has been disliked")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


//get a post
router.get("/:id",async (req,res)=>{
    const post=await Post.findById(req.params.id)
    
    try {
        if(post.userId===req.body.userId){

            res.status(200).json(post)
        }else{
        res.status(500).json("you can fetch only your post")
            
        }
        
    } catch (err) {
        res.status(500).json(err)
    }
})

//comment a post
router.put("/:id/comment",async (req,res)=>{
    const post=await Post.findById(req.params.id)
    
    try {
        
            await post.updateOne({$push:{commentuser:req.body.userId}})
            await post.updateOne({$push:{commentmsg:req.body.comment}})
            res.status(200).json("Commented")

        
    } catch (err) {
        res.status(500).json(err)
    }
})

// //fetch all the posts
// router.post("/fetch",async (req,res)=>{
    
//     let {userId}=req.body
//     try {
//         const allpost=await Post.find({userId}).toArray(function(err,result){
//             if(err){
//                 res.status(500).json("error")

//             }
//             console.log(result)
//         res.status(200).json(allpost[0])

//         })
//         res.status(500).json(allpost)
       
        
//     } catch (err) {
//         res.status(500).json("err")
//     }
// })

module.exports=router