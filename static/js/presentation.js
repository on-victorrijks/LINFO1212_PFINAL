document.addEventListener("scroll", animationManager);

const h = window.innerHeight;
const margin = h*0.25;
const scrollWindow = document.querySelector(".g-background");
scrollWindow.addEventListener("scroll", (event) => animationManager(event));

function animationManager(event){
    
    const scrollPositionY = scrollWindow.scrollTop;
    
    const popUpKotPreviews = document.querySelectorAll(".popUpKotPreview");
    if(popUpKotPreviews){
        if(scrollPositionY >= (h - 50 - margin)){
            popUpKotPreviews.forEach(popUpKotPreview => {
                popUpKotPreview.setAttribute("visible", "true");
            })
        } else {
            popUpKotPreviews.forEach(popUpKotPreview => {
                popUpKotPreview.removeAttribute("visible");
            })
        }
    }

    const popUpDatas = document.querySelectorAll(".popUpData");
    if(popUpDatas){
        if(scrollPositionY >= (h*2 - 100 - margin)){
            popUpDatas.forEach(popUpData => {
                popUpData.setAttribute("visible", "true");
            })
        } else {
            popUpDatas.forEach(popUpData => {
                popUpData.removeAttribute("visible");
            })
        }
    }

    const popUpMessages = document.querySelectorAll(".popUpMessage");
    if(popUpMessages){
        if(scrollPositionY >= (h*3 - 100 - margin)){
            popUpMessages.forEach(popUpMessage => {
                popUpMessage.setAttribute("visible", "true");
            })
        } else {
            popUpMessages.forEach(popUpMessage => {
                popUpMessage.removeAttribute("visible");
            })
        }
    }

    const illustration_collocation_1 = document.getElementById("illustration_collocation_1");
    const illustration_collocation_2 = document.getElementById("illustration_collocation_2");
    if(scrollPositionY >= (h*4 - 100 - margin)){
        illustration_collocation_1.setAttribute("visible", "true");
        illustration_collocation_2.setAttribute("visible", "true");
    } else {
        illustration_collocation_1.removeAttribute("visible");
        illustration_collocation_2.removeAttribute("visible");
    }

}

dynUserTypeAnimation();
setInterval(dynUserTypeAnimation, 18*1000);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dynUserTypeAnimation(){
    const types = ["vos colocataires", "vos résidents", "le propriétaire"];
    types.push(types[0]); // Pour former une boucle
    const container = document.getElementById("dynUserType");
    for (let index = 0; index < types.length; index++) {
        const type = types[index];
        
        if(container.innerHTML === type && (index + 1) < types.length){
            let i = 0;
            while(i < type.length){
                container.innerHTML = container.innerHTML.slice(0, -1);
                await sleep(100);
                i++;
            }

            await sleep(1500);

            if((index + 1) < types.length){
                nextType = types[index + 1];

                let i = 0;
                while(i < nextType.length){
                    container.innerHTML = nextType.substring(0,i+1);
                    await sleep(100);
                    i++;
                }

            }

            await sleep(1500);

        }

    }
}

function scrollToSlide(slideNumber){
    scrollWindow.scroll({
        top: h*slideNumber - 50*slideNumber, 
        left: 0, 
        behavior: 'smooth' 
    });
}

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