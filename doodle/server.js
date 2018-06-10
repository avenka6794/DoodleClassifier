const express = require('express')
const app = express()

var port = process.env.PORT || 3000;

app.get('/', function(req, res){ 
  res.sendFile(__dirname+'/index.html')
});

app.use(express.static('static'))
app.use(express.static('data'))


app.listen(port, function() {
  console.log('Server running!')
})
