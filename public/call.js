var username = document.querySelector("#username").className;
const myPeer = new Peer(username);
var otherPerson;
var call;
var videoGrid = document.querySelector(".video-grid-inner");
var callButton = document.getElementById("call");

document.querySelector("#call").addEventListener("click",function(){
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
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata",function(){
                video.play();
            })
            videoGrid.appendChild(video);
        });
    }).catch(function(err){
        alert(err);
    });
});

function hangup(){
    call.close();
    document.querySelector(".video-grid").innerHTML=`<div class="video-grid-inner"></div> <div class="call-buttons"></div>`;
    socket.emit("hangup",otherPerson);
    videoGrid = document.querySelector(".video-grid-inner");
}

socket.on("hangup",()=>{
    call.close();
    document.querySelector(".video-grid").innerHTML=`<div class="video-grid-inner"></div> <div class="call-buttons"></div>`;
    videoGrid = document.querySelector(".video-grid-inner");
});

myPeer.on('call', calll => {

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
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
        var myVideo = document.createElement("video");
        console.log(myVideo);
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
            var i = document.createElement("i");
            i.classList.add("fas");
            i.classList.add("fa-phone-slash");
            i.classList.add("fa-2x");
            i.id="hangup";
            i.onclick=function(){
                hangup();
            };
            document.querySelector(".call-buttons").appendChild(i);
        }).catch(function(err){
            alert(err);
        })
        console.log(call);
    };
    document.querySelector(".call-buttons").appendChild(i);
});