
$(document).ready(function () {

    // search city on click
    $('#getEnteredCityWeather,#past-searches').on('click', function () {
        let clickEvent = $(event.target)[0];
        let location = "";
        if (clickEvent.id === "getEnteredCityWeather") {
          location = $('#cityEntered').val().trim().toUpperCase();
        } else if ( clickEvent.className === ("cityList") ) {
          location = clickEvent.innerText;
        }
        if (location == "") return;

        // update local storage with new city search
        updateLocalStorage (location);
        
        // get current weather for searched location, pass location
        getCurrentWeather(location);
        
        // get forecast for searched location, pass location
        getForecastWeather(location);
    
    });
    
    //converts time to mm/dd/yyyy
    function convertDate(UNIXtimestamp) {
        let convertedDate = "";
        let a = new Date(UNIXtimestamp * 1000);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        convertedDate = month + ' ' + date + ', '+ year;
        return convertedDate;
      }
  
      function updateLocalStorage(location) {
         // update Cities in local storage
         let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
         cityList.push(location); 
         cityList.sort();
  
         // removes dulicate cities from saved searches
         for (let i=1; i<cityList.length; i++) {
             if (cityList[i] === cityList[i-1]) cityList.splice(i,1);
         }
         //stores in local storage
         localStorage.setItem('cityList', JSON.stringify(cityList));
  
         $('#cityEntered').val("");
      }
        // Get current locaation weather
    function getCurrentWeather(loc) {
        
        //  pull city history from local memory 
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        
        
        $('#past-searches').empty();
        
        // city list array
        cityList.forEach ( function (city) {  
          let cityHistoryNameDiv = $('<div>');      
          cityHistoryNameDiv.addClass("cityList");         
          cityHistoryNameDiv.attr("value",city);
          cityHistoryNameDiv.text(city);
          $('#past-searches').append(cityHistoryNameDiv);
        });      
        
        // reset search value to null
        $('#city-search').val("");
      
        // determine if search is based upon city name or lat/lon
        if (typeof loc === "object") {
          city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
          city = `q=${loc}`;
        }
      
        // Open Weather API Query 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;
        
        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
      
          // load result into weatherObj
        weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: Math.round(response1.main.temp),
      
            // convert date to usable format [1] = MM/DD/YYYY Format
            date: (convertDate(response1.dt)),
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        } 
      // remove the current forecast
      $('#forecast').empty(); 
      // current search city
      $('#cityName').text(weatherObj.city + " (" + weatherObj.date + ")");
      // current search city weather icon
      $('#currWeathIcn').attr("src", weatherObj.icon);
      // current search city temp
      $('#currTemp').text("Temperature: " + weatherObj.temp + " " +  "°F");
      // current search city humidity
      $('#currHum').text("Humidity: " + weatherObj.humidity + "%");
      //  current city search wind speed
      $('#currWind').text("Windspeed: " + weatherObj.wind + " MPH");     

        city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;
        // current weather
        var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
        var apiIdURL = "?appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var cityName = city;
        var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;

        $.ajax({
            url: openUviWeatherAPI,
            method: "GET"
        }).then(function(response3) {
        
            // load respone into UviLevel variable
            let UviLevel = parseFloat(response3.value);
          
                
            // determine backgrouind color depending on value
            if (UviLevel < 3) {backgrdColor = 'green';} 
                else if (UviLevel < 6) { backgrdColor = 'yellow';} 
                else if (UviLevel < 8) { backgrdColor = 'orange';} 
                else if (UviLevel < 11) {backgrdColor = 'red';}     
        
            // insert UVI Lable and value into HTML
            let uviTitle = '<span>UV Index: </span>';
            let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
            $('#currUVI').html(color);            
            });
        });
    }

    function getForecastWeather(loc) {

        // determined by latitude longitude
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;      
        // else call api using city name 
        } else {
            city = `q=${loc}`; }
            
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;
     
        $.ajax({
            url: openCurrWeatherAPI2,
            method: "GET",
        }).then(function (response4) {
            var cityLon = response4.coord.lon;
            var cityLat = response4.coord.lat;
            city = `lat=${cityLat}&lon=${cityLon}`;

            // Get five days of weather history using longitude and latitude
            let weatherArr = [];
            let weatherObj = {};

            // Initiate API Call to get current weather... use onecall request
            var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
            var cityName = city;
        
            var exclHrlURL = "&exclude=hourly";
            var unitsURL = "&units=imperial";
            var apiIdURL = "&appid=";
            var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
            var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;
            $.ajax({
                url: openFcstWeatherAPI,
                method: "GET"
            }).then(function (response2) {
            
              // load weatherObj from response on a history of 5 days 
              for (let i=1; i < (response2.daily.length-2); i++) {
                let cur = response2.daily[i]
                weatherObj = {
                    weather: cur.weather[0].description,
                    icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                    minTemp: Math.round(cur.temp.min),
                    maxTemp: Math.round(cur.temp.max),
                    humidity: cur.humidity,
                    uvi: cur.uvi,
             
                    // convert date to MM/DD/YYYY Format
                    date: (convertDate(cur.dt))
                }
                weatherArr.push(weatherObj);
            }
            
            // render forecast on page
            for (let i = 0; i < weatherArr.length; i++) {
                let $colmx1 = $('<div class="col mx-1">');
                let $cardBody = $('<div class="card-body forecast-card">');
                let $cardTitle = $('<h6 class="card-title">');
               
                $cardTitle.text(weatherArr[i].date);
    
            
                let $ul = $('<ul>'); 
             
                let $iconLi = $('<li>');
                let $iconI = $('<img>');
                let $weathLi = $('<li>');
                let $tempMaxLi = $('<li>');
                let $tempMinLi = $('<li>');
                let $humLi = $('<li>');
    
                // Icon, Max, Min & Humidity
                $iconI.attr('src', weatherArr[i].icon);
                $weathLi.text(weatherArr[i].weather);                
                $tempMaxLi.text('Temp High: ' + weatherArr[i].maxTemp + " °F");
                $tempMinLi.text('Temp Low: ' + weatherArr[i].minTemp + " °F");
                $humLi.text('Humidity: ' + weatherArr[i].humidity + "%");
    
                // append to the HTML
                $iconLi.append($iconI);
                $ul.append($iconLi);
                $ul.append($weathLi);         
                $ul.append($tempMaxLi);
                $ul.append($tempMinLi);
                $ul.append($humLi);
                $cardTitle.append($ul);
                $cardBody.append($cardTitle);
                $colmx1.append($cardBody);
    
                $('#forecast').append($colmx1);
              }
            });
          });        
        }
         });
     