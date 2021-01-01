var socket = io();
var username = document.getElementById("username").className;
const myPeer = new Peer();
var id;
var videoGrid = document.getElementById("videoGrid");
var answerButton = document.getElementById("answer");
var ringtoneElement = document.createElement("audio");
ringtoneElement.src="/ringtone.mp3";
ringtoneElement.loop=true;
var hangupButton = document.getElementById("hangup");
var callButton = document.getElementById("call");


//send peer id as soon as u connect
myPeer.on('open', id => {
    socket.emit("peer id",{id:id,username:username,roomName:roomName});
});

socket.on("hangup",()=>{
    hangupButton.style.display="none";
    answerButton.style.display="none";
    callButton.style.display="inline-block";
    ringtoneElement.pause();
    ringtoneElement.currentTime=0;
});

function call(){
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