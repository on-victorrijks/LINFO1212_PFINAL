const addPicturesGallery = document.getElementById("addPictures-gallery");
const picturesInput = document.getElementById("pictures-input");
const mainPictureNameInput = document.getElementById("mainPictureName");
const binInput = document.getElementById("binNames");

function switchBinStatus(toDelName, divID){
    const isInBin = document.getElementById(divID).hasAttribute("inBin");
    const storedName = "|"+toDelName;
    if(isInBin){
        document.getElementById(divID).removeAttribute("inBin");
        binInput.value = binInput.value.replace(storedName, "");
    } else {
        document.getElementById(divID).setAttribute("inBin", "true");
        binInput.value += storedName;
    }
}

function removeImage(toDelName, divID){
    var files = picturesInput.files; 
    var fileBuffer = new DataTransfer();

    for (let i = 0; i < files.length; i++) {
        if (files[i].name === toDelName){
            document.getElementById(divID).remove();
        } else {
            fileBuffer.items.add(files[i]);
        }
    }
    
    picturesInput.files = fileBuffer.files;
}

let previewImageID = document.getElementById("numberOfPictures").value;

function setMainPictureName(toSetMainName, divID){
    mainPictureNameInput.value = toSetMainName;
    const oldMain = document.querySelector('#addPictures-gallery .image[main="true"]');
    if (oldMain) oldMain.removeAttribute("main");
    document.getElementById(divID).setAttribute("main", "true");
}

function previewImage(event) {

    const newFiles = event.target.files;
    for (var i = 0; i < newFiles.length; i++) {

        const file = newFiles[i];

        var image = document.createElement("img");
        image.src = URL.createObjectURL(file);

        var buttonRemove = document.createElement("button");
        buttonRemove.setAttribute("type", "button");
        buttonRemove.setAttribute("class", "remove");
        buttonRemove.setAttribute("onClick", "removeImage('"+file.name+"', "+previewImageID+")");

        var buttonSetMain = document.createElement("button");
        buttonSetMain.setAttribute("type", "button");
        buttonSetMain.setAttribute("class", "setMain");
        buttonSetMain.setAttribute("onClick", "setMainPictureName('"+file.name+"', "+previewImageID+")")

        var buttonsContainer = document.createElement("div");
        buttonsContainer.setAttribute("class", "buttonsContainer");

        buttonsContainer.appendChild(buttonRemove);
        buttonsContainer.appendChild(buttonSetMain);

        var imageContainer = document.createElement("div");
        imageContainer.setAttribute("class", "image");
        imageContainer.setAttribute("id", previewImageID);
        imageContainer.appendChild(image);
        imageContainer.appendChild(buttonsContainer);

        addPicturesGallery.appendChild(imageContainer);
        previewImageID += 1;

    }
};

const searchLocalisationField = document.getElementById("searchLocalisationField");
const searchLocalisationResults = document.getElementById("searchLocalisationResults");

const searchLocalisationInputAddress = document.getElementById("localisation_address");
const searchLocalisationInputLat = document.getElementById("localisation_lat");
const searchLocalisationInputLng = document.getElementById("localisation_lng");

document.getElementById("searchLocalisationButton").addEventListener("click", searchLocalisation);
document.getElementById("modify_btn").addEventListener("click", (e) => {
    if(
        searchLocalisationInputAddress.value!=="" &&
        searchLocalisationInputLat.value!=="" &&
        searchLocalisationInputLng.value!==""
    ){
        document.getElementById("modifyKotForm").submit();
    } else {
        document.getElementById("form-alert").removeAttribute("hidden");
        document.getElementById("form-alert-message").innerHTML = "Veuillez spécifier une adresse valide";
        document.querySelector(".g-background").scrollTo(0,0);
    } 
});

async function searchLocalisation() {
    const value = searchLocalisationField.value;

    if(value!==""){

        const url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBvHIznYCzznbkXRcZOt4MuvKxthkGcaSU&region=be&address="+value+" LLN";

        searchLocalisationResults.innerHTML = "Recherche..."

        fetch(url)
        .then(response => response.json())
        .then(data => {
            const status = data.status;
            if(status==="OK"){
                const results = data.results;
                if(results.length >= 1){
                    const formatted_address = results[0]["formatted_address"];
                    const lat = results[0]["geometry"]["location"]["lat"];
                    const lng = results[0]["geometry"]["location"]["lng"];

                    searchLocalisationInputAddress.value = formatted_address;
                    searchLocalisationInputLat.value = lat;
                    searchLocalisationInputLng.value = lng;

                    searchLocalisationResults.innerHTML = formatted_address
                } else {
                    searchLocalisationResults.innerHTML = "Aucun résultat trouvé"
                }
            }
        });

    }

}