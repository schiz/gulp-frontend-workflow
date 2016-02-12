# Gulp-frontend-workflow

* Image compression 
* Image spriting (svg, png)
* Jade compilation, HTML minification
* Stylus compilation (including rupture, lost, nib), CSS minification
* Coffeescript compilation, Javascript minification
* Gzipping of html, css, js, png, svg
* Livereload (BrowserSync)
* Sourcemaps generation

Images are compressed, sprited (svg for icons, png for pics), css and js files are 
brought to a single one, to optimize server requests, and  cache one separate file
for styles / images / js for all pages of the project. All html, css, js, svg files are 
gzipped, to optimize their weight, and thus - the pageload speed.

In order to get handy code output for sprited images, I redeveloped templates,
used by spriting gulp plugins, so that both.png and svg sprited images
on the output are commented lines of jade element i, containing one common
css class for sprite-image styles, and additional specific class, the same as the 
name of sprited image file, containing styles for image positioning. 

For .png images sprite is created both for 1x and 2x screens (retina displays). Retina 
styles for sprited images are also included in specific class, added to the output 
jade i element. SVG files can be added to the project and sprited on the go, without 
necessity to restart build of the project.
