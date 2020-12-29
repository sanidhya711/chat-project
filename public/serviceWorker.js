var to;

self.addEventListener('message', function(event){
    var data = JSON.parse(event.data);
    to = data;
});

self.addEventListener("push",function(e){
    var data = e.data.json();
    if(data.from!=to){
    self.registration.showNotification(data.title,{
        body:data.from,
        icon:data.pfp
    });
    }
});