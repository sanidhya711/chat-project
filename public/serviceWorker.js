var to;

self.addEventListener('message',function(event){
    to = JSON.parse(event.data);
    console.log(to);
});

self.addEventListener("push",function(e){

    var data = e.data.json();

    console.log("new notification "+ data.wentOffline);


    if(data.wentOffline == true){
        to = "";
    }else{
        if(data.from!=to){ 
            console.log("still not comign?");
            const notificationPromise = self.registration.showNotification(data.title,{body:data.from,icon:data.pfp,click_action : "/chats/"+data.from,});
            e.waitUntil(notificationPromise);
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(clients.openWindow("/chats/"+event.notification.body));  
});

