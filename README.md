# 🅿️ ParkPredict Paris - Prototype (v1.0)

## 🌍 Vision du Projet (Smart City)
À Paris, la recherche de stationnement génère une part importante du trafic urbain et des émissions de gaz à effet de serre. **ParkPredict** est une application web prédictive conçue pour les automobilistes et les collectivités.

Plutôt que de simplement lister les places existantes, l'application croise les données ouvertes de la Mairie de Paris, la météo en temps réel et un algorithme prédictif (simulé dans ce MVP) pour indiquer la **probabilité de disponibilité** d'une place. L'objectif : guider l'automobiliste de manière optimale, réduire les kilomètres "parasites" et faire respirer la ville.

---

## ✨ Fonctionnalités de la v1.0 (MVP)

Ce prototype a été développé en approche Agile pour valider la faisabilité technique du projet :

* 🗺️ **Cartographie Interactive :** Affichage de la voirie parisienne avec un fond de carte optimisé pour la lecture des données (Dark Mode).
* 📡 **Connexion OpenData :** Aspiration en temps réel des données officielles des emplacements de stationnement de la Mairie de Paris.
* 🧠 **Moteur de Prédiction (Simulation) :** Génération d'un score de probabilité (de 10% à 95%) modifiant dynamiquement la couleur de l'emplacement (Vert = Libre, Orange = Moyen, Rouge = Saturé).
* 🌤️ **Météo en Temps Réel :** Affichage de la température locale influençant le modèle comportemental des conducteurs.
* 📍 **Géocodage Inversé (Lazy Loading) :** Récupération du nom exact de la rue au moment du clic via l'API de l'État pour préserver les performances du serveur.
* 📖 **Dictionnaire des Données :** Interface modale intégrée vulgarisant le jargon de l'urbanisme (Régimes, Dispositions) pour l'utilisateur final.

---

## 🛠️ Technologies & Architectures

Ce projet est une **Web App "Front-End Only"** construite avec des technologies standards pour garantir rapidité d'exécution et portabilité lors des démonstrations.

* **Langages :** HTML5, CSS3, JavaScript (Vanilla ES6)
* **Librairie Cartographique :** [Leaflet.js](https://leafletjs.com/) (Open-source)
* **APIs Tierces consommées :**
  1. `opendata.paris.fr` : Registre des stationnements sur voie publique.
  2. `api-adresse.data.gouv.fr` : Base Adresse Nationale (Reverse Geocoding).
  3. `open-meteo.com` : Météo instantanée gratuite et sans clé d'authentification.

---

## 🚀 Installation & Démarrage

Aucune installation complexe (Node.js, bases de données) n'est requise pour lancer cette version prototype.

1. Clonez ce dépôt ou téléchargez les fichiers sources.
   ```bash
   git clone [https://github.com/votre-profil/parkpredict-paris.git](https://github.com/votre-profil/parkpredict-paris.git)
