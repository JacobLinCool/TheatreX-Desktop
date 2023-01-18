#!/bin/bash

input=$1

if [ -z "$input" ]; then
    echo "Usage: icon.sh <input>"
    exit 1
fi

if [ ! -f "$input" ]; then
    echo "File not found: $input"
    exit 1
fi

outdir=$2

if [ -z "$outdir" ]; then
    outdir="./src/icons"
fi

if [ ! -d "$outdir" ]; then
    mkdir -p "$outdir"
fi

iconset="$outdir/icon.iconset"

if [ ! -d $iconset ]; then
    mkdir $iconset
fi

for size in 16 32 64 128 256 512; do
    convert "$input" -resize "${size}x${size}" "$iconset/icon_${size}x${size}.png"
    echo "Created $iconset/icon_${size}x${size}.png"

    double="$(($size * 2))"
    convert "$input" -resize "${double}x${double}" "$iconset/icon_${size}x${size}@2x.png"
    echo "Created $iconset/icon_${size}x${size}@2x.png"
done

# create .png
cp "$iconset/icon_512x512@2x.png" "$outdir/icon.png"
echo "Created $outdir/icon.png"

# create .icns
iconutil -c icns -o "$outdir/icon.icns" "$iconset"
echo "Created $outdir/icon.icns"

# create .ico
files=$(find "$iconset" -name "*.png" | grep -v "@2x" | sort -r)
convert $files "$outdir/icon.ico"
echo "Created $outdir/icon.ico"

# clean up
rm -rf "$iconset"
