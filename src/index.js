const { v4 : uuidv4 } = require('uuid'),
      express = require('express'),
      cors = require('cors'),
      app = express(),
      users = [];

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({ error: 'User not found!'});
  }
  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  if(users.some(user => user.username === username)) {
    return response.status(400).json({ error: "Username is already in use!" });
  }
  const user = {
    id    : uuidv4(),
    name,
    username,
    todos : []
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request,
        { title, deadline } = request.body,
        todo = {
          id         : uuidv4(),
          title,
          done       : false,
          deadline   : new Date(deadline),
          created_at : new Date()
        };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request,
        { title, deadline } = request.body,
        { id } = request.params,
        todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return response.status(404).json({ error: "You cannot update a non existing to-do!" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request,
        { id }   = request.params,
        todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return response.status(404).json({ error : "You cannot mark as done a non existing to-do!" });
  }
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user }  = request,
        { todos } = user,
        { id }    = request.params,
        todo = todos.find(todo => todo.id === id);
  if(!todo) {
    return response.status(404).json({ error: "You cannot delete a non existing to-do!"});
  }
  todos.splice(todos.indexOf(todo), 1);
  return response.status(204).json(user.todos);
});

module.exports = app;