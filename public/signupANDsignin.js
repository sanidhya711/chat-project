var active = "context-menu--active";
var menu = document.querySelector(".context-menu");

document.addEventListener( "contextmenu", function(e){
e.preventDefault();
        var x = e.clientX;
        var y = e.clientY;
        menu.style.left = x-10+"px";
        menu.style.top = y-10+"px";
        menu.classList.add(active);
});

document.addEventListener("click",function(){
    if(menu.classList.contains(active)){
        menu.classList.remove(active);
    }
});

document.addEventListener("keypress",function(e){
    if(e.key=="Enter"){
        document.querySelector(".btn").click();
    }
});

function signup(){
    window.location.href = "/signup";
}
function signin(){
    window.location.href = "/signin";
}
function forgotPassword(){
    window.location.href = "/getresetlink";
}

function rememberMe(){
    document.getElementById("rememberMe").checked=true;
}
function submit(){
    document.querySelector(".btn").click();
}

document.querySelector(".fa-eye").addEventListener("click",function(){
    document.querySelector(".fa-eye").style.display="none";
    document.querySelector(".fa-eye-slash").style.display="inline-block";
    document.querySelector("#password").type="text";
;});

document.querySelector(".fa-eye-slash").addEventListener("click",function(){
    document.querySelector(".fa-eye-slash").style.display="none";
    document.querySelector(".fa-eye").style.display="inline-block";
    document.querySelector("#password").type="password";
;});