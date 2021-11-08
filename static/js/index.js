function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 50.66786525392885, lng: 4.611996765955197},
      zoom: 15,
      mapId: 'ed8c19bcbd068fe3',
      disableDefaultUI: true,
    }); 

    for (let index = 0; index < 15; index++) {
        add = (0.5 - Math.random())/25;
        add2 = (0.5 - Math.random())/25;
        const marker = new google.maps.Marker({
            position: {lat: 50.66786525392885 + add, lng: 4.611996765955197 + add2},
            map: map,
            icon: "https://i.postimg.cc/Tw7nvYzj/map-point-google-map-marker-gif-11562858751s4qufnxuml-1-1.png"
        });
    }
    
}

let openedSelectorPointer = undefined;

document.querySelectorAll(".customSelector").forEach(selector => {
    selector.addEventListener("click", (event) => {
        if ([selector.querySelector(".elements"), ...selector.querySelectorAll(".element")].includes(event.target)) ;

        const isOpened = selector.getAttribute("opened")==="true";
        if(isOpened){
            selector.querySelector(".elements").setAttribute("style", "display:none;");
            selector.setAttribute("opened", "false");
        } else {
            if(openedSelectorPointer) {
                openedSelectorPointer.querySelector(".elements").setAttribute("style", "display:none;");
                openedSelectorPointer.setAttribute("opened", "false");
            }
            selector.querySelector(".elements").setAttribute("style", "display:block;");
            selector.setAttribute("opened", "true");
            openedSelectorPointer = selector;
        }
    });

    selector.querySelectorAll(".element").forEach(option => {
        option.addEventListener("click", (event) => {
            const value = option.getAttribute("value");
            const label = option.innerHTML;
            selector.querySelector("#res h2").innerHTML = label;
            selector.querySelector("input").value = value;
        });
    })
})