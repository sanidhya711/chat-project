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

function showMessages(userClickedData){
  window.location.href = "/chats/"+userClickedData.classList[1];
//   document.querySelector(".settings").remove();
//   var div = document.createElement("div");
//   div.className = "main";
//   div.innerHTML = `<div class="top-bar"><img class="pfp" src=""><h3></h3><i onclick="call()" id="call" class="fa fa-2x fa-phone-square"></i><i id="answer" class="fa fa-2x fa-phone-square"></i><i onclick="hangup()" id="hangup" class="fa fa-2x fa-phone-square"></i></div>
// <div class="gradient"></div>
// <div class="video-grid"></div>
// <div class="messages"></div>
// <div class="input-bar-holder"><i class="fa fa-plus" aria-hidden="true"></i><input type="file" hidden class="fileUpload"><textarea onkeypress="typing()" oninput="auto_grow(this)" id="msg" placeholder="Message @<%= to %>" type="text"></textarea><div class="gif-emoji-button-holder">
// <svg version="1.0" xmlns="http://www.w3.org/2000/svg"width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"preserveAspectRatio="xMidYMid meet"><g id="gif-svg-change-fill-color" transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M2270 4705 c-242 -35 -462 -103 -668 -205 -654 -324 -1091 -938 -1187 -1664 -19 -150 -19 -402 0 -553 128 -987 903 -1753 1895 -1873 125 -15 402 -12 536 5 965 127 1725 883 1859 1850 22 159 22 431 0 590 -133 956 -874 1705 -1827 1845 -156 23 -469 26 -608 5z m569 -171 c659 -96 1221 -505 1512 -1099 339 -693 246 -1526 -238 -2125 -82 -102 -259 -272 -363 -349 -268 -199 -577 -326 -911 -375 -139 -21 -404 -21 -550 0 -719 100 -1330 587 -1593 1271 -40 102 -77 239 -101 370 -22 118 -31 422 -16 549 51 436 229 824 523 1138 315 338 715 549 1173 620 127 20 431 20 564 0z"/><path d="M1550 3205 c-225 -51 -414 -244 -482 -492 -31 -113 -31 -373 0 -486 48 -176 172 -343 307 -414 123 -64 190 -78 385 -78 148 1 188 4 260 23 85 22 227 84 281 123 l29 20 0 277 c0 152 -4 282 -8 288 -20 31 -55 34 -342 34 l-291 0 -24 -25 c-30 -30 -32 -64 -4 -99 l20 -26 240 0 239 0 0 -180 0 -180 -61 -31 c-132 -66 -322 -93 -467 -66 -112 22 -198 66 -265 136 -105 110 -149 240 -149 441 1 372 187 591 502 591 215 0 364 -97 421 -271 28 -85 51 -110 101 -110 44 0 88 35 88 70 0 37 -50 173 -82 222 -67 105 -183 188 -315 224 -82 23 -300 28 -383 9z"/><path d="M2631 3174 c-21 -26 -21 -34 -21 -706 l0 -679 25 -24 c33 -34 87 -34 120 0 l25 24 0 679 c0 672 0 680 -21 706 -16 21 -29 26 -64 26 -35 0 -48 -5 -64 -26z"/><path d="M3114 3178 c-12 -5 -27 -21 -33 -34 -16 -36 -16 -1323 0 -1358 22 -47 98 -56 142 -18 15 14 17 43 17 334 l0 318 399 0 c388 0 399 1 425 21 31 25 34 66 7 100 l-19 24 -406 3 -406 3 0 234 0 235 414 0 c403 0 414 1 440 21 33 26 36 79 6 109 -19 19 -33 20 -492 19 -304 0 -481 -4 -494 -11z"/></g></svg>
// </div>
// <div class="send-holder"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>
// </div>
// </div>`
// var referenceNode = document.querySelector(".users");
// referenceNode.parentNode.insertBefore(div,referenceNode.nextSibling);
// loadDynamic(userClickedData);
}



function loadDynamic(bruhh){
  document.querySelector(".messages").innerHTML="";
  document.querySelector(".search-user").value="";
  document.querySelector(".search-user").dispatchEvent(new Event('input'));
  var pfpTo = document.querySelector(".top-bar img").src;
  var user = document.createElement("div");
  user.classList.add("user");
  user.classList.add(to);
  user.setAttribute("href","/chats/"+to);
  user.onclick=function(){loadDynamic(this)};
  user.innerHTML=`<img class="pfp" src="${pfpTo}"><h5>${to}</h5>`;
  document.querySelector(".users-inner").prepend(user);
  to = bruhh.classList[1];
  pfpTo = bruhh.children[0].src;
  window.history.pushState('page2', 'Title', '/chats/'+to);
  socket.emit("load dynamic",{from:from,to:to});
  document.querySelector("."+to).remove();
  document.querySelector(".top-bar h3").style.color="inherit";
  document.querySelector(".top-bar h3").innerText=to;
  document.querySelector(".top-bar .pfp").src = pfpTo;
  document.querySelector(".gradient").classList.add("gradient-animation");
  users.classList.remove("users-swipe-left");
  users.classList.add("users-swipe-right");
  setTimeout(() => {
      document.querySelector(".gradient").classList.remove("gradient-animation");
  },2000);
}

socket.on("dynamically loaded",data=>{
  console.log(data);
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

//search for user
document.querySelector(".search-user").addEventListener("input",function(){
  var query = document.querySelector(".search-user").value;
  console.log(query);
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
      console.log("executed");
      var containers = document.querySelectorAll(".user");
      containers.forEach(function(element){
          var whosContainer = element.getAttribute("href");
          whosContainer = whosContainer.replace("/chats/","");
          console.log(whosContainer);
          element.children[1].innerText = whosContainer;
          element.style.display="flex";
      });
  }
});


document.addEventListener( "contextmenu", function(e){
  e.preventDefault();
  if(e.target.classList[0]=="user"){
      console.log(e.target.classList[1]);
  }
});