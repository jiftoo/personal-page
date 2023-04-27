@echo off
rm -r ./build
mkdir build
copy /Y favicon.ico build
copy /Y *.svg build
call pnpx html-minifier --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype index.html -o build/index.html
call pnpx clean-css-cli -O2 style.css > build/style.css
call pnpx terser index.js -o build/index.js

echo Done
