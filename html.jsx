
import React, { PropTypes } from 'react';

function Html({ title, body }) {
  return (
    <html className="no-js" lang="">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: body }} />
      </body>
    </html>
  );
}

Html.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string.isRequired,
};

export default Html;
