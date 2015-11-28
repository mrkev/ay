# ay

Simple file sharing/browsing static server, built with react.

Features:
 - Automatic display of READMEs.
 - Dropbox. Select a folder where users can upload to.

## Running

Currently you need to run with babel. Will add the dependency and a script command later.

    babel-node main.jsx

## Configuring 

Edit `~/.ay` to configure. Available options:

    basedir=/some/path                'directory to share.   default: cwd of directory ay was first launched from'
    port=8080                         'http port to serve.   default: 8080
    updir=./path/relative/to/basedir  'optional dropbox dir. default: none.


