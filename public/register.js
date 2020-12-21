var hasBeenWarned = false;

function trackInput(){
    var str = $("#username").value;
    var element = $("#error");
    var password = $("#password");
    if (/\s/.test(str)){
        password.addClass("remove-top-margin")
        element.removeClass("hidee");
        element.addClass("showw");
    }else{
        password.removeClass("remove-top-margin")
        element.removeClass("showw");
        element.addClass("hidee");
    }
}

function submitt(){
    var str = document.getElementById("username").value;
    var no_of_uppercase_letters = 0;
    for (let counter = 0; counter < str.length; counter++) {
        var character = str.charAt(counter);
        if(isUppercase(character)){
            no_of_uppercase_letters++;
        }
    }
    if (/\s/.test(str)){
    alert("username cannot contain spaces");
    }else if(str.length>15){
        alert("usrname cannot contain more than 15 characters");
    }else if(no_of_uppercase_letters>5){
        alert("too many uppercase letters -_-");
    }else if(str.includes("@gmail.com") && !hasBeenWarned){
        hasBeenWarned=true;
        alert("you dont need to enter your gmail...but if you want you can continue");
    }else if(str.length<3){
        alert("username must contain 3 or more letters");
    }
    else{
        $("#myform").submit();
        $(".ani").addClass("startAni");
        $("#btn-loader").fadeIn("slow");
    }
}

function isUppercase(ch) {
    if (!isNaN(ch * 1)){
       return false;
    }
     else {
       if (ch == ch.toUpperCase()) {
          return true;
       }
       if (ch == ch.toLowerCase()){
          return false;
       }
    }
 }
document.addEventListener("keydown",function(eve){
    if(eve.key=="Enter"){
        submitt();
    }
});



