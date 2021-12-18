function closeAlerte() {
    const alerteBox = document.getElementById("alerte_box");
    alerteBox.remove();
}

document.getElementById("alert_close").addEventListener("click", closeAlerte);