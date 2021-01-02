var format = /[`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
var form = document.querySelector("form");

document.querySelector(".btn").addEventListener("click",function(e){
    e.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if(/\s/g.test(username)){
        alert("username cannot contain spaces");
    }else if(username.length>15 || username.length<3){
        alert("username must be between 3 to 15 letters long");
    }else if(format.test(username)){
        alert("username can only contain alphabets,number,dashes and underscores");
    }else if(password.length<8){
        alert("password should be atleast 8 characters long");
    }else{
        form.submit();
    }
});