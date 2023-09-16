const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const config = require('./../config/config')


//mongodb user model
const user = require('./../models/User')

//password handler
const bcrypt = require('bcrypt');





//reset password mail
const sendResetPasswordMail = async (name, email, token) => {
    console.log(name,email,token)
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            service: 'gmail',
            requireTLS:true,
            auth: {
                user: config.emailuser,
                pass: config.emailPassword
            }
        })

        const mailOptions = {
            from: config.emailuser,
            to: email,
            subject: 'For reset password',
            html: '<p>Hii ' + name + ',Please copy the link <a href="http://localhost:6666/user/reset_password?token=' + token + '"> and reset your password </a></p> '
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log("Mail has been sent:- ", info.response)
            }
        })

    } catch (err) {
        res.json({
            status: "FAILED",
            message: "Problem in sending mail"
        })
    }
}




//signup
router.post('/signup', (req, res) => {
    let { username, email, password } = req.body;
    username = username.trim()
    email = email.trim();
    password = password.trim();


    if (username == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input field"
        });
    } 
     else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    } else if (password.length < 8) {
        res.json({

            status: "Failed",
            message: "password is too short"
        })
    } else {
        //checking if user already exists
        user.find({ username }).then(result => {
            if (result.length) {
                //user exists
                res.json({
                    status: "FAILED",
                    message: "User exists"
                })
            } else {
                //try to create a new user

                //password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new user({
                        username,
                        email,
                        password: hashedPassword
                    });
                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result
                        })
                    })
                        .catch(err => {
                            res.json({

                                status: "FAILED",
                                message: "An error occured while saving user account "
                            })
                        })
                })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while hashing password"
                        })
                    })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }
})





//signin
router.post('/signin', (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    if (username == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credintals supplied"
        })
    } else {
        user.find({ username })
            .then(data => {
                if (data.length) {
                    //user exists
                    const hashedPassword = data[0].password
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if (result) {
                            //pass match
                            res.json({
                                status: "SUCCESS",
                                message: "Signin successful",
                                data: data
                            })
                        } else {
                            res.json({
                                status: "FAILED",
                                message: "Wrong password entered"
                            })
                        }
                    })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while comparing password"
                            })
                        })
                } else {
                    res.json({
                        status: "FAILED",
                        message: "invalid credintals entered"
                    })
                }
            }).catch(err => {
                res.json({
                    status: "FAILED",
                    message: "An error occured while checking for password"
                })
            })
    }
})



router.post('/forget_password', (req, res) => {
    let { email } = req.body;
    email = email.trim();
    // const userData=await user.findOne({email:email})
    // console.log(userData.length);

    try {
        user.find({ email })
            .then(data => {
                if (data.length) {
                    const randomString = randomstring.generate()
                    user.updateOne({ email: email }, { $set: { token: randomString } })
                        .then(result => {
                            // console.log(data[0].email)
                            sendResetPasswordMail(data[0].username, data[0].email, randomString);
                            res.json({
                                status: "SUCCESS",
                                message: "mail sent"
                            })
                        })

                } else {
                    res.status(404).send({ success: true, msg: "user not found" })
                }
            })
    } catch (error) {
        res.json({
            status: "FAILED",
            message: "An error occured while forgetting for password"
        })
    }



})




router.get('/reset_password', (req, res) => {
    let { password } = req.body;
    let token=req.query.token;
    password = password.trim();

    try {
        user.find({ token })
            .then(data => {
                if (data.length) {
                    const saltRounds = 10;
                    
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    // console.log(data[0]._id)
                    user.findByIdAndUpdate({_id:data[0]._id},{$set:{password:hashedPassword,token:''}},{new:true})       //new:true se ye hoga ki phle ye phle wala return karta data but ab updated karega return
                    .then(result=>{
                        res.json({
                            status: "SUCCESS",
                            message: "Password Reset",
                            // data:result
                        })
                    })
                    .catch(err=>{
                        res.json({
                            status: "FAILED",
                            message: "An error occured while finding by id and updating password"
                        })
                    })
                })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while hashing password"
                        })
                    })
                    



                } else {
                    res.status(404).send({ success: true, msg: "link expired" })
                }
            })
    } catch (error) {
        res.json({
            status: "FAILED",
            message: "An error occured while updating for password"
        })
    }



})

module.exports = router