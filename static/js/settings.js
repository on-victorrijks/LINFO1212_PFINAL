const imagePreview = document.getElementById("previewPictureProfilImage");

function previewImage(event) {

    const newFiles = event.target.files;
    
    const newlyUploadedPictureProfile = newFiles && newFiles.length>0 && newFiles[0];
    if(newlyUploadedPictureProfile){

        imagePreview.removeAttribute("hidden")
        imagePreview.src = URL.createObjectURL(newlyUploadedPictureProfile);

    }

}