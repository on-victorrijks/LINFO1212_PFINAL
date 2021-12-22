# LINFO1212_PFINAL
## Introduction - Projet KotKot

Dans le cadre du cours “Projet d'approfondissement en sciences informatiques”, nous avons dû créer notre propre site internet en se basant sur les fonctionnalités et technologies vues durant le projet préparatoire.

Nous avions le choix du sujet d’application mais il y avait tout de même certaines conditions à respecter. Notre site devait utiliser une base de données, il devait contenir des utilisateurs, une fonctionnalité de recherche d’informations et il devait être mis en œuvre en utilisant Node JS, HTML, CSS et MongoDB au minimum.

Après quelques réflexions, nous avons eu l’idée de créer une plateforme permettant de regrouper tous les kots de Louvain-La-Neuve. Le principe est simple : soit l’utilisateur a un compte propriétaire, ce qui lui permet de mettre en ligne des kots à louer, soit il a un compte résident et il peut chercher des kots en fonction de ses attentes. Si un kot l’intéresse, il peut contacter le propriétaire et demander à rejoindre la colocation.

## Setup
### Pour setup l'application sans aucune donnée
    npm i
    node ./index.js
    
### Pour setup l'application avec les données d'exemples
    npm i
    mongorestore -d KOTS bdd_saves/KOTS
    node ./index.js

> Si vous souhaitez aussi avoir les images d'exemple, vous devrez exctracter le contenu du fichier images.zip a la racine du projet. Le fichier images.zip se trouve dans le dossier ./bdd_saves/.

## Exécuter les tests

Après avoir setup le site vous pouvez exécuter une série de tests. 
Pour cela il vous suffit de télécharger le chromedriver correspondant à votre version de Google Chrome, trouvable à cette adresse :  https://chromedriver.chromium.org/downloads

Vous pouvez soit placer le fichier chromedriver.exe à la racine du projet soit l'ajouter à vos variables d'environnement.

Quand cette manipulation est faite, il vous suffit de lancer le site dans un terminal localisé à la racine du projet en utilisant la commande suivante :

    node ./index.js

Puis dans un second terminal, aussi localisé à la racine du projet il vous suffit d'exécuter la commande suivante :

    npm run test

Une série de tests se lancera et vous aurez dans votre second terminal un rapport.

## Explication de la structure de dossier

 - **Test_selenium** : Contient l'image de test.
 
 - **Api** : Contient la logique de chaque partie de l'API, elle appelle une function qui exécutera ce qu'elle demande et soit elle renvoie le résultat de la demande avec un status OK/ERROR, soit elle redirige l'utilisateur vers la page adéquate.

 - **bdd_saves** : Contient les données d'exemples : données d'exemple pour la base de données et images d'exemples.

 - **data** : Contient les codes d'erreurs et leurs explications et les données meta de chaque page.

 - **documentation** : Contient la documentation utilisée pendant le développement.
 
 - **errorHandler** : Contient l'errorHandler, qui permet de gérer les erreur plus proprement.

 - **fileDispatcher** : Contient les fileDispatcher, qui renvoie l'image demandée si elle existe.

 - **functions** : Contient les functions, les functions sont les plus grosses parties logiques de l'application. Elles traitent les données, exécutent les requêtes, etc.
 
 - **keys** : Contient les clés utilisées pour le protocole HTTPS. Elles sont présentes sur le GitHub temporairement et pour faciliter la remise du projet. Il est évident qu'elles ne s'y trouveraient pas sur un réel projet.

 - **middlewares** : Contient les middewares, les middlewares sont des vérificateurs/préparateur de requêtes. Ils vérifient si les données nécessaires sont là. Ils préparent les données pour que la page soit render.

 - **private** : Contient les templates html.
 
  - **protections** : Contient les les protections, par exemple, est-ce que l'utilisateur est connecté ?
 
 - **render** : Contient les fonctions de render, elles récupèrent toutes les données des middlewares et les mettent ensemble pour former la page renvoyée au client.
 
  - **static** : Contient les données statiques : js, css, images
 
  - **users** : Contient les uploads liés aux comptes
  
  - **kots** : Contient les uploads liés aux kots
 
## Crédits

Projet développé par : Guillaume Danckaert & Victor Rijks
