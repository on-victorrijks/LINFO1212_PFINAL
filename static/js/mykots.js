async function showCollocationData(kotID){

    const data = {
        "kotID": kotID
    };

    document.getElementById("modalContainer").removeAttribute("hidden");
    document.getElementById("addPeopleToConversationModal").removeAttribute("hidden");


    document.getElementById("actual-tenants").innerHTML = "";

    document.getElementById("loading_collocation-actual").removeAttribute("hidden");
    document.getElementById("noUser-actual").setAttribute("hidden", "true");

    //

    document.getElementById("requests-users").innerHTML = "";

    document.getElementById("loading_collocation-requests").removeAttribute("hidden");
    document.getElementById("noUser-requests").setAttribute("hidden", "true");

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
                    appendUserTo(userData, "actual-tenants")
                });
            }

            document.getElementById("loading_collocation-actual").setAttribute("hidden", "true");
        } else {
            const error = result.content;
            console.error('Error:', error); //FIX SHOW ERROR
        }
    }).catch((error) => {
        console.error('Error:', error); //FIX SHOW ERROR
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
                    appendUserTo(userData, "requests-users")
                });
            }

            document.getElementById("loading_collocation-requests").setAttribute("hidden", "true");
        } else {
            const error = result.content;
            console.error('Error:', error); //FIX SHOW ERROR
        }
    }).catch((error) => {
        console.error('Error:', error); //FIX SHOW ERROR
    });

}

function appendUserTo(userData, appendTo){
    document.getElementById(appendTo).innerHTML += `
    <div class="userPreview">
        <div class="uP-userImage">
            <img src="https://localhost:8080/users/profilPicture/${userData._id}"/>
        </div>
        <div class="uP-userName">
            <h2>${userData.firstname} ${userData.lastname}</h2>
        </div>
        <div class="uP-userBtns">
            <a href="/user/${userData._id}">Voir le profil</a>
            <button class="delete" onClick="removeUserFromCollocation('${userData._id}')">Enlever</button>
        </div>
    </div>
    `;
}

function closeModal(modalID){
    document.getElementById("modalContainer").setAttribute("hidden", "true");
    document.getElementById(modalID).setAttribute("hidden", "true");
}