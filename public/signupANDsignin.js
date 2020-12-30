var active = "context-menu--active";
var menu = document.querySelector(".context-menu");

document.addEventListener( "contextmenu", function(e){
    e.preventDefault();
    var x = e.clientX;
    var y = e.clientY;

    var totalx = window.innerWidth;
    var totaly = window.innerHeight;

    var contextMenuWidth = 190;
    var contextMenuHeight = 122;

    if(x+contextMenuWidth > totalx){
        menu.style.left = (x-contextMenuWidth+10)+"px";
    }else{
        menu.style.left = (x-8)+"px";
    }

    if(y+164 > totaly){
        menu.style.top = (y-contextMenuHeight-30)+"px";
    }else{
        menu.style.top = (y-8)+"px";
    }

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
    hi
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
