# canvas-sketches

a series of sketches made with [canvas-sketch], with the intention of exporting to .svg and plotting them with an [axidraw] V3/A3 pen plotter.


[canvas-sketch]: https://github.com/mattdesl/canvas-sketch "canvas-sketch"
[axidraw]: https://axidraw.com/ "AxiDraw"

filehash in powershell:  Get-FileHash .\2019.11.08-10.21.25-0.png  -Algorithm MD5| Format-List

python -m axicli "C:\Users\stephane\Documents\GitHub\canvas-sketches\media\2020.07.22-10.04.26-1-426126.svg" -m reorder --reordering 3 -o "C:\Users\stephane\Documents\GitHub\canvas-sketches\media\2020.07.22-10.04.26-1-426126-reorder.svg"