-- psql -f cities -d city_explorer_dtb


DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)

)