const top  = document.getElementById('top');
const label  = document.getElementById('label');
const name  = document.getElementById('trace_name');

var map = L.map('map', { zoomControl:false } ).fitWorld();

var openstreet = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

const scheme = "hybrid.day.mobile"
/*
var here = L.tileLayer.here({
    appId: 'itFu46QqjFn8CY0rfLdB',
    appCode: 'fUSfSpQI48RWqR4PxOu7Kg',
    scheme: scheme})
*/
var layer = googleSat
    
layer.addTo(map);

map.locate({setView: true, maxZoom: 16});


function sendPosition(latitude, longitude, accuracy) {
    console.log("send position");
    var u = location.protocol + "//" + location.host + "/gps/position?"
    u = u + "name=" + name.value;
    u = u + "&latitude=" + latitude;
    u = u + "&longitude=" + longitude;
    u = u + "&accuracy=" + accuracy;
    console.log(u)
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let ss = xhr1.responseText;            
            label.innerText =  ss;
            //EKOX(ss);
        }
    }  
    xhr1.open("GET", u, true)
    xhr1.send();
}    
    

const options = {
  enableHighAccuracy: true,
  maximumAge: 3000,
  timeout: 2000,
};


function onLocationFound(e) {
    console.log("location found");
    var radius = e.accuracy;
    console.log(e.latlng)
    console.log(e.accuracy)
    sendPosition(e.latlng.lat, e.latlng.lng, e.accuracy);
    
}

function refresh() {
    var u = location.protocol + "//" + location.host + "/gps/refresh";
    console.log('refresh', u);
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let ss = xhr1.responseText;
            console.log('ss', ss);            
            let rep = JSON.parse(ss);
            console.log(rep);
            //console.log(rep.length)
            label.innerText =  ss;
            for (const [key, e] of Object.entries(rep)) {
                console.log(key)
                console.log(e)
                L.circle({ lat : e.latitude, lng : e.longitude}, e.accuracy).addTo(map);
            }
            //EKOX(ss);
        }
    }  
    xhr1.open("GET", u, true)
    xhr1.send();
    //setTimeout(refresh, 1000)    
}

function success(position) {
    console.log("success");    
    sendPosition(position.coords.latitude, position.coords.longitude, 0);
}

function error() {
    console.log("Sorry, no position available.");
}

const watchID = navigator.geolocation.watchPosition(success, error, options);

map.on('locationfound', onLocationFound);
setTimeout(refresh, 1000)
