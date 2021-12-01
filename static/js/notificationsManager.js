getNotifications();

async function getNotifications() {

    console.log(1);

    await fetch('https://localhost:8080/api/notifications/getConnectedUserNotifications', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({}),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            const notifications = result.content;
            notifications.forEach(notification => {
                appendNotification(notification);
            });
        } else {
            const error = result.content;
            console.error('Error:', error); //FIX SHOW ERROR
        }
    }).catch((error) => {
        console.error('Error:', error); //FIX SHOW ERROR
    });

}


function getIconFromNotifType(type) {
    switch (type){
        case "newMessage":
            return "chat_black_24dp"
        default:
            return "notifications_black_24dp"
    }
}

function appendNotification(notification){

    const newNotification = document.createElement('div');
    newNotification.setAttribute("class", "notificationItem");
    newNotification.setAttribute("notifID", notification._id);

    ////// Notif Content
    const notifContent = document.createElement('div');
    notifContent.setAttribute("class", "notifContent");

    // notifIcon
    const notifIcon = document.createElement('div');
    notifIcon.setAttribute("class", "notifIcon");

    const notifIconIMG = document.createElement('img');
    notifIconIMG.src = "/imgs/icons/" + getIconFromNotifType(notification.type) + ".svg";

    notifIcon.appendChild(notifIconIMG);

    // notifData
    const notifData = document.createElement('div');
    notifData.setAttribute("class", "notifData");

    const notifTitle = document.createElement('h1');
    notifTitle.innerHTML = notification.title;

    const notifDesc = document.createElement('h2');
    notifDesc.innerHTML = notification.description;
    
    notifData.appendChild(notifTitle);
    notifData.appendChild(notifDesc);
    
    // Notif Content compiling
    notifContent.appendChild(notifIcon);
    notifContent.appendChild(notifData);

    ////// Notif Btns
    const notifBtns = document.createElement('div');
    notifBtns.setAttribute("class", "notifBtns");

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute("onClick", "deleteNotif('" + notification._id + "')");
    deleteBtn.innerHTML = "Supprimer";
    
    notifBtns.appendChild(deleteBtn);

    notification.buttons.forEach(button => {
        const newLink = document.createElement('a');
        newLink.setAttribute("href", button.redirectTo);
        newLink.innerHTML = button.title;
        notifBtns.appendChild(newLink);
    });


    ////// Compiling
    newNotification.appendChild(notifContent);
    newNotification.appendChild(notifBtns);

    document.getElementById("notificationsContainer").insertBefore(newNotification, document.querySelector(".notifBlocker").nextSibling);

}