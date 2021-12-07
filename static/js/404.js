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