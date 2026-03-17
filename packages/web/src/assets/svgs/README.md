## Logo instructions

To update logos, follow these steps

1. Export all logos from Figma into this folder. Select all logos (currently found at https://www.figma.com/design/v8kogGT3BUtJkoYVcJ3Wpc/-SDK--Stytch-UI?node-id=890-837) and use the export button on the right
2. From this folder, run these commands
3. Move the logos into separate folders

       mv *-black.svg logo-black
       mv *-white.svg logo-white
       mv *.svg logo-color

4. Run SVGR: `yarn svgr --config-file .svgrrc.mjs --out-dir .. .`
