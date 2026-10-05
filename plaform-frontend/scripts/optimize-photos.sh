#!/usr/bin/env bash
# Génère les photos institutionnelles optimisées du site à partir des originaux
# (dossier IMAGES-GHEMIT, hors dépôt). À relancer uniquement quand la sélection
# change : les fichiers produits sont versionnés dans src/assets/photos.
#
#   ./scripts/optimize-photos.sh [chemin/vers/IMAGES-GHEMIT]
#
# Pour chaque photo : orientation EXIF appliquée, métadonnées retirées, AVIF et
# WebP en 640 / 1024 / 1600 px de large, et dimensions dans photos.json.
set -euo pipefail

SRC="${1:-$(dirname "$0")/../../IMAGES-GHEMIT}"
OUT="$(dirname "$0")/../src/assets/photos"
WIDTHS=(640 1024 1600)

S="Seminaire Septembre 2025-1-001/Seminaire Septembre 2025"
P24="PAEI 2024-1-001/PAEI 2024"
P26="PAEI 2026-1-001/PAEI 2026"
T="Table ronde GLab Sisters-1-001/Table ronde GLab Sisters"

# nom-de-sortie | fichier source
PHOTOS=(
  "seminaire-public|$S/IMG_20250927_171614_742.jpg"
  "seminaire-salle|$S/IMG_20250927_143806_113.jpg"
  "seminaire-presentation|$S/IMG_20250927_185359_944.jpg"
  "seminaire-intervenant|$S/IMG_20250927_185015_680.jpg"
  "seminaire-micro|$S/IMG_20250927_192725_562.jpg"
  "seminaire-remise|$S/IMG_20250927_192525_676.jpg"
  "seminaire-laureats|$S/IMG_20250927_193039_158.jpg"
  "seminaire-echange|$S/IMG_20250927_163146_693.jpg"
  "paei-2026-atelier|$P26/IMG_20260803_095224_577.jpg"
  "paei-2026-entretien|$P26/IMG_20260803_100700_912.jpg"
  "paei-2026-salle|$P26/IMG_20260803_095444_321.jpg"
  "paei-2024-groupe|$P24/IMG-20240217-WA0019.jpg"
  "paei-2024-promotion|$P24/IMG-20240217-WA0031.jpg"
  "glab-table-ronde|$T/IMG_20260808_113456_5.jpg"
  "glab-echanges|$T/IMG_20260808_112354_467.jpg"
)

mkdir -p "$OUT"
echo "{" > "$OUT/photos.json.tmp"
first=1
for entry in "${PHOTOS[@]}"; do
  name="${entry%%|*}"
  file="$SRC/${entry#*|}"
  base="$OUT/$name.tmp.png"
  convert "$file" -auto-orient -strip -resize "1600x1600>" "$base"
  read -r w h < <(identify -format "%w %h\n" "$base")
  for width in "${WIDTHS[@]}"; do
    [ "$width" -gt "$w" ] && continue
    convert "$base" -resize "${width}x" -quality 52 "$OUT/$name-$width.avif"
    convert "$base" -resize "${width}x" -quality 74 "$OUT/$name-$width.webp"
  done
  rm "$base"
  [ $first -eq 0 ] && echo "," >> "$OUT/photos.json.tmp"
  printf '  "%s": { "width": %s, "height": %s }' "$name" "$w" "$h" >> "$OUT/photos.json.tmp"
  first=0
  echo "✓ $name (${w}x${h})"
done
printf '\n}\n' >> "$OUT/photos.json.tmp"
mv "$OUT/photos.json.tmp" "$OUT/photos.json"
du -sh "$OUT"
