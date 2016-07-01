var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(methodOverride('X-HTTP-Method'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
//app.use(methodOverride('X-HTTP-Method'));

mongoose.connect('mongodb://localhost/todo_development');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Task = new Schema({
	task: String
	//task: { type: String, required: true } //Throws error indicating that no task is found when uncommented
});

var Task = mongoose.model('Task', Task);


app.use('/', routes);
app.use('/users', users);

app.get('/tasks', function(req, res){
	Task.find({}, function(err, docs){
		res.render('tasks/index', {
			title: 'Todos index view',
			docs: docs
		});
	});
});

app.get('/tasks/new', function(req, res){
	res.render('tasks/new.jade',{
		title: 'New Task'
	});
});

/*app.post('/tasks', function(req, res){
	//var task = new Task(req.body);
	var task = new Task(req.body.task); //both this task and the one above has same results
	console.log(task); //Only id is submitted without the task specified
	//var task = req.body.task; //results in 'undefined'
	task.save(function(err){
		if(!err){
			res.redirect('/tasks');
		}
		else{
			res.redirect('/tasks/new');
			console.log('Error adding task');
			console.log(err);
		}
	});
});*/

app.post('/tasks', function(req, res){
	var newTask = req.body.task;
	console.log(newTask);
	Task.create({ task: newTask }, function(err){
		if(err){
			console.log(err);
		}
		res.redirect('/tasks');
	});
});

app.delete('/tasks/:id', function(req, res){
	Task.findOne({ _id: req.params.id }, function(err, doc){
		doc.remove(function(){
			res.redirect('/tasks');
		});
	});
});

app.get('/tasks/:id/edit', function(req, res){
	Task.findById(req.params.id, function(err, doc){
		res.render('tasks/edit', {
			title: 'Edit Task View',
			task: doc
		});
	});
});

app.put('/tasks/:id', function(req, res){
	Task.findById(req.params.id, function(err, doc){
		doc.updated_at = new Date();
		//doc.task = req.body.task.task;  //results in undefined and error thrown
		console.log(req.body.task);
		//doc.task = 'Will this work';
		doc.task = req.body.task;
		doc.save(function(err){
			if(!err){
				res.redirect('/tasks');
			}
			else{
				console.err(err);
			}
		});
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
