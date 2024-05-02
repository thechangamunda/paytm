const express = require('express');

const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();
const authMiddleware = require("../middleware.js");
const{ User, Account } = require("../db.js");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


const signupSchema = zod.object({
    username: zod.string().email(),
    firstname: zod.string(),
    lastname: zod.string(),
    password: zod.string(),  
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})


router.post("/signup", async (req,res)=>{

    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            messsage: "Wrong Inputs"
        })
    }


    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,  
        lastname: req.body.lastname,
        password: req.body.password
    });


    const userId = user._id;
    const token = jwt.sign({userId}, JWT_SECRET);

    await Account.create({
        userId: userId,
        balance: Math.floor(1 + Math.random()*10000)
    
    })
    res.json({
        message: "User created successfully",
        token: token
    })
});

router.post("/signin", async (req,res)=>{

    const { success } = signinSchema.safeParse(req.body);

    if(!success){
        return res.status(411).json({message: "Incorrect Input!" + req.body})
    }

    const user =  await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })
        return;
    }
    
    res.status(411).json({message: "Error while logging in"});

});

router.put("/", authMiddleware, async (req, res)=>{
    const { success } = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne(req.body, {
        _id: req.userId
    })

    res.status(200).json({message: "Updated successfully"})
})

router.get("/bulk", authMiddleware, async (req,res)=>{
    const filter = req.query.filter || "";


    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": new RegExp(filter, "i"),
            }
        }, {
            lastname: {
                "$regex": new RegExp(filter, "i"),
            }
        }]
    })

    res.json({
        user: users.map(user=>({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            password: user.password,
            _id: user._id
        }))
    })
})

module.exports = router;