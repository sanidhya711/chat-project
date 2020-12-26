var element = document.querySelector(".main");
var input_holder = document.querySelector(".input-bar-holder");
var width = element.offsetWidth-10;
input_holder.style.width=width+"px";

window.addEventListener("resize",function(){
    width = element.offsetWidth-10;
    input_holder.style.width=width+"px";
});

let touchstartX = 0;
let touchendX = 0;

document.querySelector("body").addEventListener('touchstart', function(event){
    touchstartX = event.changedTouches[0].screenX;
},false);

document.querySelector("body").addEventListener('touchend',function(event){
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
},false); 

var users = document.querySelector(".users");
var isAnimationRuuning = false;

function handleGesture() {
    if (touchendX+65 <= touchstartX && !isAnimationRuuning){
            if(users.classList.contains("users-swipe-left")){
                isAnimationRuuning = true;
                users.classList.remove("users-swipe-left");
                users.classList.add("users-swipe-right");
                setTimeout(() => {
                    isAnimationRuuning=false;
                },700);
            }
    }
    if(touchendX >= touchstartX+65 && !isAnimationRuuning){
        isAnimationRuuning = true;
        users.classList.remove("users-swipe-right");
        users.classList.add("users-swipe-left");
        setTimeout(() => {
            isAnimationRuuning=false;
        },700);
    }
}

var doodleHolder = document.querySelector(".messages");
var noOfDoodles = 6;
var randomDoodle = Math.floor(Math.random() * noOfDoodles)+1;
doodleHolder.style.backgroundImage = "url(/chat-page-new-design/doodles/doodle"+randomDoodle+".jpg)";
















































var socket = io();

var username = document.getElementById("username").className;
var from = username;
var to = document.getElementById("to").className;

if(from>to){
    var roomName = from+to;
    socket.emit('join', {roomName:roomName});
}else{
    var roomName = to+from;
    socket.emit('join', {roomName:roomName});
}

//getting new messages in room
socket.on("new",function(message){
    socket.emit("seeneverything",{to:username,from:to,roomName:roomName});
    var div = document.createElement("div");
    div.classList.add("message");
    if(message.from==username){var colorClass = "from-self"}else{var colorClass = "from-other-user"} 
    if(message.type==null){
        div.classList.add(colorClass);
        div.innerHTML=`${message.message}`;
    }else if(message.type=="image"){
        div.classList.add("image");
        div.innerHTML=`<img class="media-${colorClass}" src="${message.message}">`;
    }else{
        div.classList.add("video");
        div.innerHTML=`<video class="media-${colorClass}" controls src="${message.message}"></video>`;
    }
    document.querySelector(".messages").appendChild(div);
    document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
});

//emit when typing
var typingvar = 0;
function typing(){
    if(document.getElementById("msg").value){
        typingvar++;
        if(typingvar==1){
            socket.emit("typing",{roomName:roomName,typing:true});
        }
    }else{
        typingvar=0;
        socket.emit("typing",{roomName:roomName,typing:false});
    }
}

//other user is typing
socket.on("typing",data=>{
    if(data){
        console.log("show typing bar");
        var div = document.createElement("div");
        div.classList.add("typing-box");
        div.classList.add("message");
        div.classList.add("from-other-user");
        div.innerHTML=`${to} is typing<div class="dot-flashing"></div>`;
        document.querySelector(".messages").appendChild(div);
        document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
    }else{
        document.querySelector(".messages").removeChild(document.querySelector(".typing-box"));
    }
})

//send new data
document.querySelector(".send-holder").addEventListener("click",function(){
    if(document.getElementById("msg").value){
        var msg = {
            msg:document.getElementById("msg").value,
            from:from,
            to:to,
            roomName:roomName
        }
        socket.emit("new",msg);
        document.getElementById("msg").value="";
    }
    typing();
});

//getting a delete request
socket.on("delete",WhatToDelete =>{
    var parentt = document.querySelector(".messages");
    var childd = document.getElementById(WhatToDelete);
    parentt.removeChild(childd);
});

// send message if user presses enter
document.addEventListener("keypress",function(e) {
    if(e.key=="Enter"){
    document.querySelector(".send-holder").click();
    }
});

//scroll all the way down on load
document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
    
//when connected mark everything as seen
socket.emit("seeneverything",{to:username,from:to,roomName:roomName});

//search for user
document.querySelector(".search-user").addEventListener("input",function(){
    var query = document.querySelector(".search-user").value;
    query = query.toLowerCase();
  
    if(query.charAt(query.length-1)==" "){
     document.querySelector("#searchUsers").value = query.slice(0, -1); 
    }else {
      var namesToShow = [];
      var allUserNames = document.querySelectorAll(".user h4");
      allUserNames.forEach(function(element){
        var username = element.innerText;
        username = username.toLowerCase();
        if(username.includes(query)){
          namesToShow.push(username);
        }
      });
    
      if(namesToShow.length==0){
        if(document.querySelector(".no-users-found")==null){
        var h4 = document.createElement("h4");
        h4.classList.add("no-users-found");
        h4.innerText="no users found :(";
        document.querySelector(".users").appendChild(h4);
        }
      }else{
        if(document.querySelector(".no-users-found")!=null){
          document.querySelector(".users").removeChild(document.querySelector(".no-users-found"));
        }
      }
  
        var containers = document.querySelectorAll(".user");
        containers.forEach(function(element){
          var whosContainer = element.getAttribute("href");
          whosContainer = whosContainer.replace("/chats/","")
          if(!namesToShow.includes(whosContainer)){
           element.style.display="none";
          }else{
            element.style.display="flex"
            var text = whosContainer;
            var queryStarts = text.indexOf(query);
            var queryEnds = queryStarts+query.length;
            var part1 = text.slice(0,queryStarts);
            var part2 = text.slice(queryEnds,text.length);
            var highlight = "<span style='color:#bfe970;'>"+query+"</span>";
            element.children[1].innerHTML=part1+highlight+part2
          }
        });
    }
});


var canLoadMore = true;
//load more messages when user scrolls up
function scrolled(){
    var scrollTop = document.querySelector(".messages").scrollTop;
    scrollTop = Math.round(scrollTop);
    if(scrollTop<400 && canLoadMore){
        var skip = document.querySelectorAll(".message");
        skip = skip.length;
        console.log(skip);
        canLoadMore = false;
        socket.emit("load more messages",{username:username,to:to,skip:skip});
    }
}

socket.on("loaded more messages",data=>{
    console.log(data);
    data.forEach(function(message){
        var div = document.createElement("div");
        div.classList.add("message");
        if(message.from==username){var colorClass = "from-self"}else{var colorClass = "from-other-user"} 
        if(message.type==null){
            div.classList.add(colorClass);
            div.innerHTML=`${message.message}`;
        }else if(message.type=="image"){
            div.classList.add("image");
            div.innerHTML=`<img class="media-${colorClass}" src="${message.message}">`;
        }else{
            div.classList.add("video");
            div.innerHTML=`<video class="media-${colorClass}" controls src="${message.message}"></video>`;
        }
        document.querySelector(".messages").prepend(div);
    });
    canLoadMore=true;
});

//who is online
socket.emit("newUser", username);
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  data.forEach(function(user) {
    console.log(user);
    if(user == to){
     document.querySelector(".top-bar h3").style.color="#5cb85c";
    }else if(user != username){
     document.querySelector("."+user+" h4").style.color="#5cb85c";
    }
  });
});

socket.on("online",userOnline=>{
    if(userOnline == to){
        document.querySelector(".top-bar h3").style.color="#5cb85c";
    }else if(userOnline!=username){
        document.querySelector("."+userOnline+" h4").style.color="#5cb85c";
    }
});

socket.on("offline",userOffline=>{
    console.log(userOffline);
    if(userOffline == to){
        document.querySelector(".top-bar h3").style.color="inherit";
    }else if(userOffline!=username){
        document.querySelector("."+userOffline+" h4").style.color="inherit";
    }
});