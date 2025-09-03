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

## Optimisation des images

Pour garantir un chargement rapide du site, il est crucial d'optimiser les images avant de les ajouter. Des images trop lourdes peuvent ralentir considérablement la page.

**Quelques conseils :**

- **Redimensionnez les images :** Inutile d'utiliser des images de 4000px de large. Une largeur de 1200px est souvent suffisante pour le web.
- **Compressez les images :** Utilisez des outils en ligne ou des logiciels pour réduire le poids des fichiers sans trop perdre en qualité.

**Outils recommandés :**

- [TinyPNG](https://tinypng.com/) (pour les fichiers PNG et JPG)
- [Squoosh](https://squoosh.app/)
- [ImageOptim](https://imageoptim.com/mac) (pour macOS)
