var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');

var config = require('./config');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: String,
  displayName: String,
  picture: String,
  bitbucket: String,
  google: String,
  github: String,
  live: String
});

var devicesSchema = new mongoose.Schema({
  device_name: String,
  device_type: String,
  device_sn: String,
  device_manufacturer: String,
  device_model: String,
  sw_version: String,
  screen_resolution: String,
  device_ram: String,
  checked_out_user: String
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);
var Devices = mongoose.model('Devices', devicesSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function(err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on production
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, '../source')));


/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, res) {
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email and/or password' });
      }
      res.send({ token: createJWT(user) });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    var user = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password,
      role: 'Deactivated'
    });
    user.save(function(err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: createJWT(result) });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
app.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
          var user = new User();
          user.google = profile.sub;
          user.picture = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          user.role = 'Deactivated';
          user.save(function(err) {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */
app.post('/auth/github', function(req, res) {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GITHUB_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
    accessToken = qs.parse(accessToken);
    var headers = { 'User-Agent': 'Satellizer' };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.github = profile.id;
            user.picture = user.picture || profile.avatar_url;
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ github: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.github = profile.id;
          user.picture = profile.avatar_url;
          user.displayName = profile.name;
          user.role = 'Deactivated';
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Bitbucket
 |--------------------------------------------------------------------------
 */
app.post('/auth/bitbucket', function(req, res) {
  var accessTokenUrl = 'https://bitbucket.org/site/oauth2/access_token';
  var userApiUrl = 'https://bitbucket.org/api/2.0/user';
  var emailApiUrl = 'https://bitbucket.org/api/2.0/user/emails';

  var headers = {
    Authorization: 'Basic ' + new Buffer(req.body.clientId + ':' + config.BITBUCKET_SECRET).toString('base64')
  };

  var formData = {
    code: req.body.code,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post({ url: accessTokenUrl, form: formData, headers: headers, json: true }, function(err, response, body) {
    var params = {
      access_token: body.access_token
    };

    // Step 2. Retrieve information about the current user.
    request.get({ url: userApiUrl, qs: params, json: true }, function(err, response, profile) {

      // Step 2.5. Retrieve current user's email.
      request.get({ url: emailApiUrl, qs: params, json: true }, function(err, response, emails) {
        var email = emails.values[0].email;

        // Step 3a. Link user accounts.
        if (req.header('Authorization')) {
          User.findOne({ bitbucket: profile.uuid }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Bitbucket account that belongs to you' });
            }
            var token = req.header('Authorization').split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.bitbucket = profile.uuid;
              user.email = user.email || email;
              user.picture = user.picture || profile.links.avatar.href;
              user.displayName = user.displayName || profile.display_name;
              user.save(function() {
                var token = createJWT(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ bitbucket: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = createJWT(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.bitbucket = profile.uuid;
            user.email = email;
            user.picture = profile.links.avatar.href;
            user.displayName = profile.display_name;
            user.role = 'Deactivated';
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });
});


//endpoint for add device
app.post('/savedevices',function(req,res) {
    Devices.create({
        device_name : req.body.device_name,
        device_type : req.body.device_type,
        device_sn : req.body.device_sn,
        device_manufacturer : req.body.device_manufacturer,
        device_model : req.body.device_model,
        sw_version : req.body.sw_version,
        screen_resolution : req.body.screen_resolution,
        device_ram : req.body.device_ram,
        checked_out_user : 'N/A',
        done : false
    }, function(err, devices) {
        if (err)
            res.send(err);

        // get and return all the devices after you create another
        Devices.find(function(err, devices) {
            if (err)
                res.send(err);
            res.json(devices);
        });
    });
});

//endpoint for checkout
app.post('/checkout', ensureAuthenticated, function(req, res) {
  Devices.findById(req.body.id, function(err, Devices) {
    if (!Devices) {
      return res.status(400).send({ message: 'Device not found' });
    }
    Devices.checked_out_user = req.body.checked_out_user;
    Devices.save(function(err) {
      res.status(200).end();
    });
  });
});

//endpoint for checkout
app.post('/checkindevice', ensureAuthenticated, function(req, res) {
    Devices.findById(req.body.id, function(err, Devices) {
        if (!Devices) {
            return res.status(400).send({ message: 'Device not found' });
        }
        Devices.checked_out_user = 'N/A';
        Devices.save(function(err) {
            res.status(200).end();
        });
    });
});

//endpoint for set role
app.post('/setabstractionrole', ensureAuthenticated, function(req, res) {
    User.findById(req.body.id, function(err, User) {
        if (!User) {
            return res.status(400).send({ message: 'User not found' });
        }
        User.role = req.body.role;
        User.save(function(err) {
            res.status(200).end();
        });
    });
});

//endpoint for edit device
app.post('/updatedevices', ensureAuthenticated, function(req, res) {
    Devices.findById(req.body.id, function(err, Devices) {
        if (!Devices) {
            return res.status(400).send({ message: 'Device not found' });
        }
        Devices.device_name = req.body.device_name;
        Devices.device_type = req.body.device_type;
        Devices.device_sn = req.body.device_sn;
        Devices.device_manufacturer = req.body.device_manufacturer;
        Devices.device_model = req.body.device_model;
        Devices.sw_version = req.body.sw_version;
        Devices.screen_resolution = req.body.screen_resolution;
        Devices.device_ram = req.body.device_ram;
        Devices.save(function(err) {
            res.status(200).end();
        });
    });
});

//endpoint for delete device
app.post('/deletedevice',function(req,res) {
    Devices.remove({
        _id : req.body.id
    }, function(err, devices) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Devices.find(function(err, devices) {
            if (err)
                res.send(err);
            res.json(devices);
        });
    });
});

//endpoint for delete user
app.post('/deleteuser',function(req,res) {
    User.remove({
        _id : req.body.id
    }, function(err, user) {
        if (err)
            res.send(err);

        // get and return all the users after you create another
        Devices.find(function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });
});

//gets list of devices from database
app.get('/devices',function(req,res){
        // use mongoose to get all devices in the database
        Devices.find(function(err, devices) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(devices); // return all devices in JSON format
        });
});

//gets list of users from database
app.get('/users',function(req,res){
    // use mongoose to get all users in the database
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);

        res.json(users); // return all users in JSON format
    });
});

/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.post('/auth/unlink', ensureAuthenticated, function(req, res) {
  var provider = req.body.provider;
  var providers = ['google', 'github', 'live'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

/*Create default users if not created*/
User.findOne({ email: 'nick@vynyl.com' }, function(err, existingUser) {
    if (existingUser) {
        console.log('Default Users already in Database Skipping!');
    }
    var user = new User({
        displayName: 'Nick Crabbs',
        email: 'nick@vynyl.com',
        password: 'GridL0ckd',
        role: 'Admin'
    });
    user.save(function(err, result) {
        if (err) {
            console.log('Error adding default user to database!');
        }
        console.log('Created Default user successfully');
    });
});
