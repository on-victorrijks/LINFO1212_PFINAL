export const ERRORS = {
    "EXAMPLE": {
        type: "client",
        importance: "error", /* {error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5} */
        title: "",
        description: "",
        redirectTo: "",
        buttons: [
            {
                title: "Button1_title",
                action: {
                    type: "redirect",
                    redirectTo: "/"
                }
            }
        ]
    },
    "CONNECTION_NEEDED": {
        type: "client",
        importance: "silly",
        title: "Veuillez vous connectez",
        description: "Une connexion est nécessaire pour accéder à cette page",
        redirectTo: "/login",
        buttons: []
    },
    "ALREADY_CONNECTED": {
        type: "client",
        importance: "silly",
        title: "Vous êtes connecté",
        description: "Vous êtes déja connecté / Vous ne pouvez pas effectuer cette action en étant connecté",
        redirectTo: "/",
        buttons: [
            {
                title: "Se déconnecter",
                action: {
                    type: "redirect",
                    redirectTo: "/disconnect"
                }
            },
        ]
    },
    "CONVERSATION_INCORRECT": {
        type: "client",
        importance: "silly",
        title: "Code de conversation incorrect",
        description: "Le code de conversation donné n'est pas correct",
        redirectTo: "/login"
    },
    "ALREADY_IN_CONVERSATION": {
        type: "client",
        importance: "silly",
        title: "Déja dans la conversation",
        description: "Vous faites déja parti de cette conversation",
        redirectTo: "/conversations"
    },
    "SERVICE_ERROR": {
        type: "server",
        importance: "error",
        title: "Erreur mongoDB",
        description: "Requête DB non conclue",
        redirectTo: "/"
    },
    "BAD_KOTID": {
        type: "client",
        importance: "silly",
        title: "Mauvais code de kot",
        description: "Le code de kot donné n'est pas correct",
        redirectTo: "/"
    },
    "BAD_USERID": {
        type: "client",
        importance: "silly",
        title: "Mauvais code de l'utilisateur",
        description: "Le code de l'utilisateur donné n'est pas correct",
        redirectTo: "/"
    },
    "NOT_LANDLORD": {
        type: "client",
        importance: "silly",
        title: "Vous n'êtes pas un propriétaire",
        description: "Le type de compte n'est pas celui requis pour effectuer cette action.",
        redirectTo: "/"
    },
    "NOT_RESIDENT": {
        type: "client",
        importance: "silly",
        title: "Vous n'êtes pas un résident",
        description: "Le type de compte n'est pas celui requis pour effectuer cette action.",
        redirectTo: "/"
    },
    "NOT_CREATOR": {
        type: "client",
        importance: "silly",
        title: "Vous n'êtes pas le créateur de ce contenu",
        description: "Pour pouvoir modifier ce contenu vous devez en être le créateur",
        redirectTo: "/"
    },
    "OWN_ACCOUNT": {
        type: "client",
        importance: "silly",
        title: "",
        description: "",
        redirectTo: "/account"      
    },
    "UNKNOWN_ERROR": {
        type: "server",
        importance: "error",
        title: "Une erreur inattendue est survenue",
        description: "Veuillez nous excusez de ce contre-temps, nous travaillons à résoudre ce problème au plus vite",
        redirectTo: "/",
        buttons: []
    },
    "ALREADY_ASKEDTOJOIN": {
        type: "client",
        importance: "silly",
        title: "Vous avez déja introduit une demande pour rejoindre ce kot",
        description: "",
        redirectTo: "/",
        buttons: []
    },
    "BAD_USERIDASKTOJOIN": {
        type: "client",
        importance: "silly",
        title: "L'utilisateur que vous avez choisi d'ajouter n'a pas demandé à rejoindre votre",
        description: "",
        redirectTo: "/",
        buttons: []
    },
    "MAX_TENANTS_REACHED": {
        type: "client",
        importance: "silly",
        title: "Le nombre maximum de colocataires a été atteint",
        description: "",
        redirectTo: "/",
        buttons: [] 
    },
    "ALREADY_IN_TENANTS": {
        type: "client",
        importance: "silly",
        title: "Vous êtes déja dans les colocataires de ce kot",
        description: "",
        redirectTo: "/",
        buttons: [] 
    },
    "NO_PROFILPIC": {
        type: "client",
        importance: "silly",
        title: "Vous devez uploader une image valable pour changer de photo de profil",
        description: "",
        redirectTo: "/account/settings",
        buttons: [] 
    },
    "EMAIL_IN_USE": {
        type: "client",
        importance: "silly",
        title: "Cette adresse email est déja utilisée",
        description: "",
        redirectTo: "/register",
        buttons: [] 
    },
    "BAD_CREDENTIALS": {
        type: "client",
        importance: "silly",
        title: "Les informations de connexion ne sont pas correctes",
        description: "",
        redirectTo: "/login",
        buttons: [] 
    }
}
