const { json } = require("body-parser");
const Users = require("../models/users");
const Otp = require("../models/Otp");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "anilbabu$oy";

const userList = async (req, res) => {
  let data = await Users.find();
  res.json(data);
};

const createUser = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    //validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: errors.array() });
    }
    //check in database that user is with email is allready present or not
    let user = await Users.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: "Sorry a user with this email already exists" });
    }
  //bcrypt password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);
    user = await Users.create({
      name: name,
      email: email,
      phone: phone,
      password: secPass,
    });

    const data = {
      user: {
        id: user.id,
      },
    };

    const authtoken = jwt.sign(data, JWT_SECRET);

    // res.json(user)
    //res.json({authtoken })

    res.send({ success: "Account created successfully", authtoken });
  } catch (error) {
    res.status(502).json({ success: "Internal server error" });
  }
};

const userLogin = async (req, res) => {

  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: errors.array() });
    }
  
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res
        .status(301)
        .json({ success: "Please try to login with correct credentials" });
    }
  
    let user = await Users.findOne({ email });
    console.log(user)
    if (user) {
      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }
  
    
    const data = {
      user: {
        id: user.id,
      },
    };
  
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken });
  } catch (error) {
    res.status(502).json({ success: "Internal server error" });
  }
 
};
const  emailsend = async (req,res)=>{
let {  email} = req.body;
    console.log(email)
 let user = await Users.findOne({ email });
    console.log(user)
     if (user) {
      if(user){
        let otpscode = Math.floor((Math.random()*10000)+1)
        let otpdata = new Otp({
             email:req.body.email,
             code:otpscode,
             expireIn: new Date().getTime()+200*1000
        })

        let responce = await otpdata.save()
        mamiler(req.body.email,otpscode)
        res.send("Please chack your mail")
    }
    }
       else
      {
        res.status(404).json({ success: "Email id is not exist" });
      }
}

const resetpassword = async(req,res)=>{
  let {  email,otpcode,cpassword} = req.body;
     let  data = await Otp.find({email:req.body.email,code:req.body.otpcode})
     if(data)
     {
      let curtime = new Date().getTime();
      let deff = data.expireIn - curtime;
      if(deff<0)
      {
        res.status(404).json({ success: "opt now exprire" });
      }else
      {
        let user = await Users.findOne({email})
        user.password=cpassword
        user.save()
        console.log(user)
        
      }
    }
   
  res.send("this change password")
}



const mamiler= async(email,otp)=>{
  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    port:587,
    auth: {
      user: 'anilbabu3245@gmail.com',
      pass: 'Anilb@123'
    }
  });
  
  var mailOptions = {
    from: 'anilbabu3245@gmail.com',
    to: 'anilb0175@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  userList,
  createUser,
  userLogin,
  emailsend,
  resetpassword,
};
