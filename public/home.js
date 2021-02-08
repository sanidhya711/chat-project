var socket = io();
const myPeer = new Peer();
var username = document.getElementById("username").className;

myPeer.on('open', id => {
  socket.emit("newUser",{username:username,peerid:id});
});


//people online
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  data.forEach(function(user) {
    console.log(user);
    if(user != username){
     document.querySelector("."+user+" h5").style.color="#5cb85c";
    }
  });
});

socket.on("online",data=>{
  var userOnline=data.username;
  if(userOnline!=username){
    document.querySelector("."+userOnline+" h5").style.color="#5cb85c";
  }
});

socket.on("offline",userOffline=>{
  if(userOffline!=username){
    document.querySelector("."+userOffline+" h4").style.color="inherit";
  }
});