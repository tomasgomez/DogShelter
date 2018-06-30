Prerequisites:
- Node.js
- CouchDB

To run the application, follow these steps:
(1) Start CouchDB (for arch-like OS, use 'systemctl start couchdb');
(2) Open the file 'database/dbconfig.json' and change the 'auth' property to use one of your admin users in CouchDB. If you don't have any admin user, just remove the 'auth' property and leave the json file with an empty object '{}';
(3) If you haven't installed the project yet, use 'npm install' to install the project dependencies;
(4) At last, start the appplication using 'node server.js'. You can also install 'nodemon' and use it to start the app with 'nodemon server.js'; with nodemon, the app will be restarted at every change to one of the project files.

Extra:
- The app will be started at "127.0.0.1:3000".
- You can consult CouchDB document stores using Fauxton. Just access "127.0.0.1:5984/_utils". 
