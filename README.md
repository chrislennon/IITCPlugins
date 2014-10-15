IITCPlugins
===========

Some Plugins I have been tweaking/hacking/building for IITC &amp; Ingress


What is here
===========
Includes 2 modified plugins (originals available here - http://iitc.jonatkins.com/release/plugins/)

portals-list.user.js
fly-links.user.js


The modifications that were made was to limit the 'workable area' of the plugins by limiting the data set to the interior of a polygon.

This was achieved by using DrawTools (http://iitc.jonatkins.com/release/plugins/draw-tools.user.js).


What it does
===========

Requires Draw Tools.
After drawing a draw tools polygon the plugins should function as originally designed except with the restriction that they only use portals within the defined area.

Polygon-Portal-List, will provide a link (next to portals list) named "Polygon List", this will provide a pop up dialog of the portals in that defined area.

Polygon-Fly-Links, will provide the same cool functionality that flylinks does, however it should be limited to the defined polygon area

Bugs
===========
Yeah... so i cheated, on multiple counts... 
1 - In essence (and primarily out of laziness) the original plugins were renamed (and namespace to allow loading of both plugins), i did no real work to improve the existing code.
2 - The polygons are not true polygons. Currently it uses draws a rectangle around the polygon and uses that for easy coordinate comaprison. This can be fixed by using a raycasting method, this has been on my todo list for a while...