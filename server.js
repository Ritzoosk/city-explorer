
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
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;



//==================Routes===================

app.get('/location', getLocation);
// app.get('/', get?);


function getLocation(req, res){

  const sqlQueryStr = 'SELECT * FROM cities WHERE search_query=$1';
  const sqlQueryArr = [req.query.city];

  client.query(sqlQueryStr, sqlQueryArr) 
    .then(result => {

      if (result.rows.length > 0){
        res.send(result.rows[0])
      } else {
        const city = req.query.city;
        const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json` ;

        superagent.get(url).then(userData => {
        const output = new Location(userData.body, req.query.city);
        res.send(output);
        });
      }
    });
}


function Location(userData, cityName){
  this.search_query = cityName;
  this.formatted_query = userData[0].display_name;
  this.latitude = userData[0].lat;
  this.longitude = userData[0].lon;
}


app.get('/weather', getWeather);


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

//start Parks
app.get('/parks', getParks);

function getParks(req, res){
  //console.log(req.query);
  const parkCode = req.query.formatted_query;

  const url = `https://developer.nps.gov/api/v1/parks?limit=5&start=0&q=${parkCode}&api_key=${PARKS_API_KEY}`

  superagent.get(url)
    .then(result => {
      
      const parks = result.body.data.map(singlePark => new Parks(singlePark));
      // console.log(parks);
      res.send(parks);
    })
    .catch(errorThatComesBack => {
      // console.log(errorThatComesBack);
      response.status(500).send('Sorry something went wrong');
    }); 
}


function Parks(obj){
  this.name = obj.fullName;
  this.address = obj.addresses[0].line1;
  this.fee = obj.entranceFees[0].cost;
  //this.fee = "";

  this.description = obj.description;
  this.url = obj.url;
}  

//YELP
app.get('/yelp', getYelp);

function getYelp(req, res){
  //console.log('in da yelp', req.query);
  
  
  // `https://developer.nps.gov/api/v1/parks?limit=5&start=0&q=${parkCode}&api_key=${PARKS_API_KEY}`
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurant&limit=5&latitude=${req.query.latitude}&longitude=${req.query.longitude}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      //console.log(result.body.businesses);
      
      const yelp = result.body.businesses.map(yelpResult)

      function yelpResult(data)  {
        return new Restaurant(data);
      }
      res.send(yelp);
    })
}

function Restaurant(data){
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}  

//MOVIE

app.get('/movies', getMovie);

function getMovie(req, res){
  console.log('in da movie');
  const movieCode = req.query.search_query;
  console.log(movieCode);
  
  const url =`https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${movieCode}&page=1&include_adult=false`;

  superagent.get(url)
    .then(result => {
      //console.log('in movie superagent', result.body.results)
      const movie = result.body.results.map(movie => new Movie(movie));
      // console.log(parks);
      res.send(movie);
    })
    .catch(errorThatComesBack => {
      // console.log(errorThatComesBack);
      res.status(errorThatComesBack.status).send('Sorry something went wrong', errorThatComesBack.message);
    });
}

function Movie(data){
  this.title = data.original_title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.image_url = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}` || 'sorry no image';
  this.popularity = data.popularity;
  this.released_on = data.released_on;
}  


//==================Init====================

client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`app is up ${PORT}`));

});



