let GLOBAL_map = undefined;
let GLOBAL_markers = [];

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 50.66786525392885, lng: 4.611996765955197},
      zoom: 15,
      mapId: 'ed8c19bcbd068fe3',
      disableDefaultUI: true,
    }); 
    
    GLOBAL_map = map;

}

const cutString = (val, max) => {
    /*
        DEF  : On renvoie une version coupé du paramètre val de longueur maximale max caractère
        PRE  : string (any) | max (number)
        POST : string
    */
    try {
        let string = val.toString();
        return string.slice(0,max);
    } catch {
        return "UNKNOWN";
    }
}

const filtersTab = document.getElementById("filtersTab");
const resultsTab = document.getElementById("resultsTab");

function openFiltersTab(){
    filtersTab.setAttribute("visible", "true");
    resultsTab.setAttribute("visible", "false");
}

function closeFiltersTab(){
    filtersTab.setAttribute("visible", "false");
    resultsTab.setAttribute("visible", "true");
}

setTimeout(search, 100);

const resultsContainer = document.getElementById("kotsPreviewsContainer");
const noKotFoundForFilters = document.getElementById("noKotFoundForFilters");
const loaderKotsPreview = document.getElementById("loaderKotsPreview");

async function search(){

    resetMarkers();

    closeFiltersTab();

    noKotFoundForFilters.setAttribute("hidden", "true");
    loaderKotsPreview.removeAttribute("hidden");

    const previousKotPreviews = resultsContainer.querySelectorAll(".kotPreview");
    if(previousKotPreviews && previousKotPreviews.length > 0){
        previousKotPreviews.forEach(previousKotPreview => {
            previousKotPreview.remove();
        });
    }

    const text_search       = document.querySelector("input[name='text_search']").value;
    const minValue          = document.querySelector("input[name='minValue']").value;
    const maxValue          = document.querySelector("input[name='maxValue']").value;
    const postedsince       = document.querySelector("input[name='postedsince']").value;
    const localisation      = document.querySelector("input[name='localisation']").value;
    const isOpen            = document.querySelector("input[name='isOpen']").value;
    const nbbedrooms        = document.querySelector("input[name='nbbedrooms']").value;
    const nbbathrooms       = document.querySelector("input[name='nbbathrooms']").value;
    const type              = document.querySelector("input[name='type']").value;
    const surfacemin        = document.querySelector("input[name='surfacemin']").value;
    const nbparking         = document.querySelector("input[name='nbparking']").value;
    const petfriendly       = document.querySelector("input[name='petfriendly']").value;

    await fetch('https://localhost:8080/api/search/', {
        method: 'post',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            text_search: text_search,
            minValue: minValue,
            maxValue: maxValue,
            postedsince: postedsince,
            localisation: localisation,
            isOpen: isOpen,
            nbbedrooms: nbbedrooms,
            nbbathrooms: nbbathrooms,
            type: type,
            surfacemin: surfacemin,
            nbparking: nbparking,
            petfriendly: petfriendly
        }),
    })
    .then(response => response.json())
    .then(result => {
        const status = result.status;
        if(status==="OK"){
            const searchResults = result.content;
            if(searchResults.length===0){
                noKotFoundForFilters.removeAttribute("hidden");
            } else {
                searchResults.forEach(result => {
                    appendKot(result.kot, result.kotTags);
                    addMarker(
                        result.kot.location.lat,
                        result.kot.location.lng,
                        result.kot.title,
                        result.kot._id
                    )
                });
            }
            loaderKotsPreview.setAttribute("hidden", "true");
        } else {
            loaderKotsPreview.setAttribute("hidden", "true");
            const error = result.content;
            console.error('Error:', error); 
        }
    }).catch((error) => {
        console.error('Error:', error); 
    });


}

function resetMarkers(){
    GLOBAL_markers.forEach(marker => {
        marker.setMap(null);
    });
    GLOBAL_markers = [];
}

function appendKot(kot, kotTags){

    const newUIKot = document.createElement('div');

    newUIKot.setAttribute("class", "kotPreview");
    newUIKot.setAttribute("kotID", kot._id);
    newUIKot.setAttribute("kotTitle", kot.title);
    newUIKot.setAttribute("kotMainPictureName", kot.mainPictureName);
    newUIKot.setAttribute("kotAddress", kot.location.address);
    newUIKot.setAttribute("kotDescription", cutString(kot.description, 250));
    newUIKot.setAttribute("kotNbbedrooms", kot.bedrooms.toString());
    newUIKot.setAttribute("kotNbbathrooms", kot.bathrooms.toString());
    newUIKot.setAttribute("kotIsOpen", kot.isOpen.toString());
    newUIKot.setAttribute("kotIsCollocation", kot.isCollocation.toString());
    newUIKot.setAttribute("kotIsNew", kotTags.new);
    newUIKot.setAttribute("kotIsUserOwner", kotTags.owner);
    

    newUIKot.setAttribute("onClick", `selectKotPreview('${kot._id}', ${kot.location.lat}, ${kot.location.lng})`);

    ////// Left side

    const leftSide = document.createElement('div');
    leftSide.setAttribute("class", "leftSide");
    
    // Image
    const kotImage = document.createElement('img');
    kotImage.src = "https://localhost:8080/users/kots/images/" + kot._id + "_" + kot.mainPictureName;

    // Compiling

    ////// Right side

    const rightSide = document.createElement('div');
    rightSide.setAttribute("class", "rightSide");

    // Text
    const kotTitle = document.createElement('h1');
    kotTitle.innerHTML = kot.title;

    const kotDescription = document.createElement('p');
    kotDescription.innerHTML = cutString(kot.description, 75) + "...";

    const kotPrice = document.createElement('h2');
    kotBasePrice = document.createElement('b');
    kotBasePrice.innerHTML = kot.basePrice + "€";
    kotChargePrice = document.createElement('i');
    kotChargePrice.innerHTML = `+ ${kot.chargePrice}€`;
    kotPrice.appendChild(kotBasePrice);
    kotPrice.appendChild(kotChargePrice);

    // Buttons

    // Compiling
    leftSide.appendChild(kotImage);

    rightSide.appendChild(kotTitle);
    rightSide.appendChild(kotDescription);
    rightSide.appendChild(kotPrice);

    ////// Compiling left & right sides

    newUIKot.appendChild(leftSide);
    newUIKot.appendChild(rightSide);
    
    resultsContainer.appendChild(newUIKot);

}

function addMarker(lat, lng, title, id) {
    var marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: lng
        },
        title: title,
        icon: "https://i.postimg.cc/Tw7nvYzj/map-point-google-map-marker-gif-11562858751s4qufnxuml-1-1.png"
    });

    marker.addListener("click", () => {
        selectKotPreview(id, lat, lng);
        infowindow.open(GLOBAL_map, marker);
    });


    var infowindow = new google.maps.InfoWindow({
        content: title
    });

    GLOBAL_markers.push(marker);
    marker.setMap(GLOBAL_map);
}

function selectKotPreview(id, lat, lng) {
    const previouslyFocusedKotPreview = resultsContainer.querySelector(".kotPreview[focused='true']");
    if(previouslyFocusedKotPreview) previouslyFocusedKotPreview.removeAttribute("focused");

    const elementToScrollTo = resultsContainer.querySelector(`.kotPreview[kotid='${id}']`);
    if(elementToScrollTo){
        changeSelectedKotPreview(elementToScrollTo);
        GLOBAL_map.panTo({
            lat: lat,
            lng: lng
        }); 
        elementToScrollTo.setAttribute("focused", "true");
        resultsContainer.scroll({
            top: elementToScrollTo.offsetTop - 150, 
            left: 0, 
            behavior: 'smooth' 
        });
    }
}

function changeSelectedKotPreview(kotElement) {

    const selectedKotPreview = document.getElementById("selectedKotPreview");

    const kot = {
        _id: kotElement.getAttribute("kotID"),
        title: kotElement.getAttribute("kotTitle"),
        address: kotElement.getAttribute("kotAddress"),
        mainPictureName: kotElement.getAttribute("kotMainPictureName"),
        description: kotElement.getAttribute("kotDescription"),
        bedrooms: kotElement.getAttribute("kotNbbedrooms"),
        bathrooms: kotElement.getAttribute("kotNbbathrooms"),
        isOpen: kotElement.getAttribute("kotIsOpen")==="true",
        isCollocation: kotElement.getAttribute("kotIsCollocation")==="true",
        isNew: kotElement.getAttribute("kotIsNew"),
        isUserOwner: kotElement.getAttribute("kotIsUserOwner")
    }
    
    selectedKotPreview.setAttribute("pop", "true");

    document.getElementById("sKP_title").innerHTML = kot.title;
    document.getElementById("sKP_address").innerHTML = kot.address;
    document.getElementById("sKP_image").src = "https://localhost:8080/users/kots/images/" + kot._id + "_" + kot.mainPictureName;
    document.getElementById("sKP_description").innerHTML = kot.description + ((kot.description.length === 250) ? "..." : "");
    document.getElementById("sKP_bedrooms").innerHTML = kot.bedrooms + " " + (parseInt(kot.bedrooms) > 1 ? "chambres" : "chambre");
    document.getElementById("sKP_bathrooms").innerHTML = kot.bathrooms + " " + (parseInt(kot.bathrooms) > 1 ? "salles de bain" : "salle de bain");
    document.getElementById("sKP_availability").innerHTML = kot.isOpen ? "Disponible" : "Indisponible";
    document.getElementById("sKP_isCollocation").innerHTML = kot.isCollocation ? "Colocation" : "Pas une colocation";
    document.getElementById("sKP_link").href = "https://localhost:8080/kot/profile/" + kot._id;
    selectedKotPreview.setAttribute("kotSelected", kot._id.toString());

    if(kot.isNew==="true"){
        document.getElementById("sKP_tag_new").removeAttribute("hidden");
    } else {
        document.getElementById("sKP_tag_new").setAttribute("hidden", "true");
    }

    if(kot.isUserOwner==="true"){
        document.getElementById("sKP_tag_owner").removeAttribute("hidden");
    } else {
        document.getElementById("sKP_tag_owner").setAttribute("hidden", "true");
    }

    setTimeout(() => {
        selectedKotPreview.removeAttribute("pop");
    }, 250)
}
