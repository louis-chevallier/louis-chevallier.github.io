const plot_div  = document.getElementById('plot');
const map_div  = document.getElementById('map');
const controls_div  = document.getElementById('controls');
const toggle_button = document.getElementById('toggleButton');
const clear_button = document.getElementById('clearButton');
const next_button = document.getElementById('nextButton');
const record_button = document.getElementById('recordButton');
//const loggin_ta = document.getElementById('loggin');
const loggin_ta = document.getElementById('loggin');
const text = document.getElementById('text');
const question = document.getElementById('question');
const dummy = document.getElementById('dummy');
const noir = document.getElementById('noir');
const trace_name = document.getElementById('trace_name');
const trace_save = document.getElementById('trace_save');
const use_cloud_btn = document.getElementById('use_cloud');
const stats = document.getElementById('stats');
const trace_delete = document.getElementById('trace_delete');

function* enumerate(iterable) {
    let i = 0;

    for (const x of iterable) {
        yield [i, x];
        i++;
    }
}
function i_run() {
    return get_trace_name();
}

// The wake lock sentinel.
let wakeLock = null;

// Function that attempts to request a screen wake lock.
const requestWakeLock = async () => {
  try {
      wakeLock = await navigator.wakeLock.request();
      wakeLock.addEventListener('release', () => {
          console.log('Screen Wake Lock released:', wakeLock.released);
          text.innerHTML = "wake lock ok, released=" + wakeLock.released;          
      });
      console.log('Screen Wake Lock released:', wakeLock.released);
      text.innerHTML = "wake lock ok, released=" + wakeLock.released;
      
  } catch (err) {
      //console.error(`${err.name}, ${err.message}`);
  }
};

async function lock_screen() {
    // Request a screen wake lock…
    await requestWakeLock();
}

function release_screen() {
    try {
        wakeLock.release();
    } catch (err) {
        //console.error(`${err.name}, ${err.message}`);
    }
    wakeLock = null;    
}
/*
    // …and release it again after 5s.
    window.setTimeout(() => {
        wakeLock.release();
        wakeLock = null;
    }, 5000);
*/


/*
// Call start
(async() => {
  console.log('before start');

  await start();
  
  console.log('after start');
})();
*/
/*
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13
});
*/

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
const here = L.tileLayer.here({
    appId: 'itFu46QqjFn8CY0rfLdB',
    appCode: 'fUSfSpQI48RWqR4PxOu7Kg',
    scheme: scheme})

var layer = googleSat
    
layer.addTo(map);

map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;
    console.log(e.latlng)
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    
    L.circle(e.latlng, radius).addTo(map);
}

//map.on('locationfound', onLocationFound);


const panes = [ controls_div, question, dummy, noir]
var i_panes = 0;

/*


*/


function toggle(c, target) {
    i_panes = ((target === undefined) ? (i_panes + 1) % panes.length : panes.indexOf(target))
    console.log("toggle target=", target, "i_pane=", i_panes)
    panes.map((pn, i) => {
        pn.style.display = (i == i_panes ? "block" : "none");
        pn.style.display = (i == i_panes ? "900" : "0");
    });
    toggle_button.textContent = "Tggle(" + i_panes + ")"
}

noir.addEventListener('click', function (event) {
    toggle(0, controls_div)
});

function onMapClick(e) {
    const s = {
        controls_div : question,
        dummy : noir
    }
    const t = s[panes[i_panes]];
    toggle(0, t);

    /*
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
    
    var popup = L.popup(e.latlng, {content: '<p>Hello.</p> ' + "You clicked the map at " + e.latlng.toString()})
        .openOn(map);

    popup.on('dblclick',  (e) => console.log(e));
    */
    
}

map.on('click', onMapClick);

function latlong_km(llat, llong) {
    var llat_rd = llat / 360 * 2 * Math.PI
    var [x,y] =  [110.574 * llat, llong * 111.320 * Math.cos(llat_rd)]
    return [ x, y]
}

function km_latlong(x, y) {
    var llat = x / 110.574
    var llat_rd = llat / 360 * 2 * Math.PI
    var llong = y / (111.320 * Math.cos(llat_rd))
    return [ llat, llong]
}


var [ hlat, hlong] = [ 48.217015, -1.750584];
var [x, y] = latlong_km(hlat, hlong);


console.log(x, y)
console.log(km_latlong(x, y))

var side = 0.01;



function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function get_runner() {
    const runner1 = getCookie("runner");
    return runner1 
}


function zero_running_data()  {
    return {
        name : get_runner(),
        runs : {}
    }
}

var running_data = zero_running_data()

function clear() {
    var running_data_s = encodeURIComponent(JSON.stringify(zero_running_data()));
    
    console.log(document.cookie.length);
    document.cookie = "running=" + running_data_s + ";SameSite=Strict";
    console.log(document.cookie.length);    
    cook(4000)
    console.log("cleared")
    var aaa = getCookie("running");    
    aaa = decodeURIComponent(aaa);
    //console.log(aaa);
    running_data = JSON.parse(aaa)
    console.log("rd1", running_data);             
}


var popup = L.popup();


toggle_button.addEventListener('click', toggle);
//clear_button.addEventListener('click', clear);
next_button.addEventListener('click', next);
record_button.addEventListener('click', record);


function format(s) {
    const out = s.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, "_");
    return out;
}

loggin_ta.addEventListener('input', function (k) {
    const runner = format(loggin_ta.value)
    document.cookie = "runner=" + runner + ";SameSite=Strict";
    //console.log(runner);
    loggin_ta.value = runner
    const runner1 = getCookie("runner");
    //console.log(runner1);    
});

use_cloud_btn.addEventListener('input', function (k) {
    console.log(k)
    console.log(use_cloud_btn.value)
    
});

trace_name.addEventListener('input', function (k) {
    const name  = format(trace_name.value);
    trace_name.value = name;
    console.log(name);
    //console.log(k.data)
    //d = running_data.runs[i_run]
    //d.name = trace_name.value
});

trace_save.addEventListener('click', function (k) {
    do_record();
    console.log(trace_name.value);
    //save();
    toggle(0, dummy)
});


trace_delete.addEventListener('click', function (k) {
    const n = get_trace_name()
    next()
    delete running_data.runs[n]
    d = running_data.runs[i_run()]
    display(d)
    
});

var trace1 = {
  x: [1, 2, 3, 4],
  y: [10, 15, 13, 17],
  type: 'scatter'

};
var trace2 = {
  x: [1, 2, 3, 4],
  y: [16, 5, 11, 9],
  type: 'scatter'

};


function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function cook(l) { 
    var duration_sec = l; //3600; 

    var dates = range(duration_sec, 0)
    var [xs, ys, as] = [ [], [], []]
    var [ x0, y0, a0 ] = [x, y, 0]
    var [ vx, vy, va] = [0, 0, 0]
    const vmax = 10/3600;

    const clamp = (min, x, max) => x < min ? min : (x > max ? max : x)
    for (const t of dates) {
        vx = clamp(-vmax, vx + (Math.random() - 0.5)/1000, vmax)
        vy = clamp(-vmax, vy + (Math.random() - 0.5)/1000, vmax)
        va = clamp(-vmax, va + (Math.random() - 0.5)/1000, vmax)
        x0 += vx
        y0 += vy
        a0 += va
        xs.push(x0)
        ys.push(y0)
        as.push(a0)
    }

    const moonLanding = new Date('July 20, 69 20:17:40 GMT+00:00');
    
    // Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
    console.log(moonLanding.getTime());
    console.log(moonLanding)
    // Expected output: -14182940000
    
    const now = new Date()
    console.log(now)
    const milliseconds = 10 * 1000;
    dates = dates.map(  (d, i) => (new Date(now.getTime() + i * 1000)))
    
    return  { t : dates, x : xs, y : ys, a : as}
}

const zip = (a, b) => a.map((k, i) => [k, b[i]])

var polygon = 0;


function location_latlong(d) {
    const xs = d.x
    const dates = d.dates
    const ys = d.y
    const pol = zip(xs, ys);
    const pol2 = pol.map(  ([x,y], i) => km_latlong(x, y))
    return pol2[0]
}

function length(d) {
    var l = 0.;
    var mx = 0;
    const xs = d.x
    const dates = d.t;
    const ys = d.y
    const pol = zip(xs, ys);
    var prev = d.t[0];
    if (pol.length > 0) {
        var [x, y] = pol[0]
        for (const [ip, p] of enumerate(pol)) {
            const [ xx, yy] = p
            v = [ xx - x, yy - y]
            ll = Math.sqrt(v[0] ** 2 + v[1] ** 2)
            const dd = d.t[ip] - prev;
            prev = d.t[ip];
            const speed = ll / dd * 1000 * 3600;
            if (mx > speed) {
                mx = speed;
            }
            l = l + ll;
            [x, y] = [ xx, yy]
        }
    }
    const aspeed = l / trace_duration(d) * 1000 * 3600;
    //console.log(l)
    return { length : l, max_speed : mx, avg_speed : aspeed }
}

function display(d) {
    const keys1 = Object.keys(running_data.runs);
    const xs = d.x
    const dates = d.t
    const ys = d.y
    const pol = zip(xs, ys);
    const pol2 = pol.map(  ([x,y], i) => km_latlong(x, y))

    if (polygon != 0) {
        polygon.remove();
    }
    //console.log(xs)
    polygon = L.polyline(pol2)
    polygon.addTo(map);
    const data = [ { type : "scatter", x : dates, y : d.a}]
    
    const  layout = {
        title: 'Altitudes',
        xaxis: {
            title: 'time',
            showgrid: false,
            zeroline: false
        },
        
        yaxis: {
            title: 'm',
            showline: false
        }
        
    };
    Plotly.newPlot('plot', data, layout);
    const keys = Object.keys(running_data.runs);
    
    text.innerHTML = "" + String(i_run()) + "/" + keys.length + ", longueur=" + length(d).length.toFixed(2) + "km " + d.t.length + " steps" ;
    stats.innerHTML = "<pre>Length    : " + length(d).length.toFixed(2) + "Km</pre>";
    stats.innerHTML += "<pre>Duration : " + trace_duration(d).toLocaleString("fr", { hour: 'numeric', minute: 'numeric', second: 'numeric'})
    stats.innerHTML += "<pre>Max speed : " + length(d).max_speed + "Km/h";
    stats.innerHTML += "<pre>Avg speed : " + length(d).avg_speed.toFixed(2) + "Km/h"
    
    const here = pol2.slice(-1)[0]
    //map.locate({setView: here, maxZoom: 30});
    console.log(xs)
    console.log([ Math.min(...xs), Math.min(...ys)])
    const topleft = km_latlong(Math.min(...xs), Math.min(...ys))
    const bottomright = km_latlong(Math.max(...xs), Math.max(...ys))
    const corner1 = L.latLng(...topleft)
    const corner2 = L.latLng(...bottomright)
    const bounds = L.latLngBounds(corner1, corner2);
    map.fitBounds(bounds)
    console.log("fitted")
}

function trace_duration(d) {
    const dates = d.t;


    if (running_data.runs[i_run()].t.length > 0) {
        const t0 = running_data.runs[i_run()].t[0];
        const end = running_data.runs[i_run()].t.slice(-1)[0];
        return new Date(end - t0);
    } else {
        const dd = Date.now();
        return dd; 
    }
}

function add(d) {
    const keys = Object.keys(running_data.runs);
    const k = "trace_" + keys.length;
    console.log(k);
    set_trace_name(k);
    console.log("adding trace " , k)
    console.log("adding trace " , i_run())
    running_data.runs[k] = d;
}


function next() {
    const keys = Object.keys(running_data.runs);
    if (!(get_trace_name() in running_data.runs)) {
        console.log(keys[0])
        set_trace_name(keys[0]);
    }
    const i = keys.indexOf(i_run());    
    console.log("key len", keys.length, "i=", i)
    console.log("i_run", i_run())
    d = running_data.runs[i_run()]
    display(d)
    const ii = (i+1) %  keys.length;
    const k = keys[ii];
    console.log("new ", k);
    set_trace_name(k);
    console.log(i_run())
    loc = location_latlong(d)
    //map.setView(loc, 30);
}

const white = '#ffffff';
const pink = '#ff3f3f' 

var timer_count = 0;
var timer = 0;
var watch_gps = 0;


function stop_record() {
    console.log("stop_record()");
    const t = record_button
    t.value = "Record";
    navigator.geolocation.clearWatch(watch_gps);
    t.style.background = white;
    save()
    release_screen()
    clearInterval(timer);
    //console.log("about to toggle");
    //toggle(0, question);
}

function check() {
    const t = record_button    
    if (t.value != "Stop") {
        stop_record()
    }
}

function blink() {
    const t = record_button    
    timer_count ++;
    t.style.background = timer_count % 2 == 0 ? white : pink;

    const last_time = running_data.runs[i_run()].t.slice(-1)[0]
    const dd = Date.now();
    //console.log(last_time)
    if (running_data.runs[i_run()].t.length > 0 || last_time === undefined || (dd.getTime() - last_time.getTime()) > 1000) {
        function showPosition(position) {
            //console.log("show pos")


            //add_rec(position.coords.latitude, position.coords.longitude, position.coords.altitude)
        }        
        navigator.geolocation.getCurrentPosition(showPosition);        
    }
    display(running_data.runs[i_run()])    
    check()
}

function add_rec(latitude, longitude, altitude) {
    const t = record_button
    //console.log(t.value, running_data.runs[0].a.length)
    check();
    const last_time = running_data.runs[i_run()].t.slice(-1)[0]
    const dd = Date.now();
    if (running_data.runs[i_run()].t.length > 0 || last_time === undefined || (dd.getTime() - last_time.getTime()) > 1000) {
        var [hlat, hlong, alt] = [latitude, longitude, altitude];
        var [x, y] = latlong_km(hlat, hlong);

        const v0 = i_run();
        running_data.runs[v0].t.push(dd);
        running_data.runs[v0].x.push(x);
        running_data.runs[v0].y.push(y);
        running_data.runs[v0].a.push(alt);
        //console.log("got gps", running_data.runs[0].a.length)
        display(running_data.runs[v0])
    }
}

function record() {
    const t = record_button    
    if (t.value == "Record") {
        toggle(0, question);
    } else {
        // stopping
        console.log("stop");
        stop_record()
    }
}

function get_trace_name() {
    return trace_name.value;
}

function set_trace_name(n) {
    console.log(n);
    console.assert(typeof n == "string")
    trace_name.value = n;
}

function do_record() {
    const t = record_button
    console.log("being record(), label=", t.value)
    if (t.value == "Record") {
        t.value = "Stop";
        running_data.runs[get_trace_name()] = cook(0)
        watch_gps = navigator.geolocation.watchPosition((position) => {
            add_rec(position.coords.latitude, position.coords.longitude, position.coords.altitude);
        });
        
        timer = setInterval(blink, 1000 ); // 1 sec
        (async() => {
            console.log("locking screen")
            await lock_screen();
        })();
    } else { // stopping
        console.log("stop");
        stop_record()
    }
    console.log("put label ", t.value)
    setTimeout(() => toggle(noir), 10000);
    
}

const use_cloud = getCookie("use_cloud") == "yes";

function load() {
    cookies = document.cookies;
    //document.cookie = "runner=" + runner + ";SameSite=Strict";
    const runner = getCookie("runner");
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let response = xhr1.response;
            console.log("response", response)
            running_data = response
            console.log(running_data)
            console.log(running_data["name"])
            console.log(running_data.name)
            d = running_data.runs[i_run()]
            display(d)
            console.log("loaded", running_data.runs.length)
            
        }
    };
    xhr1.responseType = "json";

    if (use_cloud) {
        xhr1.open("POST", "load?runner=" + runner );
        xhr1.send();
    } else {
        const stored  = localStorage.getItem("running")
        const decoded = decodeURIComponent(stored);
        //console.log("decoded", decoded);
        running_data = JSON.parse(decoded);

        if (running_data === null) {
            running_data = zero_running_data();
        }
        
        //console.log(running_data)
        //console.log(running_data["name"])
        const keys = Object.keys(running_data.runs);
        if (!(get_trace_name() in running_data.runs)) {
            console.log(keys[0])
            set_trace_name(keys[0]);
        }
        d = running_data.runs[i_run()]
        display(d)
    }
}

function save() {
    cookies = document.cookies;
    //document.cookie = "runner=" + runner + ";SameSite=Strict";
    const runner = getCookie("runner");
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let ss = xhr1.responseText;
            console.log(ss)
        }
    };
    //console.log(running_data)
    var running_data_s = encodeURIComponent(JSON.stringify(running_data));
    if (use_cloud) {
        try {
            xhr1.open("POST", "save?runner=" + runner + "&data=" +  running_data_s);
            xhr1.send();
        }
        catch(err) {
            console.log(err);
        }
    }
    {
        localStorage.setItem("running", running_data_s);
        const stored  = localStorage.getItem("running")
        if (stored != running_data_s) {
            alert("store failed");
        }        
    }
    console.log("saved")
}

loggin_ta.value = get_runner()


const do_init = false;
if (do_init) {
    d = cook(4)
    add(cook(13))
    add(cook(23))
    
    next()
    save()
    load()
} else {
    load()
}
    



///////////////////////////////////////////////////////////


async function loggin() {
    runner = "david"
    cookies = document.cookies;
    console.log(cookies);

    
    document.cookie = "runner=" + runner + ";SameSite=Strict";
    cookies = document.cookies;
    console.log(cookies);
    cookies = document.cookie;
    console.log(cookies);
    console.log(getCookie("runner"))
    console.log(loggin_ta.innerHTML)
    var user = getCookie("runner")
    loggin_ta.innerHTML = getCookie("runner")
    console.log(user)
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let ss = xhr1.responseText;
            console.log(ss)
        }
    };
    var href = location.href; //returns the entire url
    var host = location.hostname;
    console.log(href)
    xhr1.open("POST", "?user=" + user );
    xhr1.send();
}


    
    /*
    var aaa = getCookie("running");
    if (aaa.length > 0) {
        aaa = decodeURIComponent(aaa);
        //console.log(aaa);
        running_data = JSON.parse(aaa)
        console.log("rd1", running_data);             
        console.log(running_data.name);     
        console.log(running_data.runs);     
    }
    console.log("rd", running_data);
    console.log(running_data.runs);         
    console.log("runs" , running_data.runs.length)
    running_data.runs.push({
        id : "123",
        data : { dates : dates, x : xs, y : ys }})
    console.log("runs" , running_data.runs.length)
    
    var running_data_s = encodeURIComponent(JSON.stringify(running_data));
    console.log(running_data_s.length)
    document.cookie = "running=" + running_data_s + ";SameSite=Strict";
    var aaa = getCookie("running");
    console.log(aaa.length)    
    */

