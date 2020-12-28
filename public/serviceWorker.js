self.addEventListener("push",function(e){
    var data = e.data.json();
    self.registration.showNotification(data.title,{
        body:data.from,
        icon:"https://i.pinimg.com/originals/a2/88/24/a28824e8dde8223b6b64ec2c9ba68326.jpg"
    });
});