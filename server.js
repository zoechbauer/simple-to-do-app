let express = require('express');
let mongodb = require('mongodb');
let sanitizeHTML = require('sanitize-html');
let app = express();
let db;

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}

// define middleware for accessing static files from folder public
// you can choose whatever name you like for the folder
app.use(express.static('public'));

// TODO: change connectionString before commit to GitHub
let connectionString =
  'mongodb+srv://<user:pw_mustBeReplaced>@<cluster_mustBeReplaced>.mongodb.net/TodoApp?retryWrites=true&w=majority';
mongodb.connect(
  connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    console.log('connect err', err);
    db = client.db();
    app.listen(port);
  }
);

// define middleware for async requests as json objects
// used by axios async http requests
app.use(express.json());

// configure express that all form controls are added to a body object
// and then add the body object to the request object
// by default express does not do this.
// so it makes it very easy to access form data, eg. request.body.item
app.use(express.urlencoded({ extended: false }));

// use passwordRestricted in all http functions
app.use(passwordRestricted);

function passwordRestricted(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm = "Simple Todo App"');
  console.log('authorization: ', req.headers.authorization);
  if (req.headers.authorization == 'Basic bGVhcm46amF2YXNjcmlwdA==') {
    next();
  } else {
    res.status(401).send('Authentication required');
  }
}

app.get('/', (req, res) => {
  db.collection('items')
    .find()
    .toArray((err, items) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5">
    </ul>
    
  </div>

  <script>
    // this global variable is used from client code to render server template
    let items = ${JSON.stringify(items)}
  </script>
  
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="/browser.js"></script>
</body>
</html>
  `);
    });
});

// create item with submit and full page reload
//   input field has name = item  ==> text: req.body.item
// app.post('/create-item', (req, res) => {
//   db.collection('items').insertOne({ text: req.body.item }, err => {
//     res.redirect('/');
//   });
// });

// create item with async axios http request
//   http request data: { text: value}
app.post('/create-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  });
  db.collection('items').insertOne({ text: safeText }, (err, info) => {
    // console.log('info.ops[0]: ', info.ops[0]);
    res.json(info.ops[0]);
  });
});

app.post('/update-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  });
  db.collection('items').findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    () => res.send('success')
  );
});

app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    () => {
      res.send('success');
    }
  );
});
