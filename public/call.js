const myPeer = new Peer();
var peerid = document.getElementById("peerid").className;
var videoGrid = document.querySelector(".video-grid");

var callButton = document.getElementById("call");
var hangupButton = document.getElementById("hangup");
var answerButton = document.getElementById("answer");


myPeer.on('open', id => {
    socket.emit("newUser",{username:username,peerid:id});
});


function call(){
    if(peerid.length>1){
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
            var myVideo = document.createElement("video");
            myVideo.srcObject=stream;
            myVideo.muted=true;
            myVideo.play();
            videoGrid.appendChild(myVideo);
            var call = myPeer.call(peerid,stream);
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
    }else{
        socket.emit("call",{to:to,from:from,roomName:roomName});
    }
}


function hangup(){
    console.log("hangup");
}


myPeer.on('call', call => {
    answerButton.addEventListener("click",function(){
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
    });
});