const userTab = document.querySelector("#your-weather");
const searchTab = document.querySelector("#search-weather");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("#data-searchForm");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("#grant-access");
const searchInput = document.querySelector("#data-searchInput");

var display = 0;

let currTab = userTab;
const API_KEY = "2ab605e0cd10cb65ce801299f8641a3c";
currTab.classList.add("current-tab");

grantAccessContainer.classList.add("active");

function switchTab(clickedTab)
{
    if (clickedTab != currTab)
    {
        //Tab Switching done
        currTab.classList.remove("current-tab");
        currTab = clickedTab;
        currTab.classList.add("current-tab");
        // check search form was active ("searchTab") or not("userTab")
        if(!searchForm.classList.contains("active"))
        {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else if(display !== 0){
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            // Now in userTab 
            getfromSessionStorage();
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.add("active");
        }
    }
}

function getfromSessionStorage()
{
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates)
{
    const {lat,long} = coordinates;
    // grant access invisible
    grantAccessContainer.classList.remove("active");
    // loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err)
    {
        alert('Unable to fetch details');
    }
}

function renderWeatherInfo(weatherInfo)
{
    const cityName = document.querySelector("#data-cityName");
    const countryIcon = document.querySelector("#data-countryIcon");
    const desc = document.querySelector("#data-weatherDescription");
    const weatherIcon = document.querySelector("#data-weatherIcon");
    const temp = document.querySelector("#data-temperature");
    const windSpeed = document.querySelector("#data-windSpeed");
    const humidity = document.querySelector("#data-humidity");
    const cloudiness = document.querySelector("#data-cloudiness")
    
    cityName.innerText = `${weatherInfo?.name}`;  
    countryIcon.src = `https://flagcdn.com/16x12/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

userTab.addEventListener("click",()=>{
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
    switchTab(searchTab);
})

function getlocation()
{
    if(navigator.geolocation)
    {
        display++;
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('Location Support Unavailabe');
    }
}
function showPosition(position)
{
    const userCoordinates = {
        lat : position.coords.latitude,
        long : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
grantAccessButton.addEventListener("click",getlocation);
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;
    fetchSearchweatherInfo(cityName);
})

async function fetchSearchweatherInfo(cityName){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(data?.name)
        {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        else{
            loadingScreen.classList.remove("active");
        }
    }
    catch(err)
    {
        alert('Unable to fetch details');
    }

}
