# Dungeons & Players

## Introduction
Dungeons & Players est une plateforme innovante dédiée aux jeux de rôle (JDR), conçue pour faciliter la mise en relation entre joueurs et maîtres de jeu (Game Masters, GM).
L’objectif est de simplifier l’organisation des sessions de jeu en permettant à chaque utilisateur d’indiquer ses disponibilités. L’application proposera ensuite automatiquement la date optimale pour la prochaine session.

Fini les longues discussions pour caler une date ! Grâce à notre plateforme, vous pourrez consacrer plus de temps à la préparation de vos parties et au perfectionnement de vos stratégies.

## Fonctionnalités principales
- **Gestion des disponibilités** : Chaque utilisateur renseigne ses créneaux libres.
- **Planification automatique** : L’application propose la meilleure date en fonction des disponibilités des joueurs.
- **Gestion de groupes** : Création et gestion de groupes de jeu avec des rôles distincts (Joueur / Maître de Jeu).
- **Participation à des sessions bêta** : Un rôle @Testeurs est accessible aux volontaires souhaitant contribuer activement au développement du projet.
- **Partage de ressources** : Un canal dédié permet le partage d’outils et de liens utiles aux MJ et joueurs.

## Choix techniques
### TypeScript avec Express
Nous avons choisi TypeScript pour assurer une meilleure maintenabilité et robustesse du code, grâce à son typage statique et ses fonctionnalités avancées de développement.

Express a été retenu comme framework back-end pour sa simplicité et sa flexibilité. Il nous permet de gérer efficacement les routes et les requêtes API nécessaires au fonctionnement de la plateforme.

### Base de données avec TypeORM
Nous utilisons TypeORM pour faciliter la gestion de la base de données relationnelle. Ce choix nous permet d’avoir un code propre et organisé en utilisant les entités et les migrations pour assurer une gestion évolutive des données.

### Sécurité et authentification
L’authentification des utilisateurs est gérée via JWT (JSON Web Token) pour sécuriser les sessions et garantir un accès contrôlé aux fonctionnalités de la plateforme.

### Hébergement et déploiement
L’application sera déployée sur un serveur cloud, avec une base de données hébergée sur PostgreSQL. Nous utiliserons Docker pour assurer un environnement de développement homogène et reproductible.

## Étapes du projet
### Phase 1 : Conception et spécifications
- Définition des besoins et des fonctionnalités principales.
- Élaboration des maquettes et de l’architecture logicielle.

### Phase 2 : Développement
- Mise en place de l’environnement de développement.
- Création du back-end avec Express et TypeORM.
- Mise en place de l’authentification et de la gestion des utilisateurs.
- Développement des fonctionnalités principales (gestion des disponibilités, groupes, planification automatique).

### Phase 3 : Tests et bêta
- Tests unitaires et d’intégration.
- Lancement des sessions de bêta-test avec les volontaires.
- Recueil des retours et corrections des bugs.

### Phase 4 : Déploiement
- Mise en production et hébergement.
- Surveillance et maintenance de la plateforme.

## Contribution
Toute personne souhaitant contribuer au projet est la bienvenue ! Pour participer en tant que testeur, il suffit de rejoindre une session de bêta annoncée sur notre canal dédié.

## Contact
Pour toute question ou suggestion, n’hésitez pas à nous contacter via notre serveur Discord ou notre forum officiel.

Rejoignez-nous et facilitez l’organisation de vos sessions de JDR ! 🎲🔥

