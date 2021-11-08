document.getElementById("mobileOpen").addEventListener("click", (e) => {
    document.getElementById("menu").setAttribute("mobileHidden", "false");
    document.getElementById("mobileClose").setAttribute("hidden", "false");
    document.getElementById("mobileOpen").setAttribute("hidden", "true");
});

document.getElementById("mobileClose").addEventListener("click", (e) => {
    document.getElementById("menu").setAttribute("mobileHidden", "true");
    document.getElementById("mobileClose").setAttribute("hidden", "true");
    document.getElementById("mobileOpen").setAttribute("hidden", "false");
});