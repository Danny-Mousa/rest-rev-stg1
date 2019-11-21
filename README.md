# Restaurant Reviews App

### Specification
We have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Our job is to update the code to resolve these issues while still maintaining the included functionality. So _`my job was`_ was:

 - Making the provided site _`Errors free`_.
 - Making the provided site _`fully responsive`_ with any viewport, including desktop, tablet, and mobile displays.
 - Making the site _`fully accessible`_ by `keyboard`, and by the `screen readers` using `ARIA`.
 - Caching the static site for _`offline use`_. Using _`Cache API`_ and a _`ServiceWorker`_, cache the data for the website so that any page (including images) that has been visited is accessible offline.
 - `Informing` the users when there is an _`available update`_ for this site by triggering a `notification`.

# How to run this project :
 - If you love to see the old broken version of this project before it's being fixed by me, please [click here](https://danny-mousa.github.io/mws-restaurant-stage-1/).
 - To run the project directly,please [click here](https://danny-mousa.github.io/rest-rev-stg1/).
 - For developers: the project repository is [here](https://github.com/Danny-Mousa/rest-rev-stg1).

### Project Rubric

Your project will be evaluated by a Udacity code reviewer according to the [Restaurant Reviews project rubric](https://review.udacity.com/#!/rubrics/1090/view). Please review for detailed project requirements. The rubric should be a resource you refer to periodically to make sure your project meets specifications.

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

    * In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.
   * Note -  For Windows systems, Python 3.x is installed as `python` by default. To start a Python 3.x server, you can simply enter `python -m http.server 8000`.
2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

## Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). You need to replace `<your MAPBOX API KEY HERE>` with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future-proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
