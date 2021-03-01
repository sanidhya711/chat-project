var to;

self.addEventListener('message',function(event){
    to = JSON.parse(event.data);
    console.log(to);
});

self.addEventListener("push",function(e){
    var data = e.data.json();
    if(data.wentOffline == true){
        console.log("offline");
        to = "";
        console.log("set to empty");
    }else{
        console.log(to);
        if(data.from!=to){ 
            if(JSON.stringify(data.from)!=to){
                const notificationPromise = self.registration.showNotification(data.title,{
                body:data.from,
                icon:data.pfp,
                click_action : "/chats/"+data.from,
            });
            e.waitUntil(notificationPromise);
            }
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(clients.openWindow("/chats/"+event.notification.body));  
});

