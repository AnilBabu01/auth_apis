const express = require('express');
const router = express.Router();
const userCtrl= require('../controllers/userContreller')
const { body} = require('express-validator');
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "anilbabu$oy";
const jwtauth =(req,res,next)=>{
    var token =req.headers.authorization;
    token =token.split(' ')[1]
    
    jwt.verify(token,JWT_SECRET,function(err,decoded){
        if(err)
        {
            res.send("invalid token")
        }
        else
        {
            next();
        }
    });
}
router.use(bodyParser.urlencoded({extended:false}))

router.get('/users',jwtauth,(userCtrl.userList))

router.post('/register',[
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
],(userCtrl.createUser))



router.post('/login',[
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
],(userCtrl.userLogin))
module.exports=router;