var socket = io();
var username = document.getElementById("username").className;
const myPeer = new Peer();
var id;
var myId;
var videoGrid = document.getElementById("videoGrid");
var answerButton = document.getElementById("answer");
var ringtoneElement = document.createElement("audio");
ringtoneElement.src="/ringtone.mp3";
ringtoneElement.loop=true;
var hangupButton = document.getElementById("hangup");
var callButton = document.getElementById("call");
var notifications = false;

//which room to join
var from = document.getElementById("from").classList;
var to = document.getElementById("to").classList;

if(from>to){
var roomName = from+to;
socket.emit('join', {roomName:roomName});
}else{
var roomName = to+from;
socket.emit('join', {roomName:roomName});
}

//send peer id as soon as u connect
myPeer.on('open', id => {
    myId=id;
    socket.emit("peer id",{id:myId,roomName:roomName});
    socket.emit("get starting id",{roomName:roomName});
});

socket.on("get id",() => {
    socket.emit("peer id",{id:myId,roomName:roomName});
});

socket.on("peer id",data=>{
    id = data;
});

socket.on("hangup",()=>{
    hangupButton.style.display="none";
    answerButton.style.display="none";
    callButton.style.display="inline-block";
    ringtoneElement.pause();
    ringtoneElement.currentTime=0;
});

function call(){
    if(id!=null){
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
            ringtoneElement.play();
            callButton.style.display="none";
            hangupButton.style.display="inline-block";
            var myVideo = document.createElement("video");
            myVideo.srcObject=stream;
            myVideo.muted=true;
            myVideo.play();
            videoGrid.appendChild(myVideo);
            var call = myPeer.call(id,stream);
            var video = document.createElement('video');
            call.on('stream', userVideoStream => {
            ringtoneElement.pause();
            ringtoneElement.currentTime=0;
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata",function(){
                video.play();
            })
            videoGrid.appendChild(video);
            });
            socket.on("hangup",()=>{
                video.remove();
                myVideo.remove();
                call.close();
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            });
        }).catch(function(err){
            alert(err);
        });
    }else{
        alert("user not online");
    }
}

myPeer.on('call', call => {
    ringtoneElement.play();
    answerButton.style.display="inline-block";
    hangupButton.style.display="inline-block";
    callButton.style.display="none";
    answerButton.addEventListener("click",function(){
        answerButton.style.display="none";
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
        var myVideo = document.createElement("video");
        myVideo.srcObject=stream;
        myVideo.muted=true;
        myVideo.play();
        videoGrid.appendChild(myVideo);
        call.answer(stream);
        var video = document.createElement('video');
        call.on('stream', userVideoStream => {
            ringtoneElement.pause();
            ringtoneElement.currentTime=0;
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata",function(){
                video.play();
            })
            videoGrid.appendChild(video);
            });
            socket.on("hangup",()=>{
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
            video.remove();
            myVideo.remove();
            call.close();
        });
        }).catch(function(err){
            socket.emit("hangup",{roomName:roomName});
            alert(err);
        })
    });
});

function hangup(){
    socket.emit("hangup",{roomName:roomName});
}

//getting new messages in room
socket.on("new",function(message){

    socket.emit("seeneverything",{to:username,from:to,roomName:roomName});
    if(message.from==username){var id = "green"}else{var id = "blue"};
    if(message.type==null){
        message.message = message.message.replace("emoji","");
    var div = document.createElement("div");
    div.id= message._id;
    div.className=`${id} messagee unseen`
    if(message.from==username){
        div.innerHTML = `<span style="position:absolute;">${message.time}</span><div class="notSelectable"><img  class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div><h3>${message.message}</h3>`;
    }else{
        div.innerHTML = `<span style="position:absolute;">${message.time}</span><br><h3>${message.message}</h3>`;
    }
    document.getElementById("typing").before(div);
        }else if(message.type=="image"){
        var div = document.createElement("div");
        div.className="imageHolder"
        div.id=message._id;
        if(message.from==username){
        div.innerHTML=`<div class="fileName" id="${message.name}"></div><img class="image${id}"src="${message.message}"><div><div style="position: relative;right: 2vw;" class="notSelectable"><img class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div></div>`
        }else{
        div.innerHTML=`<img class="image${id}"src="${message.message}">`
        }
        document.getElementById("typing").before(div);
        }else{
            var div = document.createElement("div");
            div.id=message._id;
            if(message.from==username){
            div.innerHTML=`<div class="fileName" id="${message.name}"></div>
            <div style="width: 100%;display: flex;justify-content: center;margin-bottom: 30px;">
            <video class="video${id}" width="580" controls>
                <source src="${message.message}" type="video/mp4">
            </video>
            <div><div class="notSelectable"><img  class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div></div>
            </div>`
            }else{
            div.innerHTML=`<div style="width: 100%;display: flex;justify-content: center;margin-bottom: 30px;">
            <video class="video${id}" width="580" controls>
                <source src="${message.message}" type="video/mp4">
            </video>
            </div>`
            }
        
            document.getElementById("typing").before(div);
        }
        
        $(window).scrollTop(document.querySelector(".allMessages").scrollHeight);
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

socket.on("typing",data=>{
    if(data){
        document.getElementById("typing").classList.remove("hidee");
        document.getElementById("typing").classList.add("showw");
    }else{
        document.getElementById("typing").classList.remove("showw");
        document.getElementById("typing").classList.add("hidee");
    }
})

function deleteMessage(e){
    var id = e.classList.value;
    var fileName = $("#"+id+" .fileName").attr("id");
    if(fileName!=null){
    deleteFileFromFirebase(fileName);
    }
    socket.emit("delete",{id:id,roomName:roomName});
};


//getting a delete request
socket.on("delete",WhatToDelete =>{
    var parentt = document.querySelector(".allMessages");
    var childd = document.getElementById(WhatToDelete);
    parentt.removeChild(childd);
});


    // <--------send new data----------->
$(".send").on("click",function(){
    if(document.getElementById("msg").value){
        var msg = {
            msg:document.getElementById("msg").value,
            from:from[0],
            to:to[0],
            roomName:roomName
        }
        socket.emit("new",msg);
        document.getElementById("msg").value="";
    }
    typing();
});

// send message if user presses enter
document.addEventListener("keypress",function(e) {
    if(e.key=="Enter"){
    $(".send").click();
    }
});
    
    //when connected mark everything as seen
    socket.emit("seeneverything",{to:username,from:to,roomName:roomName});

    //other user saw everything
    socket.on("otherusersaweverything",data=>{
        if(data!=username){
        var unseen = document.querySelectorAll(".green.unseen");
            unseen.forEach(element => {
            
            element.classList.remove("unseen");
            element.classList.add("seen");

            var h1 = document.createElement("h1");
            h1.className="doubletick"
            h1.innerHTML='<img style="position:absolute;" src="https://img.icons8.com/plasticine/30/000000/double-tick.png"/>';

            element.appendChild(h1);
                
        });
    }
    });


    //send a new photo

    function newImage(downloadURL,fileName){
        var msg = {
            msg:downloadURL,
            from:from[0],
            to:to[0],
            roomName:roomName,
            type:"image",
            name:fileName
        }
        socket.emit("new",msg);
    }
    

    //send a new video
    function newVideo(downloadURL,fileName){
        var msg = {
            msg:downloadURL,
            from:from[0],
            to:to[0],
            roomName:roomName,
            type:"video",
            name:fileName
        }
        socket.emit("new",msg);
    }
    
    var notification;

        //a client just posted a message
        socket.on("pushNotification",data=>{
        if(data.to==username && data.from!=to[0]){
            if(notifications){
                if(notification!=null){
                    notification.close();
                }
                function notifyMe() {
                    if (Notification.permission == "granted"){
                        notification = new Notification(data.from,{body:data.msg,icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sAWynJ1P1_jrxSY5z5bZFUNRrsz3zsonYA&usqp=CAU"});
                        notification.onclick = function(event){
                            event.preventDefault();
                            window.location.href="http://localhost:3000/chats/"+data.from;
                        }
                    }
                    else if (Notification.permission == "default") {
                        Notification.requestPermission().then(function (permission) {
                        if (permission === "granted"){
                            notification = new Notification(data.from,{body:data.msg,icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sAWynJ1P1_jrxSY5z5bZFUNRrsz3zsonYA&usqp=CAU"});
                            notification.onclick = function(event){
                                event.preventDefault();
                                window.location.href="http://localhost:3000/chats/"+data.from;
                            }
                        }
                        });
                    }
                    }
        
                    notifyMe();
            }

        if(document.querySelector("."+data.from+" .notification")!=null){
            var innerhtml = parseInt(document.querySelector("."+data.from+" .notification").innerHTML) + 1;
            document.querySelector("."+data.from+" .notification").innerHTML=innerhtml;
        }else{
            var newmsg = document.createElement("h1");
            newmsg.className="notification";
            newmsg.innerHTML="1"
            document.querySelector("."+data.from).appendChild(newmsg);
        }
}
});

var settings_show = false;
var timeOut = null;

function showSettings(){
    document.getElementById("settings").style.display="flex";
    timeOut = setTimeout(() => {
        settings_show = true;
    }, 25);
}

$("body").on("click",function(){
    if(settings_show == true){
        document.getElementById("settings").style.display="none";
        settings_show = false;
        if(timeOut!=null){
            clearTimeout(timeOut);
        }
    }
});

socket.emit("getPreferences",{username:username});
socket.on("userPreferences",data=>{
  if(data.notifications){
    notifications = true;
  }
});

socket.emit("newUser", username);
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  data.forEach(function(user) {
    console.log(user);
    if(user == to){
     document.querySelector(".topBar h1").style.color="green";
    }else if(user != username){
     document.querySelector("."+user+" .bruhbruhbruh").style.color="green";
    }
  });
});

socket.on("online",userOnline=>{
    if(userOnline == to){
        document.querySelector(".topBar h1").style.color="green";
    }else if(userOnline!=username){
        document.querySelector("."+userOnline+" .bruhbruhbruh").style.color="green";
    }
});

socket.on("offline",userOffline=>{
    console.log(userOffline);
    if(userOffline == to){
        document.querySelector(".topBar h1").style.color="rgb(66, 184, 221)";
    }else if(userOffline!=username){
        document.querySelector("."+userOffline+" .bruhbruhbruh").style.color="rgb(66, 184, 221)";
    }
});

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
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

    removeAllChildNodes(document.getElementById("gifBox1"));
    removeAllChildNodes(document.getElementById("gifBox2"));

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
            document.getElementById("for_weird_arrow").style.display="none";
            document.getElementById("search_gif").value="";
            var shareableLink = gif.media[0].tinygif.url;
            newImage(shareableLink,shareableLink);
        });
        if(num%2!=0){
            document.getElementById("gifBox1").appendChild(img);
            num++;
        }else{
            document.getElementById("gifBox2").appendChild(img);
            num++;
        }
    });

    return;

}

function grab_data()
{

    var apikey = "LIVDSRZULELA";
    var lmt = 40;

    // test search term
    var search_term = document.getElementById("search_gif").value;

    // using default locale of en_US
    var search_url = "https://api.tenor.com/v1/search?q=" + search_term + "&key=" +
            apikey + "&limit=" + lmt;

    httpGetAsync(search_url,tenorCallback_search);

    // data will be loaded by each call's callback
    return;
}

document.getElementById("search_gif").addEventListener("input",function(){
    grab_data();
});

var body = document.querySelector(".allMessages");

document.querySelector("#gif-input").addEventListener("click",function(){

    if(document.getElementById("for_weird_arrow").style.display=="none"){
        document.getElementById("for_weird_arrow").style.display="flex";
        document.getElementById("search_gif").focus();
        grab_data();
        setTimeout(() => {
            body.addEventListener("click",function(){
                document.getElementById("for_weird_arrow").style.display="none";
                body.removeEventListener("click",function(){  
            });
        },500);
        });
    }
    else if(document.getElementById("for_weird_arrow").style.display=="flex"){
        document.getElementById("for_weird_arrow").style.display="none";
    }

});

function hide_gif(){
    document.getElementById("for_weird_arrow").style.display="none";
}

var canLoadMore = true;

function scrolled(){
    var scrollTop = $(window).scrollTop();
    scrollTop = Math.round(scrollTop);
    if(scrollTop<400 && canLoadMore){
        var skip = document.querySelectorAll(".messagee");
        skip = skip.length;
        console.log(skip);
        canLoadMore = false;
        socket.emit("load more messages",{username:username,to:to[0],skip:skip});
    }
}

socket.on("loaded more messages",data=>{
    var parent = document.querySelector(".allMessages");
    data.forEach(function(message){

        var div = document.createElement("div");
        if(message.from==username){var id = "green"}else{var id = "blue"};
        if(message.type==null){
        div.id= message._id;
        div.className=`${id} messagee unseen`
        if(message.from==username){
            div.innerHTML = `<span style="position:absolute;">${message.time}</span><div class="notSelectable"><img  class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div><h3>${message.message}</h3>`;
        }else{
            div.innerHTML = `<span style="position:absolute;">${message.time}</span><br><h3>${message.message}</h3>`;
        }
        }else if(message.type=="image"){
        div.className="imageHolder"
        div.id=message._id;
        if(message.from==username){
        div.innerHTML=`<div class="fileName" id="${message.name}"></div><img class="image${id}"src="${message.message}"><div><div style="position: relative;right: 2vw;" class="notSelectable"><img class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div></div>`
        }else{
        div.innerHTML=`<img class="image${id}"src="${message.message}">`
        }
        }else{
            div.id=message._id;
            if(message.from==username){
            div.innerHTML=`<div class="fileName" id="${message.name}"></div>
            <div style="width: 100%;display: flex;justify-content: center;margin-bottom: 30px;">
            <video class="video${id}" width="580" controls>
                <source src="${message.message}" type="video/mp4">
            </video>
            <div><div class="notSelectable"><img  class="${message._id}" onclick="deleteMessage(this)" src="https://img.icons8.com/material/24/000000/delete-trash.png"/></div></div>
            </div>`
            }else{
            div.innerHTML=`<div style="width: 100%;display: flex;justify-content: center;margin-bottom: 30px;">
            <video class="video${id}" width="580" controls>
                <source src="${message.message}" type="video/mp4">
            </video>
            </div>`
            }
        }
        parent.prepend(div);
    });
    canLoadMore=true;
});

document.querySelector('emoji-picker').addEventListener('emoji-click',function(event){
    console.log(event.detail);
    var msg = {
        msg:"emoji"+event.detail.unicode,
        from:from[0],
        to:to[0],
        roomName:roomName
    }
    socket.emit("new",msg);
});