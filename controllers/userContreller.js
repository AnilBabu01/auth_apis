const { json } = require("body-parser");
const Users = require("../models/users");
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

module.exports = {
  userList,
  createUser,
  userLogin,
};
