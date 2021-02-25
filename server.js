
//==================Packages=================

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

//==================App=====================

const app = express();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL)

client.on('error', err => console.log(err));

const PORT = process.env.PORT || 3009;
const LOCATION_API_KEY = process.env.LOCATION_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const W_API_KEY = process.env.WEATHER_API_KEY;


//==================Routes===================

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/parks', getParks);
// app.get('/', get?);


function getLocation(req, res){
  //const dataFromTheFile = require('./data/location.json');
  const city = req.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json` ;

  superagent.get(url).then(userData => {
  const output = new Location(userData.body, req.query.city);
  res.send(output);
  });
}


function Location(userData, cityName){
  this.search_query = cityName;
  this.formatted_query = userData[0].display_name;
  this.latitude = userData[0].lat;
  this.longitude = userData[0].lon;
}

function getWeather(req, res){

  superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${req.query.search_query}&key=${WEATHER_API_KEY}`)
    .then(weatherData => {
      const wthrArr = weatherData.body.data.map(wthrOutput);
      function wthrOutput(day) {
        return new Weather(day);
      }
      res.send(wthrArr);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      response.status(500).send('Sorry something went wrong');
    });
}//END getWeather
  


function Weather(data){
  this.forecast = data.weather.description;
  this.time = data.valid_date; 

}

function getParks(res, req){
  const parks = [];
  const parkCode = req.query.formatted_query

  const url = `https://developer.nps.gov/api/v1/parks?q=${parkCode}&api_key=${PARKS_API_KEY}`

  superagent.get(url)
    .then(result => {
      

      const parks = result.body.data.map(singlePark => new Parks(singlePark));
      res.send(parks);
    })
}


function Parks(obj){
  this.name = obj.fullName;
  this.address = 
  this.fee = obj.entranceFees[0].cost;
  this.description 
  this.url
}  




//==================Init====================

client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`app is up ${PORT}`));

});



// const city = req.query.search_query; 

//   superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API_KEY}`)
//     .then(userData => {
//       const output = [];

//       const dataFromTheFile = require(url);

  
//   dataFromTheFile.data.forEach(day =>{
//     output.push(new Weather(day));
//   });
//   res.send(output);

// });