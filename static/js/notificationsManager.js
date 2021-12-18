const NotificationBubble = document.getElementById("notifIndicator");

setTimeout(getNotifications, 500);
setInterval(getNotifications, 1000*60); // On récupère les notifications toutes les 60 secondes

async function getNotifications() {

    // Clear
    const UINotifications = document.querySelector(".notificationItem");
    if(UINotifications) {
        UINotifications.forEach(UINotification => {
            UINotification.remove();
        })
    }
    NotificationBubble.removeAttribute("notifFound");

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
            const numberOfNotifications = result.content.length;

            if(numberOfNotifications===0){
                NotificationBubble.removeAttribute("notifFound");
            } else {
                NotificationBubble.setAttribute("notifFound", "true");
                notifications.forEach(notification => {
                    appendNotification(notification);
                });
            }
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });

}



function getNotifIconFromNotificationData(notification){
    const notifIcon = document.createElement('div');
    notifIcon.setAttribute("class", "notifIcon");
    const notifIconIMG = document.createElement('img');

    switch (notification.type){
        case "newMessage":
            notifIconIMG.src = "https://localhost:8080/users/profilPicture/" + notification.datapoints[1];
            notifIcon.setAttribute("isUserPicture", "true");
            break;
        case "newAskToJoin":
            notifIconIMG.src = "/imgs/icons/home_black_24dp.svg";
            break;
        case "askToJoinAccepted":
            notifIconIMG.src = "/imgs/icons/done_black_24dp.svg";
            break;
        case "askToJoinRefused":
            notifIconIMG.src = "/imgs/icons/close_black_24dp.svg";
            break;
        default:
            notifIconIMG.src = "/imgs/icons/notifications_black_24dp.svg";
    }
    notifIcon.appendChild(notifIconIMG);
    return notifIcon
}

function appendNotification(notification){

    const newNotification = document.createElement('div');
    newNotification.setAttribute("class", "notificationItem");
    newNotification.setAttribute("notifID", notification._id);

    ////// Notif Content
    const notifContent = document.createElement('div');
    notifContent.setAttribute("class", "notifContent");

    // notifIcon
    const notifIcon = getNotifIconFromNotificationData(notification);

    // notifData
    const notifData = document.createElement('div');
    notifData.setAttribute("class", "notifData");

    const notifTitle = document.createElement('h1');
    notifTitle.innerHTML = notification.UIData.title;

    const notifDesc = document.createElement('h2');
    notifDesc.innerHTML = notification.UIData.description;
    
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

async function deleteNotif(notificationID){
    
    fetch('https://localhost:8080/api/notifications/deleteNotification', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            notificationID: notificationID
        }),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            document.querySelector(`.notificationItem[notifID='${notificationID}']`).remove();
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });

}