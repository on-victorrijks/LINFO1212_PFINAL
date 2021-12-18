import { PAGES_METAS } from "../data/pages_metas.js";
import { GLOBAL_language } from "../index.js";
import { ERRORS } from "../data/errors.js";

const generatePageConfigurationObject = (pageCode, errorCode) => {
    const params = {
        user: null,
        page: {
            title: "KotKot - ",
            description: "",
            icon: "defaultIcon.png",
            keywords: "",
            copyright: "© 2021 LINFO1212, Some Rights Reserved",
            charset: "UTF-8"
        },
        menu: {
            selectedPage: {}
        },
        isResident: false,
        isLandlord: false,
    };

    const pageMetas = PAGES_METAS[GLOBAL_language][pageCode];
    if (pageMetas) {
        params.page.title       += pageMetas["title"];
        params.page.description  = pageMetas["description"];
        params.page.icon         = pageMetas["icon"];
        params.page.keywords     = pageMetas["keywords"];
        params.page.copyright    = pageMetas["copyright"];
        params.page.charset      = pageMetas["charset"];
        params.menu.selectedPage[  pageMetas["selectedPage"]  ] = true;
    }

    if(errorCode) {
        const errorMetas = ERRORS[errorCode];
        params.error = errorMetas;
    }

    return params
}

export const generateParams = function (req, res, next) {

    const urlWithoutGETParams = req.originalUrl.split("?")[0];
    const urlParts = urlWithoutGETParams.split("/");
    urlParts.shift(); // On enlève le premier élément " '' " causé par le split au dessus

    let pageName = urlWithoutGETParams;
    const errorCode = req.query.error;

    // Cas spéciaux
    /* /kot/modify/:kotID */
    if(urlParts.length >= 2 && urlParts[0]==="kot" && urlParts[1]==="modify"){
        pageName = "/kot/modify/:kotID";
    }
    /* /kot/profile/:kotID */
    if(urlParts.length >= 2 && urlParts[0]==="kot" && urlParts[1]==="profile"){
        pageName = "/kot/profile/:kotID";
    }
    /* /invitations/:convID */
    if(urlParts.length >= 1 && urlParts[0]==="invitations"){
        pageName = "/invitations/:convID";
    }
    /* /user/:userID */
    if(urlParts.length >= 1 && urlParts[0]==="user"){
        pageName = "/user/:userID";
    }

    req.pageConfiguration = generatePageConfigurationObject(pageName, errorCode);
    next()
}