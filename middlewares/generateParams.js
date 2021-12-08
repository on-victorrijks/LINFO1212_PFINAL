import { PAGES_METAS } from "../data/pages_metas.js";
import { GLOBAL_language } from "../index.js";

const generatePageConfigurationObject = (pageCode) => {
    const params = {
        user: null,
        page: {
            title: "SITENAME - ",
            description: "",
            icon: "defaultIcon.png",
            keywords: "",
            copyright: "//FIX",
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

    return params
}

export const generateParams = function (req, res, next) {

    const urlWithoutGETParams = req.originalUrl.split("?")[0];
    const urlParts = urlWithoutGETParams.split("/");
    urlParts.shift(); // On enlève le premier élément " '' " causé par le split au dessus

    let pageName = urlWithoutGETParams;

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

    req.pageConfiguration = generatePageConfigurationObject(pageName);
    next()
}