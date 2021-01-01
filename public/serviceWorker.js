var to;

self.addEventListener('message',function(event){
        var data = JSON.stringify(event.data);
        var data = JSON.parse(data);
        to = data;
});

self.addEventListener("push",function(e){
    var data = e.data.json();
    if(JSON.stringify(data.from)!=to){
        const notificationPromise = self.registration.showNotification(data.title,{
        body:data.from,
        icon:data.pfp,
        click_action : "/chats/"+data.from,
    });
    e.waitUntil(notificationPromise);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(clients.openWindow("/chats/"+event.notification.body));  
});