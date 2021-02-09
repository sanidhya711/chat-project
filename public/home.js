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

function showMessages(userClickedData){
  var to = userClickedData.classList[1];
  window.location.href = "/chats/"+to;
}

//search for user
document.querySelector(".search-user").addEventListener("input",function(){
  var query = document.querySelector(".search-user").value;
  query = query.toLowerCase();

  if(query.charAt(query.length-1)==" "){
   document.querySelector("#searchUsers").value = query.slice(0, -1); 
  }else {
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
  }
});
