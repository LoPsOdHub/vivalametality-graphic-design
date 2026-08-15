Model in use: "TEST RUN 1903.glb" (loaded by js/main.js via GLTFLoader).

A single sneaker, exported as ~18 separately named parts (sole, tongue,
laces, eyelets, logo badges, seams, sock liner, etc.) rather than one
continuous mesh. Not all of them become hotspots: js/main.js's
filterHotspotsBySize() keeps only parts at least 40% the size of the
single largest one (CONFIG.hotspotMinSizeRatio), which drops the small
trim (eyelets, seams, small logo badges) and leaves roughly the half-dozen
major panels clickable — a shoe-sized model reads as cluttered with every
part wired up at once, however precisely each one individually tracks.
With 7 projects and about that many surviving hotspots, the project
assigned to each is close to 1:1, still just assignment order rather than
a deliberate pairing.
