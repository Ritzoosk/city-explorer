
//==================Packages=================

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

//==================App=====================

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3009;
const LOCATION_API_KEY = process.env.LOCATION_API_KEY;


//==================Routes===================

app.get('/location', getLocation);
app.get('/weather', getWeather);
// app.get('/', get?);


function getLocation(req, res){
  //const dataFromTheFile = require('./data/location.json');
  const city = req.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json` ;

  superagent.get(url).then(stuffcomesback => {

  

  const output = new Location(stuffcomesback.body, req.query.city);
  res.send(output);
  });
}


function Location(stuffcomesback, cityName){
  this.search_query = cityName;
  this.formatted_query = stuffcomesback.body[0].display_name;
  this.latitude = stuffcomesback.body[0].lat;
  this.longitude = stuffcomesback.body[0].lon;
}

function getWeather(req, res){

  //const cityName = req.query.city; 

  const dataFromTheFile = require('./data/weather.json');
  const output = [];
  
  dataFromTheFile.data.forEach(day =>{
    output.push(new Weather(day));
  });
  res.send(output);

}


function Weather(data){
  this.forecast = data.weather.description;
  this.time = data.valid_date; 

}






//==================Init====================


app.listen(3007, () => console.log('app is up on port http://localhost:3007'))

