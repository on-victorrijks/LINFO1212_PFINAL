function closeAlerte() {
    const alerteBox = document.getElementById("alerte_box");
    alerteBox.remove();
}

const alertCloseBtn = document.getElementById("alert_close");
if(alertCloseBtn){
    alertCloseBtn.addEventListener("click", closeAlerte);
}