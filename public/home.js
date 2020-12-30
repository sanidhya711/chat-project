var notification;
var firstNoti = true;
var notifications;
var filter;
var primaryColor;
var secondryColor;
var downloadURL;

$("a").on("click",function(){
  $(".loader-wrapper").fadeIn("fast");
})

var socket = io();

var username = document.getElementById("username").className;

socket.emit("getPreferences",{username:username});

socket.on("userPreferences",data=>{
  document.getElementById("preferences").style.visibility="visible";
  document.getElementById("loadingPreferences").innerText="Preferences";
  document.getElementById("loadingPreferences").style.textDecoration="underline";
  if(data.notifications){
    notificationsButton.checked = true;
    notifications = true;
  }else{
    notifications=false;
  }
  if(data.filter){
    filterButton.checked = true;
    filter = true;
  }else{
    notifications=false;
  }
  downloadURL = data.pfp;
  primaryColor = data.primaryColor;
  secondryColor = data.secondryColor;
});

  //a client just posted a message
  socket.on("pushNotification",data=>{
    if(notification!= null){
      firstNoti=false;
      notification.close();
    }
          if(data.to==username){

            function notifyMe() {
                if (Notification.permission === "granted") {
                  if(data.type=="image"){
                    notification = new Notification(data.from,{image:data.msg,icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sAWynJ1P1_jrxSY5z5bZFUNRrsz3zsonYA&usqp=CAU"});
                  }else if(data.type=="video"){
                    notification = new Notification(data.from,{body:"sent a video",icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sAWynJ1P1_jrxSY5z5bZFUNRrsz3zsonYA&usqp=CAU"});
                  }else{
                    notification = new Notification(data.from,{body:data.msg,icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7sAWynJ1P1_jrxSY5z5bZFUNRrsz3zsonYA&usqp=CAU"});
                  }
                }
                notification.onclick = function(event){
                  event.preventDefault();
                  window.location.href="http://localhost:3000/chats/"+data.from;
              }
              }

              if(notifications){
                if(firstNoti){
                  notifyMe();
                }else{
                  setTimeout(() => {
                    notifyMe();
                    }, 400);
                }
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

  var notificationsButton = document.querySelector("#notificationsbich");
  var filterButton = document.querySelector("#filterbich");

  notificationsButton.addEventListener("click",function(){
    if(notificationsButton.checked){
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          notifications = true;
          socket.emit("setPreferences",{username:username,key:"notifications",value:notifications});
        }else{
          alert("you have blocked notifications from this site");
          notificationsButton.checked=false;
          notifications = false;
          socket.emit("setPreferences",{username:username,key:"notifications",value:notifications});
        }
      });
    }else{
      notifications = false;
      socket.emit("setPreferences",{username:username,key:"notifications",value:notifications});
    }
  });


  filterButton.addEventListener("click",function(){
    if(filterButton.checked){
      filter = true;
      socket.emit("setPreferences",{username:username,key:"filter",value:filter});
    }else{
      filter=false;
      socket.emit("setPreferences",{username:username,key:"filter",value:filter});
    }
  });

document.getElementById("color1bich").addEventListener("change",function(e){
  primaryColor = document.getElementById("color1bich").value;
  document.querySelector(".homeHolder").style.backgroundColor=primaryColor;
  socket.emit("setPreferences",{username:username,key:"primaryColor",value:primaryColor});
});

document.getElementById("color2bich").addEventListener("change",function(e){;
  secondryColor = document.getElementById("color2bich").value;
  document.querySelector("body").style.backgroundColor = secondryColor;
  socket.emit("setPreferences",{username:username,key:"secondryColor",value:secondryColor});
});

function resetColours(){
  primaryColor = "#c4e8ed";
  secondryColor = "#e6a7a7";
  document.querySelector(".homeHolder").style.backgroundColor=primaryColor;
  document.querySelector("body").style.backgroundColor=secondryColor;
  document.getElementById("color1bich").value=primaryColor;
  document.getElementById("color2bich").value=secondryColor;
  socket.emit("setPreferences",{username:username,key:"primaryColor",value:primaryColor});
  socket.emit("setPreferences",{username:username,key:"secondryColor",value:secondryColor});
}
document.querySelector("#searchUsers").addEventListener("input",function(){
  var query = document.getElementById("searchUsers").value;
  query = query.toLowerCase();

  if(query.charAt(query.length-1)==" "){
   document.querySelector("#searchUsers").value = query.slice(0, -1); 
  }


  else {
    var namesToShow = [];
    var allUserNames = document.querySelectorAll(".bruhbruhbruh");
    allUserNames.forEach(function(element){
      var username = element.innerText;
      username = username.toLowerCase();
      if(username.includes(query)){
        namesToShow.push(username);
      }
    });
  
    if(namesToShow.length==0){
      if(document.querySelector(".noUsersFound")==null){
      var div = document.createElement("div");
      div.classList.add("noUsersFound");
      div.innerText="no users found :(";
      document.querySelector(".homeHolder").appendChild(div);
      }
    }else{
      if(document.querySelector(".noUsersFound")!=null){
        document.querySelector(".homeHolder").removeChild(document.querySelector(".noUsersFound"));
      }
    }

      var containers = document.querySelectorAll(".userNameHolder");
      containers.forEach(function(element){
        var whosContainer = element.getAttribute("href");
        whosContainer = whosContainer.replace("/chats/","")
        if(!namesToShow.includes(whosContainer)){
         element.style.display="none";
        }else{
          element.style.display="flex"
          var text = document.querySelector("."+whosContainer+" .bruhbruhbruh").innerText;
          var queryStarts = text.indexOf(query);
          var queryEnds = queryStarts+query.length;
          var part1 = text.slice(0,queryStarts);
          var part2 = text.slice(queryEnds,text.length);
          var hightlight = "<span style='color:#bfe970;'>"+query+"</span>";
          document.querySelector("."+whosContainer+" .bruhbruhbruh").innerHTML=part1+hightlight+part2;
        }
      });
  }
});

var inputEvent;

function img_pathUrl(input){
  if(input.files[0]!=null){
    $('#img_url')[0].src = (window.URL ? URL : webkitURL).createObjectURL(input.files[0]);
    // $('#img_url')[0].style.display="inline-block";
    inputEvent = input;
    document.getElementById("uploadPfp").style.display="inline-block";
  }
}

document.getElementById("uploadPfp").addEventListener("click",function(){
  document.getElementById("uploadPfp").style.display="none";
  document.getElementById("img_file").disabled = true;
  if(circle!=null){
    circle.stop();
    circle.destroy();
  }
  
  var circle = new ProgressBar.Circle(container, {
    color: '#aaa',
    strokeWidth: 4,
    trailWidth: 1,
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#aaa', width: 1 },
    to: { color: '#333', width: 4 },
    // Set default step function for all animate calls
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);
  
      var value = Math.round(circle.value())*100;
      if (value === 0) {
        circle.setText("0%");
      } else if(value<=100){
        circle.setText(value+"%");
        circle.stop();
        setTimeout(() => {
          circle.destroy();
        },1000);
      }else{
        circle.setText(value+"%");
      }
      
    }
  });
  circle.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  circle.text.style.fontSize = '2rem';
  circle.text.style.color="#333";

    var file = inputEvent.files[0];
    var storageRef = firebase.storage().ref("/pfp/"+username+"/"+file.name);
    var uploadTask = storageRef.put(file)
      uploadTask.on('state_changed', function(snapshot){
      var progress =(snapshot.bytesTransferred / snapshot.totalBytes);
      if(progress==1){
        bar.animate(progress);  // Number from 0.0 to 1.0
      }

    },function(error){},
    function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(pfp){
      document.getElementById("img_file").disabled = false;
      downloadURL = pfp;
      socket.emit("setPreferences",{username:username,key:"pfp",value:downloadURL});
    });
    });
});


socket.emit("newUser", username);
socket.emit("getOnline","bruh");

socket.on("startingOnline",data=>{
  console.log(data);
  data.forEach(function(user) {
    if(user!=username){
      document.querySelector("."+user+" .bruhbruhbruh").style.color="green";
    }
  });
});

socket.on("online",userOnline=>{
  console.log(userOnline);
  document.querySelector("."+userOnline+" .bruhbruhbruh").style.color="green";
});

socket.on("offline",userOffline=>{
  console.log(userOffline);
  document.querySelector("."+userOffline+" .bruhbruhbruh").style.color="rgb(66, 184, 221)";
});

var email;

document.getElementById("setEmail").addEventListener("click",function(){
  email = document.getElementById("email").value;
  socket.emit("setPreferences",{username:username,key:"email",value:email});
});

socket.on("change email response",data=>{
  if(data){
    document.getElementById("email_div").style.display="none";
    document.getElementById("change_email_div").style.display="inline-block";
    document.getElementById("show_email").innerText=email;
  }else{
    alert("that email is already registered with another account");
  }
});

  document.getElementById("changeEmail").addEventListener("click",function(){
  document.getElementById("email_div").style.display="inline-block";
  document.getElementById("change_email_div").style.display="none";
});