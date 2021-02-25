var username = document.querySelector("#username").className;
const myPeer = new Peer(username);
var otherPerson;
var call;
var videoGrid = document.querySelector(".video-grid-inner");
var callButton = document.getElementById("call");

function call_peer(elem){
    socket.emit("calling",{from:username,to:to});
    elem.remove();
    document.querySelector(".ringtone").play();
    navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
        otherPerson = to;
        var myVideo = document.createElement("video");
        myVideo.srcObject=stream;
        myVideo.muted=true;
        myVideo.play();
        videoGrid.appendChild(myVideo);
        call = myPeer.call(to,stream);
        var eee = document.createElement("div");
        var mmm = document.querySelector(".top-bar img").src;
        eee.innerHTML = `<img src="${mmm}"></img>`;
        videoGrid.appendChild(eee);
        var i = document.createElement("i");
        i.classList.add("fas");
        i.classList.add("fa-phone-slash");
        i.classList.add("fa-2x");
        i.id="hangup";
        i.onclick=function(){
            hangup();
        };
        document.querySelector(".call-buttons").appendChild(i);

        var video = document.createElement('video');
        call.on('stream', userVideoStream =>{
            pause();
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata",function(){
                video.play();
            })
            videoGrid.appendChild(video);
        });
    });
}

function hangup(){
    call.close();
    document.querySelector(".video-grid").innerHTML=`<div class="video-grid-inner"></div> <div class="call-buttons"></div>`;
    socket.emit("hangup",otherPerson);
    videoGrid = document.querySelector(".video-grid-inner");
    var i = document.createElement("i");
    i.id="call"
    i.classList.add("fas");
    i.classList.add("fa-2x");
    i.classList.add("fa-phone");
    i.onclick = function(){
        call_peer(this);
    };
    document.querySelector(".top-bar").appendChild(i);
    pause();
}

socket.on("hangup",()=>{
    call.close();
    document.querySelector(".video-grid").innerHTML=`<div class="video-grid-inner"></div> <div class="call-buttons"></div>`;
    videoGrid = document.querySelector(".video-grid-inner");
    var i = document.createElement("i");
    i.id="call"
    i.classList.add("fas");
    i.classList.add("fa-2x");
    i.classList.add("fa-phone");
    i.onclick = function(){
        call_peer(this);
    };
    document.querySelector(".top-bar").appendChild(i);
    pause();
});

myPeer.on('call', calll => {
    document.querySelector(".fa-phone").remove();
    document.querySelector(".ringtone").play();

    call = calll;
    otherPerson = call.peer;

    var eee = document.createElement("div");
    var mmm = document.querySelector(".user-self .pfp").src;
    eee.innerHTML = `<img src="${mmm}"></img>`;
    videoGrid.appendChild(eee);

    var eee = document.createElement("div");
    var mmm = document.querySelector(".top-bar img").src;
    eee.innerHTML = `<img src="${mmm}"></img>`;
    videoGrid.appendChild(eee);

    var i = document.createElement("i");
    i.classList.add("fas");
    i.classList.add("fa-phone-slash");
    i.classList.add("fa-2x");
    i.id="hangup";
    i.onclick=function(){
        hangup();
    };
    document.querySelector(".call-buttons").appendChild(i);

    var i = document.createElement("i");
    i.classList.add("fas");
    i.classList.add("fa-phone");
    i.classList.add("fa-2x");
    i.id="answer";
    i.onclick=function(){
        pause();
        this.remove();
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
        var myVideo = document.createElement("video");
        myVideo.srcObject=stream;
        myVideo.muted=true;
        myVideo.play();
        videoGrid.appendChild(myVideo);
        call.answer(stream);
        var video = document.createElement('video');
        call.on('stream', userVideoStream => {
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata",function(){
                video.play();
            })
            videoGrid.appendChild(video);
            });
        }).catch(function(err){
            alert(err);
        })
    };
    document.querySelector(".call-buttons").appendChild(i);
});

function pause(params) {
    document.querySelector(".ringtone").pause();
    document.querySelector(".ringtone").currentTime = 0;
}