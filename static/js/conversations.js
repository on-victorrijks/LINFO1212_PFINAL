// Constant data
const connectedUserID = document.getElementById("connectedUserID").value;
const selectedConversationID = document.getElementById("selectedConversationID").value;

const messagesContainer       = document.getElementById("cW-messagesBrowser");
const messagesLoaderContainer = document.getElementById("messagesLoaderContainer");
const fetchMoreMessagesButton = document.getElementById("fetchMoreMessagesButton");

const invitationURLCopyButton = document.getElementById("button_invitationUrl");
const passwordCopyButton      = document.getElementById("button_invitationPassword");

const usersListContainer      = document.getElementById("usersListContainer");
const usersLoaderContainer    = document.getElementById("usersLoaderContainer");
const usersEmpty_removeUsers  = document.getElementById("usersEmpty-removeUsers");


// Dyn data
const dyn_convName      = document.getElementById("dyn_convName");
const dyn_convID        = document.getElementById("dyn_convID");
const dyn_messageInput  = document.getElementById("messageInput");
const dyn_lastNumID     = document.getElementById("dyn_lastNumID");


function openModal(id){
    document.getElementById("modalContainer").removeAttribute("hidden");
    document.getElementById(id).removeAttribute("hidden");
}

function closeModal(id){
    document.getElementById("modalContainer").setAttribute("hidden", "true");
    document.getElementById(id).setAttribute("hidden", "true");
}

invitationURLCopyButton.addEventListener("click", copyContent);
passwordCopyButton.addEventListener("click", copyContent);

function copyContent(e){
    
    var toCopy_invitationUrl = document.getElementById(e.target.getAttribute("contentID"));

    toCopy_invitationUrl.select();
    toCopy_invitationUrl.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(toCopy_invitationUrl.value);

    e.target.innerHTML = "Copié";
    e.target.parentElement.setAttribute("copied", "true");
}



async function leaveConversation(){

    const convID  = dyn_convID.value;
    
    const data = {
        "conversationID": convID,
        "userToRemoveID": connectedUserID
    };

    await fetch('https://localhost:8080/api/removeUserFromConversation', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const error = result.error;
        if(!error){
            location.reload();
        } else {
            console.error('Error:', error);
        }
    }).catch((error) => {
        console.error('Error:', error);
    });

}



function clearUsersInUsersList(){
    usersListContainer.querySelectorAll(".userListElement").forEach((userListElement) => {
        userListElement.remove();
    })
}




async function getUsersFromConversation(){

    usersLoaderContainer.removeAttribute("hidden");
    usersEmpty_removeUsers.setAttribute("hidden", "true");

    setTimeout(async() => {

        const convID  = dyn_convID.value;

        const data = {
            "conversationID": convID,
        };

        await fetch('https://localhost:8080/api/getUsersDataFromConvID', {
            method: 'post',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            const status = result.status;
            const content = result.content;
            if(status==="OK"){
                const usersData = content;
                if(usersData.length===0){
                    usersEmpty_removeUsers.removeAttribute("hidden");
                } else {
                    usersData.forEach(userData => {
                        createUIUser(userData);
                    });
                }
                usersLoaderContainer.setAttribute("hidden", "");
            } else {
                console.error('Error:', content);
                usersLoaderContainer.setAttribute("hidden", "");
            }
        }).catch((error) => {
            console.error('Error:', error);
            usersLoaderContainer.setAttribute("hidden", "");
        });

    }, 500);

}

async function removeUserFromConversation(userID){

    const convID  = dyn_convID.value;

    const data = {
        "conversationID": convID,
        "userToRemoveID": userID
    };

    await fetch('https://localhost:8080/api/removeUserFromConversation', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const error = result.error;
        if(!error){
            usersListContainer.querySelector(".userListElement[userid='" + userID + "']").remove();
        } else {
            console.error('Error:', error);
        }
    }).catch((error) => {
        console.error('Error:', error);
    });

}


function createUIUser(userData){

    const newUIUser = document.createElement('div');
    newUIUser.setAttribute("class", "userListElement");
    newUIUser.setAttribute("userID", userData._id.toString());

    // Image
    const NUIUSER_userImage = document.createElement('div');
    NUIUSER_userImage.setAttribute("class", "userImage");

    const NUIUSER_userImage_img = document.createElement('img');
    NUIUSER_userImage_img.src = "https://localhost:8080/users/profilPicture/" + userData._id.toString();

    NUIUSER_userImage.appendChild(NUIUSER_userImage_img);

    // Text
    const NUIUSER_userName = document.createElement('div');
    NUIUSER_userName.setAttribute("class", "userName");

    const NUIUSER_userName_text = document.createElement('h1');
    NUIUSER_userName_text.innerHTML = userData.firstname + " " + userData.lastname;

    NUIUSER_userName.appendChild(NUIUSER_userName_text);

    ///// Buttons
    const NUIUSER_buttonsContainer = document.createElement('div');
    NUIUSER_buttonsContainer.setAttribute("class", "userButtons");

    // Remove btn
    const NUIUSER_buttonsContainer_removeBtn = document.createElement('button');
    NUIUSER_buttonsContainer_removeBtn.setAttribute("onClick", "removeUserFromConversation('" + userData._id.toString() + "')")

    const NUIUSER_buttonsContainer_removeBtn_icon = document.createElement('img');
    NUIUSER_buttonsContainer_removeBtn_icon.src = "/imgs/icons/person_remove_black_24dp.svg";

    NUIUSER_buttonsContainer_removeBtn.appendChild(NUIUSER_buttonsContainer_removeBtn_icon);


    NUIUSER_buttonsContainer.appendChild(NUIUSER_buttonsContainer_removeBtn);

    // Compiling
    newUIUser.appendChild(NUIUSER_userImage);
    newUIUser.appendChild(NUIUSER_userName);
    newUIUser.appendChild(NUIUSER_buttonsContainer);

    // Adding to UI
    usersListContainer.appendChild(newUIUser);

}






if(selectedConversationID) setConversation("conv_" + selectedConversationID);

function setConversation(conversationInformationsContainerID) {

    // Reset conversation window
    messagesContainer.querySelectorAll(".cW-message").forEach((UIMessage) => {
        UIMessage.remove();
    });
    fetchMoreMessagesButton.removeAttribute("hidden");

    const informationsContainer = document.getElementById(conversationInformationsContainerID);
    const convID            = informationsContainer.getAttribute("convID");
    const convName          = informationsContainer.getAttribute("convName");
    const isSelected        = informationsContainer.getAttribute("isSelected");
    const passwordToJoin    = informationsContainer.getAttribute("passwordToJoin");

    const previouslySelectedConversation = document.querySelector(".cB-conversation[isSelected='true']");
    if(previouslySelectedConversation) previouslySelectedConversation.setAttribute("isSelected", "false");

    informationsContainer.setAttribute("isSelected", "true");
    dyn_convName.innerHTML = convName;
    dyn_convID.value = convID;
    document.getElementById("toCopy_invitationUrl").value = "https://localhost:8080/invitations/" + convID;
    document.getElementById("toCopy_password").value = passwordToJoin;

    document.getElementById("conversationWindow").setAttribute("noMessage", "true");
    document.getElementById("conversationWindow").removeAttribute("noConversationSelected");
    dyn_lastNumID.value = 5000;
    getMessages();
    
}

document.getElementById("sendMessageButton").addEventListener("click", sendMessage);
dyn_messageInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendMessage();
  }
});

async function sendMessage(){
    const message = dyn_messageInput.value;
    const convID  = dyn_convID.value;

    const data = {
        "message": message,
        "conversationID": convID
    };

    await fetch('https://localhost:8080/api/sendMessage', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const error = result.error;
        if(!error){
            const firstMessage = document.getElementById("conversationWindow").getAttribute("noMessage")==="true";
            dyn_messageInput.value = "";
            createUIMessage({
                message: message,
                isFromUser: true,
                createdOn: (new Date()).getTime(),
                fromUserID: connectedUserID
            }, 
            true,
            firstMessage
            )

            document.getElementById("conversationWindow").removeAttribute("noMessage");
        } else {
            console.error('Error:', error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}

async function getMessages(){

    messagesLoaderContainer.removeAttribute("hidden");

    const localMessages = document.querySelectorAll(".cW-message[local='true']");
    if(localMessages){
        localMessages.forEach(localMessage => {
            localMessage.remove();
        });
    }

    const convID  = dyn_convID.value;

    const data = {
        "conversationID": convID,
        "lastNumID": parseInt(dyn_lastNumID.value),
    };

    await fetch('https://localhost:8080/api/getMessages', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        const content = result.content;
        if(status==="OK"){
            const messages = content;
            if(messages.length > 0) document.getElementById("conversationWindow").removeAttribute("noMessage");
            const oldestMessage = messages[messages.length - 1];
            dyn_lastNumID.value = oldestMessage.numID - 1;
            messages.forEach(message => {
                createUIMessage(message, false, false);
            });
            messagesLoaderContainer.setAttribute("hidden", "");
        } else {
            if(content==="NOMSG"){
                // Plus de message fetchable
                fetchMoreMessagesButton.setAttribute("hidden", "");
            } else {
                console.error('Error:', content);
            }
            messagesLoaderContainer.setAttribute("hidden", "");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        messagesLoaderContainer.setAttribute("hidden", "");
    });

}

function createUIMessage(messageData, isNewMessage, firstMessage){

    const newUIMessage = document.createElement('div');
    newUIMessage.setAttribute("class", "cW-message");
    newUIMessage.setAttribute("fromUser", messageData.isFromUser.toString());
    if(isNewMessage && firstMessage){
        newUIMessage.setAttribute("local", "true");
    }

    // Image
    const NUIMSG_userImage = document.createElement('div');
    NUIMSG_userImage.setAttribute("class", "cW-userImage");

    const NUIMSG_userImageContainer = document.createElement('div');
    NUIMSG_userImageContainer.setAttribute("class", "cW-userImageContainer");

    const NUIMSG_userImage_img = document.createElement('img');
    NUIMSG_userImage_img.src = "https://localhost:8080/users/profilPicture/" + messageData.fromUserID;

    NUIMSG_userImageContainer.appendChild(NUIMSG_userImage_img);
    NUIMSG_userImage.appendChild(NUIMSG_userImageContainer);

    // Text
    const NUIMSG_messageText = document.createElement('div');
    NUIMSG_messageText.setAttribute("class", "cW-messageText");

    const NUIMSG_messageText_message = document.createElement('p');
    NUIMSG_messageText_message.innerHTML = messageData.message;

    const NUIMSG_messageText_time = document.createElement('h5');
    NUIMSG_messageText_time.innerHTML = formatDate(new Date(messageData.createdOn));

    NUIMSG_messageText.appendChild(NUIMSG_messageText_message);
    NUIMSG_messageText.appendChild(NUIMSG_messageText_time);

    // Compiling
    newUIMessage.appendChild(NUIMSG_userImage);
    newUIMessage.appendChild(NUIMSG_messageText);

    // Adding to UI
    if(isNewMessage){
        messagesContainer.appendChild(newUIMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
        messagesContainer.insertBefore(newUIMessage, document.getElementById("messagesAnchor").nextSibling);
    }

}

const formatDate = (date) => {
    return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes();
}