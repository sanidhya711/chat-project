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
                },750);
            }
    }
    if(touchendX >= touchstartX+65 && !isAnimationRuuning){
        isAnimationRuuning = true;
        users.classList.remove("users-swipe-right");
        users.classList.add("users-swipe-left");
        setTimeout(() => {
            isAnimationRuuning=false;
        },750);
    }
}

var doodleHolder = document.querySelector(".messages");
var noOfDoodles = 6;
var randomDoodle = Math.floor(Math.random() * noOfDoodles)+1;
doodleHolder.style.backgroundImage = "url(/doodles/doodle"+randomDoodle+".jpg)";

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
    }else if(message.type=="audio"){
        div.classList.add("audio");
        div.innerHTML=`<audio class="audio-${colorClass}" controls src="${message.message}"></audio>`
    }else{
        div.classList.add("video");
        div.innerHTML=`<video class="media-${colorClass}" controls src="${message.message}"></video>`;
    }
    document.querySelector(".messages").appendChild(div);
    scrollToBottom();
});

function scrollToBottom(){
    document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
}

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
        var div = document.createElement("div");
        div.classList.add("typing-box");
        div.classList.add("message");
        div.classList.add("from-other-user");
        div.innerHTML=`${to} is typing<div class="dot-flashing"></div>`;
        document.querySelector(".messages").appendChild(div);
        scrollToBottom();
    }else{
        if(!!document.querySelector(".typing-box")){
            document.querySelector(".messages").removeChild(document.querySelector(".typing-box"));
        }
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
scrollToBottom();
    
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
document.querySelector(".messages").addEventListener("scroll",scrolled);

function scrolled(){
    console.log("scrolled");
    var scrollTop = document.querySelector(".messages").scrollTop;
    scrollTop = Math.round(scrollTop);
    if(scrollTop<500 && canLoadMore){
        var skip = document.querySelectorAll(".message");
        skip = skip.length;
        canLoadMore = false;
        socket.emit("load more messages",{username:username,to:to,skip:skip});
    }
}


socket.on("loaded more messages",data=>{
    if(data[0]){
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
            }else if(message.type=="audio"){
                div.classList.add("audio");
                div.innerHTML=`<audio class="audio-${colorClass}" controls src="${message.message}"></audio>`
            }else{
                div.classList.add("video");
                div.innerHTML=`<video class="media-${colorClass}" controls src="${message.message}"></video>`;
            }
            document.querySelector(".messages").prepend(div);
        });
        canLoadMore=true;
    }else{
        document.querySelector(".messages").removeEventListener("scroll",scrolled);
    }
});

//who is online
socket.emit("newUser", username);
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  data.forEach(function(user) {
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
        if(typingvar>0){
            socket.emit("typing",{roomName:roomName,typing:true});
        }
    }else if(userOnline!=username){
        document.querySelector("."+userOnline+" h4").style.color="#5cb85c";
    }
});

socket.on("offline",userOffline=>{
    if(userOffline == to){
        document.querySelector(".top-bar h3").style.color="inherit";
        if(!!document.querySelector(".typing-box")){
            document.querySelector(".messages").removeChild(document.querySelector(".typing-box"));
        }
    }else if(userOffline!=username){
        document.querySelector("."+userOffline+" h4").style.color="inherit";
    }
});

//file upload
var uploadButton = document.querySelector(".fa-plus");
var fileUpload = document.querySelector(".fileUpload");
uploadButton.addEventListener("click",function(){
    fileUpload.click();
});

fileUpload.addEventListener("change",function(e){
    var file = e.target.files[0];
    if(file!=null){
        newFileUpload(file);
    }
});

function newFileUpload(file){
    var type = isImage(file.name) ? "image" : isVideo(file.name) ? "video" : isAudio(file.name) ? "audio" : "invalid"; 
    if(type!="invalid"){
        var progress_bar = document.createElement("div");
        progress_bar.classList.add("meter");
        progress_bar.classList.add("animate");
        progress_bar.classList.add("message");
        progress_bar.innerHTML="<span style='width: 0%'><span></span></span>";
        document.querySelector(".messages").appendChild(progress_bar);
        scrollToBottom();
        var storageRef = firebase.storage().ref("/files/"+username+"/"+to+"/"+file.name);
        var uploadTask = storageRef.put(file);
        window.onbeforeunload = function(){
            return 'if you leave now file might not be uploaded';
        };
        uploadTask.on('state_changed', function(snapshot){
            var progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            progress_bar.children[0].style.width=progress+"%";
            },function(error){
                console.log("error occured while upload the file to firebase");
            },
            function(){
                progress_bar.remove();
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
                newFile(downloadURL,file.name,type);
                window.onbeforeunload = function(){};
            });
        });
    }else{
        alert("please select a valid file type");
    }
}

function newFile(downloadURL,fileName,type){
    var msg = {
        msg:downloadURL,
        from:from,
        to:to,
        roomName:roomName,
        type:type,
        name:fileName
    }
    socket.emit("new",msg);
}

function getExtension(filename){
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png':
        return true;
    }
    return false;
}
  
function isVideo(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'm4v':
      case 'avi':
      case 'mpg':
      case 'mp4':
        return true;
    }
    return false;
}

function isAudio(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'mp3':
      case 'wav':
      case 'm4a':
      case 'flac':
      case 'aac' :
        return true;
    }
    return false;
}

// delete file from firebase
function deleteFileFromFirebase(fileName){
    if(!fileName.includes("tenor")){
        var deleteref = firebase.storage().ref("/files/"+username+"/"+to+"/"+fileName)
        deleteref.delete().then(function(){
        console.log("file successfully deleted from firebase");
        }).catch(function(error) {
            console.log(error);
        });
    }
}

//clicke on show smoji button
// document.querySelector(".fa-smile-o").addEventListener("click",function(){
//     document.querySelector("emoji-picker").style.display="inline-block";
// });


//send emoji
document.querySelector('emoji-picker').addEventListener('emoji-click',function(event){
    var value = document.querySelector("#msg").value;
    value = value+event.detail.unicode;
    document.querySelector("#msg").value=value;
    document.addEventListener('click',function(e) {
        document.querySelector("emoji-picker").style.display="none";
    });
});

//click on gif button
// document.querySelector("svg").addEventListener("click",function(e){
//     e.stopPropagation();
//     document.querySelector(".gif-holder").style.display="flex";   
// });

function httpGetAsync(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
    return;
}

function tenorCallback_search(responsetext){
    var response_objects = JSON.parse(responsetext);
    top_10_gifs = response_objects["results"];
    removeAllChildNodes(document.getElementById("gif-box1"));
    removeAllChildNodes(document.getElementById("gif-box2"));
    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }
    var num=1;

    top_10_gifs.forEach(function(gif){
        var url = gif.media[0].nanogif.url;
        var img = document.createElement("img");
        img.src = url;
        img.className="gif";
        img.addEventListener("click",function(){
            document.querySelector(".search_gif").value="";
            var shareableLink = gif.media[0].tinygif.url;
            newFile(shareableLink,shareableLink,"image");
        });
        if(num%2!=0){
            document.getElementById("gif-box1").appendChild(img);
            num++;
        }else{
            document.getElementById("gif-box2").appendChild(img);
            num++;
        }
    });
    return;
}

function grab_data(){
    var apikey = "LIVDSRZULELA";
    var lmt = 10;
    var search_term = document.querySelector(".search_gif").value;
    var search_url = "https://api.tenor.com/v1/search?q="+search_term + "&key="+apikey + "&limit=" + lmt;
    httpGetAsync(search_url,tenorCallback_search);
    return;
}

document.querySelector(".search_gif").addEventListener("input",function(){
    grab_data();
});

document.querySelector("body").addEventListener("load",function(){
    scrollToBottom();
});

socket.on("newUser",data=>{
    var element = document.createElement("a");
    element.classList.add("user");
    element.classList.add(data.username);
    element.href="/chats/"+data.username;
    element.innerHTML=`<img class="pfp" src="${data.pfp}"><h4>${data.username}</h4>`;
    document.querySelector(".users").appendChild(element);
});


function dropHandler(ev) {
    ev.preventDefault();

    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        var file =   ev.dataTransfer.items[i].getAsFile();
        console.log(file);
        newFileUpload(file);
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}

window.onload = function(){
    scrollToBottom();
  };






























