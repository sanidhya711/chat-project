const publicVapidKey = "BLMUx_WIr-gWDHM5B6xn5imROX4HeA4q-d8_iI50lKhFDJm4YVwQNqygD_Hn2Ihk83mDMvARdXLqs6mvzNrYhX8";

if("serviceWorker" in navigator){
    send().catch(err => console.log(err));
}

var register;

async function send(){
    register = await navigator.serviceWorker.register("/serviceWorker.js",{scope:"/"});
    await navigator.serviceWorker.ready;
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    if(to!=null){
        register.active.postMessage(JSON.stringify(to));
    }

    var data = {
        subscription:subscription,
        username:username
    }
    
    await fetch("/subscribeForPushNotifications",{
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'content-type':'application/json'
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function unregister(){
    register.unregister();
}