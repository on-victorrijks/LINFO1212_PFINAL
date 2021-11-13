function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 50.66786525392885, lng: 4.611996765955197},
      zoom: 17,
      mapId: 'ed8c19bcbd068fe3',
      disableDefaultUI: true,
    }); 


    const kot_lat = parseFloat(document.getElementById("kot_localisation_lat").value);
    const kot_lng = parseFloat(document.getElementById("kot_localisation_lng").value);

    const markerKot = new google.maps.Marker({
        position: {lat: kot_lat, lng: kot_lng},
        map: map,
        icon: "https://i.postimg.cc/6phnCM88/marker-house.png",
        title: "Emplacement du kot"
    });

    google.maps.event.addListener(markerKot, 'click', function() {
        infowindow.open(map,markerKot);
    });

    var infowindow = new google.maps.InfoWindow({
        content: "<b>Emplacement du kot</b>"
    });

    /*
    URL:
    classic: https://i.postimg.cc/6phnCM88/marker-house.png
    bus: https://i.postimg.cc/9Q2y46Q3/marker-bus.png
    train: https://i.postimg.cc/fbTXCYdB/marker-train.png
    shop: https://i.postimg.cc/k51SpDF9/marker-store.png
    */

    const markers_imp = [
        [
            [50.66777903312153, 4.61343606729069],
            "https://i.postimg.cc/9Q2y46Q3/marker-bus.png",
            "Gare des bus"
        ],
        [
            [50.67032643665018, 4.616698531028742],
            "https://i.postimg.cc/fbTXCYdB/marker-train.png",
            "Gare des trains"
        ],
        [
            [50.66276086639546, 4.613575403141303],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "ALDI"
        ],
        [
            [50.66423190249202, 4.610174716354309],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Pres de Chez Soi"
        ],
        [
            [50.66844969999999, 4.616606371160454],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Proxy des Wallons"
        ],
        [
            [50.66934729276022, 4.615002410174711],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Carrefour express Ottignies LLN"
        ],
        [
            [50.66971390069966, 4.612467128832504],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Spar - Louvain-La-Neuve"
        ],
        [
            [50.67148989957029, 4.617787835578466],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Delhaize Louvain-La-Neuve"
        ],
        [
            [50.66787710021195, 4.626004222047674],
            "https://i.postimg.cc/k51SpDF9/marker-store.png",
            "Shop & Go Louvain-La-Neuve"
        ],
    ];
    

    markers_imp.forEach(imp => {
        const marker = new google.maps.Marker({
            position: {lat: imp[0][0], lng: imp[0][1]},
            map: map,
            icon: imp[1],
            title: imp[2]
        });
    
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
        });

        var infowindow = new google.maps.InfoWindow({
            content: "<b>"+imp[2]+"</b>"
        });
    });
    
}


const favBTN = document.getElementById("fav");
favBTN.addEventListener("click", (e) => {
    const isFav = favBTN.getAttribute("inFavs")==="true";
    if(isFav){
        // ask server to de-fav
    } else {
        // ask server to fav
    }
    favBTN.setAttribute("inFavs", (!isFav).toString());
});

function setCarrouselImage(index) {
    document.querySelector('.carrousel img[main="true"]').setAttribute("main", "false");
    document.querySelector('.carrousel .bubble[selected="true"]').setAttribute("selected", "false");
    document.querySelector('#carrouselImage'+index).setAttribute("main", "true");
    document.querySelector('#carrouselBubble'+index).setAttribute("selected", "true");
}