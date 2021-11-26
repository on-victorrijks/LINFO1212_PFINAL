
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