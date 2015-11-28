import fs from 'fs';
import path from 'path';
import hcfg from 'home-config'

const config = hcfg.load('.ay');

const get_path = (basedir, fpath) => {
  let uri = path.resolve.apply(this, [basedir, '.' + fpath]);
  let fst = fs.statSync(uri);
      fst.name = '.'
      fst.path = fpath;
      fst.full_path = uri;
      fst.is_dir = fst.isDirectory();

  let puri = path.resolve.apply(this, [basedir, fpath, '..']);
  let pfst = fs.statSync(uri);
      pfst.name = '..'
      pfst.path = path.resolve(fpath, '..');
      pfst.full_path = puri;
      pfst.is_dir = pfst.isDirectory();


  if (!fst.isDirectory()) throw new Error('NOT A DIR' + uri);

  const dat = fs.readdirSync(uri)
                .map(x => {
                  let xuri = path.resolve.apply(this, [uri, x]);
                  let stat = fs.statSync(xuri);
                      stat.name = x;
                      stat.path = path.resolve.apply(this, [fpath, x]);;
                      stat.full_path = xuri;
                      stat.is_dir = stat.isDirectory();
                  return (stat.name.charAt(0) === '.') ? null : stat;
                })
                .filter(x => !!x) // below: XOR ? 0 / -1
                .sort((x, y) => (x.is_dir ? !y.is_dir : y.is_dir) ? (-2*x.is_dir)+1 : x.mtime - y.mtime)
  
  if (fpath.length != 0) dat.unshift(pfst);
  dat.unshift(fst);

  return dat;
}

const get_readme = (cont) => {
  let rmi = cont.filter(x => x.name === 'README.md');
  if (rmi.length < 1) return '';
  return fs.readFileSync(rmi[0].full_path, 'utf-8');
}


/*{ dev: 16777220,
    mode: 16877,
    nlink: 7,
    uid: 501,
    gid: 20,
    rdev: 0,
    blksize: 4096,
    ino: 60165487,
    size: 238,
    blocks: 0,
    atime: Thu Nov 26 2015 17:52:31 GMT-0500 (EST),
    mtime: Thu Nov 26 2015 17:11:09 GMT-0500 (EST),
    ctime: Thu Nov 26 2015 17:11:09 GMT-0500 (EST),
    birthtime: Thu Nov 26 2015 16:54:07 GMT-0500 (EST),
    name: 'node_modules',
    path: '/Users/Kevin/Desktop/untitled folder/node_modules',
    is_dir: true }*/


//////////////////////////////////// REACT. ////////////////////////////////////

import React, { PropTypes } from 'react';
import pretty from 'prettysize';

const path_equal = (a, b) => {
  a = path.normalize(a);
  b = path.normalize(b);
  if (a.charAt(0) !== '/') a = '/' + a;
  if (b.charAt(0) !== '/') b = '/' + b;
  return a === b;
}

function FileBrowser({ basedir, dirpath, uploaded }) {
  const cont = get_path(basedir, dirpath);
  const rdme = get_readme(cont);
  const umsg = (uploaded === 'undefined') ? null
        : <b><pre>
          Thanks! We'll check out {uploaded} and add it to the library.
          </pre></b>;
  const dnbx = (!path_equal(config.updir, dirpath)) ? null
        : <form id="uploadForm"
                encType="multipart/form-data"
                enctype="multipart/form-data"
                action="/upload"
                method="post">
            <h4>Upload a file:</h4><pre>
            <label for="userfiles">Files:  </label>
            <input type="file" id="userfiles" name="userfiles" required/>
            <input type="submit" value="Share!" /><br/>
            <label for="donor">Donor:  </label>
            <input type="text" id="donor" name="donor" placeholder="optional" />
            </pre>
          </form>;

  let back = cont.filter(x => x.name === '..')[0]
      back = !back || dirpath == '/' ? null
      : <a href={back.path} style={{textDecoration: 'none'}}>⬅️</a>

  return (
    <div>
      {umsg}
      <h2>{back} {dirpath}</h2>
      <pre>{rdme}</pre>
      {dnbx}
      <ul>
        {cont.map(x => {
          const sze = (x.is_dir) ? null
                : <i style={{fontFamily: 'monospace', color: 'gray'}}> ({pretty(x.size)})</i>;
          return <li style={{listStyleType: x.is_dir ? 'circle' : 'auto'}}>
            {(x.name === uploaded) ? 
              <b><a href={x.path}>{x.name}</a></b>
            : <a href={x.path}>{x.name}</a>}
          </li>
        })}
      </ul>
    </div>
  );
}

FileBrowser.propTypes = {
  basedir: PropTypes.string.isRequired,
  dirpath: PropTypes.string.isRequired,
  uploaded: PropTypes.string,
};

export default FileBrowser;