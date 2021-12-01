document.getElementById("mobileOpen").addEventListener("click", (e) => {
    openMenu();
});

document.getElementById("mobileClose").addEventListener("click", (e) => {
    closeMenu();
});

function openMenu(){
    document.getElementById("menu").setAttribute("mobileHidden", "false");
    document.getElementById("mobileClose").setAttribute("hidden", "false");
    document.getElementById("mobileOpen").setAttribute("hidden", "true");
}

function closeMenu(){
    document.getElementById("menu").setAttribute("mobileHidden", "true");
    document.getElementById("mobileClose").setAttribute("hidden", "true");
    document.getElementById("mobileOpen").setAttribute("hidden", "false");
}

const notificationsTab = document.getElementById("notificationsTab");
let isNotificationsTabVisible = false;

function switchNotificationsTabVisibility(){
    if(isNotificationsTabVisible){
        notificationsTab.setAttribute("hidden", "true");
    } else {
        notificationsTab.removeAttribute("hidden");
    }
    isNotificationsTabVisible = !isNotificationsTabVisible;
}