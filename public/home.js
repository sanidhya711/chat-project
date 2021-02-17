var touchstartX = 0;
var touchendX = 0;
var usersOnline = [];

document.querySelector("body").addEventListener('touchstart', function(event){
    touchstartX = event.changedTouches[0].screenX;
},false);

document.querySelector("body").addEventListener('touchend',function(event){
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
},false); 

var users = document.querySelector(".users");
var isAnimationRuuning = false;
var firstAnimation = true;

function handleGesture() {
    if (touchendX+65 <= touchstartX && !isAnimationRuuning){
        firstAnimation=false;
        isAnimationRuuning = true;
        users.classList.remove("users-swipe-left");
        users.classList.add("users-swipe-right");
        setTimeout(() => {
            isAnimationRuuning=false;
        },750);
    }
    if(touchendX >= touchstartX+65 && !isAnimationRuuning){
        if(users.classList.contains("users-swipe-right" || firstAnimation)){
            isAnimationRuuning = true;
            users.classList.remove("users-swipe-right");
            users.classList.add("users-swipe-left");
            setTimeout(() => {
                isAnimationRuuning=false;
            },750);
        }
    }
}

var socket = io();

var username = document.getElementById("username").className;
var from = username;
var to;
var roomName;

function join(){
    if(from>to){
        roomName = from+to;
        socket.emit('join', {roomName:roomName});
    }else{
        roomName = to+from;
        socket.emit('join', {roomName:roomName});
    }
}

function urlify(text){
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return `<a target="+blank" href="${url}">${url}</a>`;
    })
}

//getting new messages in room
socket.on("new",function(message){
    socket.emit("seeneverything",{to:username,from:to,roomName:roomName});
    var div = document.createElement("div");
    div.classList.add("message");
    if(message.from==username){var colorClass = "from-self"}else{var colorClass = "from-other-user"} 
    if(message.type==null){
        if(!message.message.includes("https://www.youtube.com")){
            div.classList.add(colorClass);
            var afterExtracting = message.message;
            afterExtracting = urlify(afterExtracting);
            div.innerHTML=`${afterExtracting}`;
        }else{
            function getId(url){
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11)
                  ? match[2]
                  : null;
            } 
            const videoId = getId(message.message);
            console.log(videoId);
            // div.innerHTML=`<iframe src="//www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
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
  if(document.querySelector(".messages")){
    document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
  }
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

//getting a delete request
socket.on("delete",WhatToDelete =>{
    var parentt = document.querySelector(".messages");
    var childd = document.getElementById(WhatToDelete);
    parentt.removeChild(childd);
});

// send message if user presses enter
document.addEventListener("keypress",function(e) {
    if(e.key=="Enter"){
        e.preventDefault();
        document.querySelector(".send-holder").click();
    }
});
    
//when connected mark everything as seen
socket.emit("seeneverything",{to:username,from:to});

//search for user
document.querySelector(".search-user").addEventListener("input",function(){
    var query = document.querySelector(".search-user").value;
    if(query!=null && query!="" && query!=" "){
        query.toLowerCase();
        var namesToShow = [];
        var allUserNames = document.querySelectorAll(".user h5");
        allUserNames.forEach(function(element){
            var username = element.innerText;
            username = username.toLowerCase();
            if(username.includes(query)){
                namesToShow.push(username);
            }
        });
        
        if(namesToShow.length==0){
            if(document.querySelector(".no-users-found")==null){
            var h5 = document.createElement("h5");
            h5.classList.add("no-users-found");
            h5.innerText="no users found :(";
            document.querySelector(".users-inner").appendChild(h5);
            }
        }else{
            if(document.querySelector(".no-users-found")!=null){
            document.querySelector(".users-inner").removeChild(document.querySelector(".no-users-found"));
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
    }else{
        var containers = document.querySelectorAll(".user");
        containers.forEach(function(element){
            var whosContainer = element.getAttribute("href");
            whosContainer = whosContainer.replace("/chats/","");
            element.children[1].innerText = whosContainer;
            element.style.display="flex";
        });
    }
});


var canLoadMore = true;

function scrolled(){
    var scrollTop = document.querySelector(".messages").scrollTop;
    scrollTop = Math.round(scrollTop);
    if(scrollTop<520 && canLoadMore){
        var skip = document.querySelectorAll(".message");
        skip = skip.length;
        canLoadMore = false;
        socket.emit("load more messages",{username:username,to:to,skip:skip});
    }
}


socket.on("loaded more messages",data=>{
    if(data[0]){
        appendMessages(data,false);
        canLoadMore=true;
    }
});

function appendMessages(data,addScrollToBottom){
    disableScrolling();
    data.forEach(function(message){
        var div = document.createElement("div");
        div.classList.add("message");
        if(message.from==username){var colorClass = "from-self"}else{var colorClass = "from-other-user"} 
        if(message.type==null){
            div.classList.add(colorClass);
            var afterExtracting = message.message;
            afterExtracting = urlify(afterExtracting);
            div.innerHTML=`${afterExtracting}`;    
        }else if(message.type=="image"){
            div.classList.add("image");
            if(addScrollToBottom){
                div.innerHTML=`<img class="media-${colorClass}" onload="scrollToBottom()" src="${message.message}">`;
            }else{
                div.innerHTML=`<img class="media-${colorClass}" src="${message.message}">`;
            }
        }else if(message.type=="audio"){
            div.classList.add("audio");
            if(addScrollToBottom){
                div.innerHTML=`<audio onload="scrollToBottom()" class="audio-${colorClass}" controls src="${message.message}"></audio>`
            }else{
                div.innerHTML=`<audio class="audio-${colorClass}" controls src="${message.message}"></audio>`
            }
        }else{
            div.classList.add("video");
            if(addScrollToBottom){
                div.innerHTML=`<video onload="scrollToBottom()"  class="media-${colorClass}" controls src="${message.message}"></video>`;
            }else{
                div.innerHTML=`<video class="media-${colorClass}" controls src="${message.message}"></video>`;
            }
        }
        document.querySelector(".messages").prepend(div);
    });
    enableScrolling();
}



//who is online
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  data.forEach(function(user){
      usersOnline.push(user);
    if(user == to){
     document.querySelector(".top-bar h3").style.color="#5cb85c";
    }else if(user != username){
     document.querySelector("."+user+" h5").style.color="#5cb85c";
    }
  });
});

socket.on("online",data=>{
    usersOnline.push(data);
    if(data == to){
        document.querySelector(".top-bar h3").style.color="#5cb85c";
        if(typingvar>0){
            socket.emit("typing",{roomName:roomName,typing:true});
        }
    }else if(data!=username){
        document.querySelector("."+data+" h5").style.color="#5cb85c";
    }
});

socket.on("offline",userOffline=>{
    var index = usersOnline.indexOf(userOffline);
    usersOnline.splice(index,1);
    if(userOffline == to){
        document.querySelector(".top-bar h3").style.color="inherit";
        if(!!document.querySelector(".typing-box")){
            document.querySelector(".messages").removeChild(document.querySelector(".typing-box"));
        }
    }else if(userOffline!=username){
        document.querySelector("."+userOffline+" h5").style.color="inherit";
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

socket.on("newUser",data=>{
    var element = document.createElement("a");
    element.classList.add("user");
    element.classList.add(data.username);
    element.href="/chats/"+data.username;
    element.innerHTML=`<img class="pfp" src="${data.pfp}"><h5>${data.username}</h5>`;
    document.querySelector(".users-inner").appendChild(element);
    element.onclick=function(){
        loadDynamic(element);
    };
});


function dropHandler(ev) {
    ev.preventDefault();

    if( ev.dataTransfer.items.length<=10){
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            var file =   ev.dataTransfer.items[i].getAsFile();
            newFileUpload(file);
        }
    }else{
        alert("bruhhh u cannot upload more than 10 files at a time");
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}

function auto_grow(element){
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
    if(element.offsetHeight>50){
        document.querySelector(".messages").style.marginBottom = (element.offsetHeight+27)+"px";
        var bruh = document.querySelectorAll(".message");
        bruh[bruh.length-1].style.marginBottom = "20px";
    }else{
        document.querySelector(".messages").style.marginBottom = "0px"; 
        var bruh = document.querySelectorAll(".message");
        bruh[bruh.length-1].removeAttribute('style');
    }
    scrollToBottom();
}

function loadDynamic(bruhh){
  if(document.querySelector(".main")){
    document.querySelector(".messages").innerHTML="";
    document.querySelector(".search-user").value="";
    document.querySelector(".search-user").dispatchEvent(new Event('input'));
    if(document.querySelector(".top-bar h3").innerText.length!=0){
        var pfpTo = document.querySelector(".top-bar img").src;
        var user = document.createElement("div");
        user.classList.add("user");
        user.classList.add(to);
        user.setAttribute("href","/chats/"+to);
        user.onclick=function(){loadDynamic(this)};
        user.innerHTML=`<img class="pfp" src="${pfpTo}"><h5>${to}</h5><div class="unseen"></div>`;
        document.querySelector(".users-inner").prepend(user);
        user.onclick=function(){
            loadDynamic(user);
        };
    }
    to = bruhh.classList[1];
    var pfpTo = bruhh.children[0].src;
    window.history.pushState('page2', 'Title', '/chats/'+to);
    socket.emit("load dynamic",{from:from,to:to});
    document.querySelector("."+to).remove();
    if(usersOnline.includes(to)){
        document.querySelector(".top-bar h3").style.color="#5cb85c";
    }else{
        document.querySelector(".top-bar h3").style.color="inherit";
    }
    document.querySelector(".top-bar h3").innerText=to;
    document.querySelector(".top-bar .pfp").src = pfpTo;
    document.querySelector(".gradient").classList.add("gradient-animation");
    document.querySelector("#msg").placeholder="Message "+to;
    users.classList.remove("users-swipe-left");
    users.classList.add("users-swipe-right");
    setTimeout(() => {
        document.querySelector(".gradient").classList.remove("gradient-animation");
    },2000);
  }
  join();
}

socket.on("dynamically loaded",data=>{
    canLoadMore = false;
    appendMessages(data,true);
    scrollToBottom();
    document.querySelector(".gradient").classList.remove("gradient-animation");
    canLoadMore = true;
    isAnimationRuuning=true;
    setTimeout(() => {
        isAnimationRuuning=false;
    },750);
    socket.emit("seeneverything",{to:username,from:to});
});

document.addEventListener( "contextmenu", function(e){
    e.preventDefault();
    if(e.target.nodeName=="IMG"){
        window.open(e.target.src);
    }
});

function disableScrolling(){
    var x = document.querySelector(".messages").scrollX;
    var y = document.querySelector(".messages").scrollY;
    document.querySelector(".messages").onscroll=function(){document.querySelector(".messages").scrollTo(x, y);};}

function enableScrolling(){
    document.querySelector(".messages").onscroll=function(){};
}

var cbox = document.querySelectorAll(".user");

for (let i = 0; i < cbox.length; i++) {
  cbox[i].addEventListener("click", function bruhh(e){
    showMessages(e.target);
  });
}

function showMessages(userClickedData){
  if(!document.querySelector(".main")){
  to = userClickedData.classList[1];
  document.querySelector(".settings").remove();
  var div = document.createElement("div");
  div.className = "main";
  div.innerHTML = `<div class="top-bar"><img class="pfp" src=""><h3></h3><i onclick="call()" id="call" class="fa fa-2x fa-phone-square"></i></div>
<div class="gradient"></div>
<div class="video-grid"></div>
<div class="messages"></div>
<div class="input-bar-holder"><i class="fa fa-plus" aria-hidden="true"></i><input type="file" hidden class="fileUpload"><textarea onkeypress="typing()" oninput="auto_grow(this)" id="msg" placeholder="Message" type="text"></textarea><div class="gif-emoji-button-holder">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"preserveAspectRatio="xMidYMid meet"><g id="gif-svg-change-fill-color" transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M2270 4705 c-242 -35 -462 -103 -668 -205 -654 -324 -1091 -938 -1187 -1664 -19 -150 -19 -402 0 -553 128 -987 903 -1753 1895 -1873 125 -15 402 -12 536 5 965 127 1725 883 1859 1850 22 159 22 431 0 590 -133 956 -874 1705 -1827 1845 -156 23 -469 26 -608 5z m569 -171 c659 -96 1221 -505 1512 -1099 339 -693 246 -1526 -238 -2125 -82 -102 -259 -272 -363 -349 -268 -199 -577 -326 -911 -375 -139 -21 -404 -21 -550 0 -719 100 -1330 587 -1593 1271 -40 102 -77 239 -101 370 -22 118 -31 422 -16 549 51 436 229 824 523 1138 315 338 715 549 1173 620 127 20 431 20 564 0z"/><path d="M1550 3205 c-225 -51 -414 -244 -482 -492 -31 -113 -31 -373 0 -486 48 -176 172 -343 307 -414 123 -64 190 -78 385 -78 148 1 188 4 260 23 85 22 227 84 281 123 l29 20 0 277 c0 152 -4 282 -8 288 -20 31 -55 34 -342 34 l-291 0 -24 -25 c-30 -30 -32 -64 -4 -99 l20 -26 240 0 239 0 0 -180 0 -180 -61 -31 c-132 -66 -322 -93 -467 -66 -112 22 -198 66 -265 136 -105 110 -149 240 -149 441 1 372 187 591 502 591 215 0 364 -97 421 -271 28 -85 51 -110 101 -110 44 0 88 35 88 70 0 37 -50 173 -82 222 -67 105 -183 188 -315 224 -82 23 -300 28 -383 9z"/><path d="M2631 3174 c-21 -26 -21 -34 -21 -706 l0 -679 25 -24 c33 -34 87 -34 120 0 l25 24 0 679 c0 672 0 680 -21 706 -16 21 -29 26 -64 26 -35 0 -48 -5 -64 -26z"/><path d="M3114 3178 c-12 -5 -27 -21 -33 -34 -16 -36 -16 -1323 0 -1358 22 -47 98 -56 142 -18 15 14 17 43 17 334 l0 318 399 0 c388 0 399 1 425 21 31 25 34 66 7 100 l-19 24 -406 3 -406 3 0 234 0 235 414 0 c403 0 414 1 440 21 33 26 36 79 6 109 -19 19 -33 20 -492 19 -304 0 -481 -4 -494 -11z"/></g></svg>
</div>
<div class="send-holder"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>
</div>
</div>`
var referenceNode = document.querySelector(".users");
referenceNode.parentNode.insertBefore(div,referenceNode.nextSibling);
var element = document.querySelector(".main");
var input_holder = document.querySelector(".input-bar-holder");
var width = element.offsetWidth-10;
input_holder.style.width=width+"px";
var doodleHolder = document.querySelector(".main");
var noOfDoodles = 4;
var randomDoodle = Math.floor(Math.random() * noOfDoodles)+1;
// doodleHolder.style.backgroundImage = "url(/doodles/doodle"+randomDoodle+".jpg)";
doodleHolder.style.backgroundImage = "url(/ooof.png)";

window.addEventListener("resize",function(){
    width = element.offsetWidth-10;
    input_holder.style.width=width+"px";
});

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
      auto_grow( document.getElementById("msg"));
  }
  typing();
});
//load more messages when user scrolls up
document.querySelector(".messages").addEventListener("scroll",scrolled);
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
document.querySelector("textarea").style.height="5px";
document.querySelector("textarea").style.height=(document.querySelector("textarea").scrollHeight)+"px";
loadDynamic(userClickedData);
}
}

socket.emit("newUser",{username:username});


function uploadPfp(inputEvent){
    var file = inputEvent.files[0];
    var fr = new FileReader();
    fr.onload = function () {
        document.querySelector(".settings .pfp").src = fr.result;
        document.querySelector(".user-self .pfp").src = fr.result;
    }
    fr.readAsDataURL(file);
    document.querySelector(".setPfpButton").innerText="confirm";
    document.querySelector(".setPfpButton").onclick = function(){
      confirmPfp(file);  
    }
}

function changepfpclicked(){
    document.getElementById("uploadpfp").click();
}

function confirmPfp(file){
    document.querySelector(".setPfpButton").innerText="uploading...";
    document.querySelector(".setPfpButton").onclick = function(){}
    var storageRef = firebase.storage().ref("/pfp/"+username+"/"+file.name);
    var uploadTask = storageRef.put(file)
    uploadTask.on('state_changed', function(snapshot){
        var progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes*100);
    },function(error){},
    function() {
        uploadTask.snapshot.ref.getDownloadURL().then(function(pfp){
            downloadURL = pfp;
            socket.emit("setPreferences",{username:username,key:"pfp",value:downloadURL});
            document.querySelector(".setPfpButton").innerText="change pfp";
            document.querySelector(".setPfpButton").onclick = function(){changepfpclicked()}
        });
    });
}

socket.on("notification",(data) => {
    if(data!=to){
        var previousNotifications = document.querySelector("."+data+" .unseen").innerText;
        previousNotifications = previousNotifications > 0 ? parseInt(previousNotifications)+1 : 1
        document.querySelector("."+data+" .unseen").innerText = previousNotifications;
    }
});

function confirmEmail(){
    var email = document.querySelector(".email").value;
    socket.emit("setPreferences",{username:username,key:"email",value:email});
}

socket.on("change email response",response=>{
    if(response){
        document.querySelector(".setEmail").style.display="none";
        document.querySelector(".changeEmail").style.display="inline";
        document.querySelector(".email").disabled = true;
    }else{
        alert("email is already registered with another account");
    }
});

function changeEmail(){
    document.querySelector(".changeEmail").style.display = "none";
    document.querySelector(".setEmail").style.display="inline";
    document.querySelector(".email").disabled = false;
}

var addEventListenToUsers = document.querySelectorAll(".user");
addEventListenToUsers.forEach(function(user){
    user.addEventListener("click",function(){
        loadDynamic(user);
    });
});
