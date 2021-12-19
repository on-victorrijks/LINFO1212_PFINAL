async function showCollocationData(kotID){

    const data = {
        "kotID": kotID
    };

    document.getElementById("modalContainer").removeAttribute("hidden");
    document.getElementById("addPeopleToConversationModal").removeAttribute("hidden");
    document.getElementById("loading_collocation-data").removeAttribute("hidden");


    document.getElementById("actual-tenants").innerHTML = "";
    document.getElementById("noUser-actual").setAttribute("hidden", "true");

    //

    document.getElementById("requests-users").innerHTML = "";
    document.getElementById("noUser-requests").setAttribute("hidden", "true");
    document.getElementById("collocation-data").setAttribute("hidden", "true");

    await fetch('https://localhost:8080/api/collocation/getTenants', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            const usersData = result.content;
            if(usersData.length===0){
                document.getElementById("noUser-actual").removeAttribute("hidden");
            } else {
                usersData.forEach(userData => {
                    appendUserTo(userData, kotID, "actual-tenants", "actual");
                });
            }
        } else {
            const error = result.content;
            console.error('Error:', error);
        }
    }).catch((error) => {
        console.error('Error:', error);
    });

    await fetch('https://localhost:8080/api/collocation/getAskToJoinUsers', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            const usersData = result.content;
            if(usersData.length===0){
                document.getElementById("noUser-requests").removeAttribute("hidden");
            } else {
                usersData.forEach(userData => {
                    appendUserTo(userData, kotID, "requests-users", "requests");
                });
            }
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });

    document.getElementById("collocation-data").removeAttribute("hidden");
    document.getElementById("loading_collocation-data").setAttribute("hidden", "true");

}



function appendUserTo(userData, kotID, appendTo, type){

    let btn1, btn2;

    if(type==="actual"){
        btn1 = `<button class="delete" onClick="removeUserFromCollocation('${userData._id}', '${kotID}')">Enlever</button>`;
        btn2 = ``;
    } else {
        btn1 = `<button class="refuse" onClick="refuseAskToJoin('${userData._id}', '${kotID}')">Refuser</button>`;
        btn2 = `<button class="accept" onClick="acceptAskToJoin('${userData._id}', '${kotID}')">Accepter</button>`;
    }

    document.getElementById(appendTo).innerHTML += `
    <div class="userPreview" userID="${userData._id}">
        <div class="uP-userImage">
            <img src="https://localhost:8080/users/profilPicture/${userData._id}"/>
        </div>
        <div class="uP-userName">
            <h2>${userData.firstname} ${userData.lastname}</h2>
        </div>
        <div class="uP-userBtns">
            <a href="/user/${userData._id}">Voir le profil</a>
            ${btn1}
            ${btn2}
        </div>
    </div>
    `;
}

async function acceptAskToJoin(userID, kotID) {

    const data = {
        "kotID": kotID,
        "userID_askingToJoin": userID
    };

    await fetch('https://localhost:8080/api/collocation/acceptAskToJoinKot', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            document.querySelector(".userPreview[userID='" + userID + "']").remove();
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });
}

async function refuseAskToJoin(userID, kotID) {

    const data = {
        "kotID": kotID,
        "userID_askingToJoin": userID
    };

    await fetch('https://localhost:8080/api/collocation/refuseAskToJoinKot', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            document.querySelector(".userPreview[userID='" + userID + "']").remove();
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });
}

async function removeUserFromCollocation(userID, kotID){

    const data = {
        "kotID": kotID,
        "userID_toRemove": userID
    };

    await fetch('https://localhost:8080/api/collocation/removeTenant', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            document.querySelector(".userPreview[userID='" + userID + "']").remove();
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });

}

function closeModal(modalID){
    document.getElementById("modalContainer").setAttribute("hidden", "true");
    document.getElementById(modalID).setAttribute("hidden", "true");
}

async function deleteKot(kotID){

    const data = {
        "kotID": kotID
    };

    await fetch('https://localhost:8080/api/kot/delete', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            document.querySelector(".kotPreviewList[kotID='" + kotID + "']").remove();
        } else {
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });

}