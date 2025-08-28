# Alpilles Basket Club - Galerie Photos

Ajoutez vos photos dans le dossier `pictures/` à la racine du projet.

Créez/éditez `pictures/manifest.json` pour lister les images à afficher dans le carrousel sur la page d’accueil.

Format accepté:

- Tableau de chaînes: `["match1.jpg", "match2.png"]`
- Ou tableau d’objets: `[{"src": "match1.jpg", "alt": "Match contre ..."}]`

Exemple:

```
[
  { "src": "match1.jpg", "alt": "Match 1" },
  { "src": "u15_2025-02-12.png", "alt": "U15 - 12/02/2025" },
  "tournoi-printemps.jpg"
]
```

Placez les fichiers d’images (jpg, png, webp, etc.) dans `pictures/` et mettez à jour le `manifest.json`. Le site essaiera aussi automatiquement `pictures/photo1.jpg` à `pictures/photo10.jpg` si aucun manifeste n’est présent.
