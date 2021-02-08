const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require('passport');
const moment = require('moment-timezone'); 
const Filter = require("bad-words");
const filter = new Filter();
const nodemailer = require('nodemailer');
require('dotenv').config();
const crypto = require('crypto');
const randomanime = require('random-anime');
const webPush = require("web-push");
const secure = require('express-force-https');
const publicVapidKey = process.env.PUBLICVAPIDKEY;
const privateVapidKey = process.env.PRIVATEVAPIDKEY;
webPush.setVapidDetails("mailto:kamlesh@gmail.com",publicVapidKey,privateVapidKey);
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine","ejs")
var maxAge = null;
app.use(secure);
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
    maxAge:maxAge
    }
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.DBURL,{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useCreateIndex",true)
const chatsSchema = mongoose.Schema({
    message:String,
    from:String,
    to:String,
    time:String,
    seen:Boolean,
    type:String,
    name:String
});

const usersSchema = mongoose.Schema({
    name:String,
    password:String
}); 

const preferencesSchema = mongoose.Schema({
    username:String,
    notifications:Boolean,
    filter:Boolean,
    primaryColor:String,
    secondryColor:String,
    pfp:String,
    email:String
});

const resetPasswordSchema = mongoose.Schema({
    username:"String",
    recovery_token:"String",
    expire_at: {type: Date, default: Date.now, expires: 60*60*24} 
});

usersSchema.plugin(passportLocalMongoose);

const Chat = mongoose.model("chat",chatsSchema);
const User = mongoose.model("user",usersSchema);
const Preference = mongoose.model("preference",preferencesSchema);
const ResetPassword = mongoose.model("resetPassword",resetPasswordSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//dont change anything above this
var usersOnline = [];
var pushSubscriptionIds = {};
var offlineTimeout = {};
var peerIDs = {};

//socket.io
io.on("connection",socket => {
    //client wants to join a room
    socket.on("join",data => {
    socket.join(data.roomName);
    });

    socket.on("load dynamic",data=>{
        Chat.find({from: { $in: [data.from,data.to]} ,to: { $in : [data.from,data.to]}},{message:1,from:1,time:1,seen:1,type:1,name:1},{sort:{_id:-1},limit:30},function(err,fetchedMessages){
            socket.emit("dynamically loaded",fetchedMessages);
        });
    });

    //new message in some room
    socket.on("new", message => {
    Preference.find({username: {$in:[message.from,message.to]}},{_id:0,filter:1},function(err,fetchedFilterSettings){
        fetchedFilterSettings.forEach(function(setting){
            if(setting.filter){
                var regExp = /[a-zA-Z]/g; 
                if(regExp.test(message.msg)){
                    message.msg = filter.clean(message.msg);
                }
            }
            });
            var chat = new Chat({
                message:message.msg,
                from:message.from,
                to:message.to,
                time: moment().tz("Asia/Kolkata").format("h:mm a"),
                seen:false,
                type:message.type,
                name:message.name
            });
            chat.save();
            io.sockets.in(message.roomName).emit("new",chat);
            if( pushSubscriptionIds[message.to] != null ){
                Preference.findOne({username:message.from},{_id:0,pfp:1},function(err,fetchedPfp){
                    var notificationData = JSON.stringify({title:message.msg,from:message.from,pfp:fetchedPfp.pfp});
                    webPush.sendNotification(pushSubscriptionIds[message.to],notificationData).catch(err => console.log(err));
                });
            }
            });
        });

    //delete a message
    socket.on("delete", data => {
    Chat.deleteOne({_id:data.id},function(err){});
    io.sockets.in(data.roomName).emit("delete",data.id)
    });

    //typing
    socket.on("typing",data=>{
        socket.to(data.roomName).emit("typing",data.typing);
    });

    //client sending a request to mark everthing as seen
    socket.on("seeneverything",data=>{
        markAsSeen(data.to,data.from);
        io.sockets.in(data.roomName).emit("otherusersaweverything",data.to);
    });

    socket.on("getPreferences",data =>{
        Preference.findOne({username:data.username},{_id:0,notifications:1,filter:1,primaryColor:1,secondryColor:1,pfp:1,email:1},function(err,fetchedPreferences){
            socket.emit("userPreferences",fetchedPreferences);
        });
    });

    //user is setting preferences
    socket.on("setPreferences",async function(data){
        if(data.key!="email"){
            Preference.updateOne({username:data.username},{$set:{[data.key]:data.value}},function(err,res){ });
        }else{
            if(await Preference.exists({email:data.value})){
                socket.emit("change email response",false);
            }else{
                Preference.updateOne({username:data.username},{$set:{[data.key]:data.value}},function(err,res){ });
                socket.emit("change email response",true);
            }
        }
    });

    socket.on("call",(data)=>{
        console.log(data);
        console.log(pushSubscriptionIds[data.to])
        if(pushSubscriptionIds[data.to]!=null){
            console.log("sending call notification");
            var notificationData = JSON.stringify({title:"calling",from:data.from,pfp:"https://cdn2.iconfinder.com/data/icons/font-awesome/1792/phone-square-512.png"});
            webPush.sendNotification(pushSubscriptionIds[data.to],notificationData).catch(err => console.log(err));
        }
    });

    socket.on('newUser',function(data) {
        socket.username = data.username;
        peerIDs[data.username]=data.peerid;
        if(offlineTimeout[data.username]!=null){
            clearTimeout(offlineTimeout[data.username]);
            offlineTimeout[data.username]=null;
        }else{
            usersOnline.push(data.username);
            socket.broadcast.emit("online",{username:data.username,peerid:data.peerid});
        }
   });

   socket.on('disconnect', function () {
    var index = usersOnline.indexOf(socket.username);
    peerIDs[socket.username]=null;
    offlineTimeout[socket.username] = setTimeout(() => {
        usersOnline.splice(index,1);
        socket.broadcast.emit("offline",socket.username);
        offlineTimeout[socket.username]=null;
    },5000);
  });

  socket.on("getOnline",data=>{
    socket.emit("startingOnline",usersOnline);
  });

  socket.on("hangup",data=>{
      io.sockets.in(data.roomName).emit("hangup");
  });

  socket.on("load more messages",data=>{
      Chat.find({from: { $in: [data.username ,data.to]} ,to: { $in : [data.username, data.to ]}},{message:1,from:1,time:1,seen:1,type:1,name:1},{sort:{_id:-1},limit:50,skip:data.skip},function(err,fetchedMessages){
        socket.emit("loaded more messages",fetchedMessages);
      });
  });

});

//mark all messages to a particular user as seen
function markAsSeen(to,from){
    Chat.updateMany({from:from,to:to},{$set:{seen:true}},function(err,res){})
}

//home page
app.get("/",async function(req,res){
    if(req.isAuthenticated()){
    var username  = req.session.passport.user; 
    var pfps = []; 

    await Preference.find({},{_id:0,username:1,pfp:1},function(err,fetchedPfps){
        pfps = fetchedPfps;
    });

    await User.find({},{_id:0,username:1}, async function(err,fetchedUsers){
            var users = [];
            fetchedUsers.forEach(function(user){
                var temp = {
                    username:user.username,
                    unseen:0,
                    pfp:null
                }
                users.push(temp);
            });

            pfps.forEach(function(userPfp){
                users.forEach(function(user) {
                    if(user.username==userPfp.username){
                        user.pfp = userPfp.pfp;
                    }
                });
            });
            
        await Chat.find({to:username,seen:false},{_id:0,from:1},function(err,noofunseen){
                noofunseen.forEach(function(msg){
                    users.forEach(function(element){
                        if(element.username==msg.from){
                            element.unseen++;
                        }
                    })
                });
            Preference.findOne({username:username},{_id:0,primaryColor:1,secondryColor:1,pfp:1,email:1},function(err,preFetchedPreferences){
                res.render("home",{username:username,users:users,primaryColor:preFetchedPreferences.primaryColor,secondryColor:preFetchedPreferences.secondryColor,pfp:preFetchedPreferences.pfp,email:preFetchedPreferences.email});
            });
        });
    });
   }else{
    res.redirect("/signin")
    }
});


//register new user
app.get("/signup",function(req,res){
        res.render("signup",{failureMessage:""});
});

app.post("/signup",function(req,res){
    User.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            res.render("signup",{failureMessage:"a user with the given username already exists"});
        }else{        
            const anime = randomanime.anime();
            var setPreferences = new Preference({
                username: req.body.username,
                notifications: false,
                filter:false,
                primaryColor:"#c4e8ed",
                secondryColor:"#e6a7a7",
                pfp:anime,
                email:null,
            });
            setPreferences.save();
            passport.authenticate("local")(req,res,function(err, result){
                io.emit("newUser",{username:req.body.username,pfp:anime});
                res.redirect("/");
            });
        }
    });
});


//login user
app.get("/signin",function(req,res){
    res.render("signin",{failureMessage:""});
});

app.post("/signin",function(req,res){
    var redirectTo = req.session.current_url ? req.session.current_url : "/";

    var rememberMe = req.body.rememberMe;
    if(rememberMe=="on"){
        // 1000*60*60*24*30*3 = 3 months
        req.session.cookie.maxAge = 1000*60*60*24*30*3;
    }else{
        req.session.cookie.maxAge = null;
    }
    var user = new User({
        username:req.body.username,
        password:req.body.password
    });
     req.login(user,function(err){
        passport.authenticate("local",{failureRedirect:"/signinERR"})(req,res,function(){
            res.redirect(redirectTo);
        });
    });
});


//logout
app.get("/logout",function(req,res){
    req.session.cookie.maxAge=0;
    req.logout();
    res.redirect("/");
});


//personal chats
app.get("/chats/:to",async function(req,res){
    var to = req.params.to;
    if(req.isAuthenticated()){
        User.findOne({username:to},function(err,response){
            if(response!=null){
        var username = req.session.passport.user; 
        if(username!=to){            
            var pfps = []; 
            Preference.find({},{_id:0,username:1,pfp:1},function(err,fetchedPfps){
                pfps = fetchedPfps;
            });

            Chat.find({from: { $in: [username ,to]} ,to: { $in : [username, to ]}},{message:1,from:1,time:1,seen:1,type:1,name:1},{sort:{_id:-1},limit:30},function(err,fetchedMessages){
                Chat.find({to:username,seen:false},{_id:0,from:1},function(err,fetchedMessagesUnseen){
                    //after fetching messages fetch users
                    User.find({},{_id:0,username:1},async function(err,fetchedUsers){
                        var users = [];
                        var toPfp = null;
                            fetchedUsers.forEach(function(user){
                            var temp = {
                                username:user.username,
                                unseen:0,
                                pfp:null
                            }
                            users.push(temp);
                        });

                        pfps.forEach(function(userPfp){
                            users.forEach(function(user) {
                                if(user.username==userPfp.username){
                                    user.pfp = userPfp.pfp;
                                }
                            });
                        });

                        fetchedMessagesUnseen.forEach(function(message){
                            users.forEach(function(user){
                                if(message.from==user.username && !message.seen){
                                    user.unseen++
                                }
                            });
                        });
                        await Preference.findOne({username:to},{_id:0,pfp:1},function(err,fetchedImage){
                            toPfp = fetchedImage.pfp;      
                        });
                        Preference.findOne({username:username},{_id:0,primaryColor:1,secondryColor:1,pfp:1},function(err,preFetchedPreferences){
                            res.render("chats",{username:username,to:to,from:username,messages:fetchedMessages,users:users,primaryColor:preFetchedPreferences.primaryColor,secondryColor:preFetchedPreferences.secondryColor,toPfp:toPfp,peerid:peerIDs[to],pfp:preFetchedPreferences.pfp});      
                        });                  
                    }); 
                });
            });
        }else{
            res.send("<h1>u cannot message ur self yet</h1>");
            }
        }else{
            res.send("<h1>No user found with that username</h1>");
        }
    });
    }else{
        req.session.current_url = "/chats/"+to;
        res.redirect("/signin")
    }
});

app.get("/reset/:resetlink",function(req,res){
    var resetLink = req.params.resetlink;
    ResetPassword.findOne({recovery_token:resetLink},{_id:0,username:1},function(err,fetchedData){
        if(fetchedData){
            res.render("reset",{resetLink:resetLink,username:fetchedData.username});
        }else{
            res.sendStatus(401);;
        }
    });
});

app.post("/reset/:resetLink",function(req,res){
    var resetLink = req.params.resetLink;
    var newPassword = req.body.newPassword;
    ResetPassword.findOneAndDelete({recovery_token:resetLink},{_id:0,username:1},function(err,fetchedData){
        if(fetchedData){
            User.deleteOne({username: fetchedData.username},function (err, user) {
                if (err){
                    console.error(err);
                }else{
                    User.register({username: fetchedData.username},newPassword,function(err,user){
                        res.send("<h1>password sucessfully changed</h1> <br> <h3><a href='/'>back to sign in screen</a></h3>");
                    });
                }
              });
        }else{
            res.sendStatus(401);
        }
    });
});

app.get("/getresetlink",function(req,res){
    res.render("getresetlink");
});

app.post("/getresetlink",function(req,res){
    var email = req.body.email;
    Preference.findOne({email:email},{_id:0,username:1},function(err,fetchedShit){
        if(fetchedShit){
            var resetPasswordUsername = fetchedShit.username;
            crypto.randomBytes(64, (err, buf) => {
                var recovery_token = buf.toString("hex");
        
                ResetPassword.deleteOne({username:resetPasswordUsername},{},function(err,fetchedData) {
                    var saveRecoveryToken = new ResetPassword({
                        username:resetPasswordUsername,
                        recovery_token:recovery_token
                    });
            
                    saveRecoveryToken.save();
                });

                  var transporter = nodemailer.createTransport({
                    service:"gmail",
                    auth: {
                      user: process.env.USERNAME,
                      pass: process.env.PASSWORD
                    }
                  });
                
                  let mailOptions = {
                    from: process.env.USERNAME,
                    to: email,
                    subject: "Reset Password",
                    html: `Click <a href='https://intense-reef-95110.herokuapp.com/reset/${recovery_token}'>Here</a> To Reset Password`,
                  };
        
                  transporter.sendMail(mailOptions,function(err,info){
                      if(err){
                        res.send(err);
                      }else{
                        res.send("<h2>Check Your Email For Instructions on how to change your password <br> if you dont see it please check spam <br> The link will be valid for 24 hours </h2>");
                      }
                  });
            });
        }else{
            res.send("<h1>your email is not registered with us</h1>");
        }
    });
});

app.get("/signinERR",function(req,res){
    res.render("signin",{failureMessage:"Incorrect Username or Password"});
});

app.get("/deleteAccount",async function(req,res){
    if(req.session.passport){
        var username = req.session.passport.user; 
        console.log("Deleteing Preferences...");
        await Preference.deleteOne({username:username},function(err){});
        console.log("preferences Deleted");
        console.log("Deleteing Account...");
        await User.deleteOne({username:username},function(err){});
        console.log("Account Deleted...");
        res.sendStatus(200);
    }else{
        res.redirect("/");
    }
});

app.post("/subscribeForPushNotifications",(req,res)=>{
    res.sendStatus(201);
    const subscription = req.body.subscription;
    var username = req.body.username
    pushSubscriptionIds[username] = subscription;
});

app.get("/about",function(req,res){
    res.render("about");
});

//do not change
var server = http.listen(process.env.PORT || 3000, () => {
    console.log('server is running on port', server.address().port);
});

