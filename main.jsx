
import Html from './html';
import express from 'express';
import React from 'react'
import ReactDOM from 'react-dom/server'
import FileBrowser from './filebrowser'
import fs from 'fs';
import path from 'path';
import urlencode from 'urlencode'
import mime from 'mime'
import multer from 'multer';

import hcfg from 'home-config'

const config = hcfg.load('.ay', {
    basedir : process.cwd(),
    port    : 8080,
    updir   : ''
});
config.save();

let fup = multer({
  dest: path.resolve(config.basedir, config.updir),
  limits: {
    fieldNameSize: 50,
    files: 1,
    fields: 5,
    // fileSize: 1024 * 1024
  },

  // onFileUploadStart: function(file) {
  //     console.log('Starting file upload process.');
  //     if(file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
  //         return false;
  //     }
  // },
});
let app = express();


app.get('*', (req, res) => {

  const fpath = urlencode.decode(req.path);
  const xuri  = path.resolve.apply(this, [config.basedir, '.' + fpath]);
  const fst   = fs.statSync(xuri);

  if (fst.isDirectory()) {
    const data = {
      body: ReactDOM.renderToString(
        <FileBrowser 
          basedir={config.basedir} 
          dirpath={fpath} 
          uploaded={urlencode.decode(req.query.uploaded)} />),
      title: req.path,
    };
    const html = '<!doctype html>\n' + ReactDOM.renderToString(<Html {...data} />);
    res.send(html);
  } 


  else {
    res.writeHead(200, {'Content-Type': /*'application/octet-stream' */ mime.lookup(xuri) });
    let fstream = fs.createReadStream(xuri);
    fstream.pipe(res);
  }
});

const file_exists = (x) => { 
  try { return fs.statSync(x).isFile(); }
  catch (err) { return false; }
}

const non_duplicate = (p, d) => {
  const {dir, name, ext} = path.parse(p);
  let i = 2, new_path = dir + '/' + name + d + ext;
  while (file_exists(new_path)) {
    new_path = dir + '/' + name + d + i++ + ext;
  }
  return new_path;
}

app.post('/upload', fup.single('userfiles'), function(req, res) {
  if (!req.file || !req.file.path) return res.send('No file selected!');
  const fldonr = req.body.donor ? '[' + req.body.donor + ']' : '';
  let new_path = path.resolve(req.file.path, '..', req.file.originalname);
      new_path = non_duplicate(new_path, fldonr);
  fs.renameSync(req.file.path, new_path)
  res.redirect(config.updir + '?uploaded=' + path.basename(new_path));
})


app.listen(config.port);
