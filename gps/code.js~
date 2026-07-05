const label  = document.getElementById('label');
const force_on  = document.getElementById('force_on');
const force_off  = document.getElementById('force_off');
const auto  = document.getElementById('auto');

console.log("code 1");

function refresh() {
    console.log("code 2");    
    const u = location.protocol + "//" + location.host + "/get_alarm_mode";
    console.log(u)
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            let ss = xhr1.responseText;            
            label.innerText =  ss;
            EKOX(ss);
        }
    }
    xhr1.open("GET", u, true)
    xhr1.send();
}

function f(m) {
    console.log( location.protocol)
    console.log( location.host)
    const u = location.protocol + "//" + location.host + "/set_alarm_mode?mode=" + m;
    console.log(u)
    const xhr1 = new XMLHttpRequest();
    xhr1.onreadystatechange = () => {
        if (xhr1.readyState === 4) {
            refresh()
        }
    }    
    xhr1.open("GET", u, true)
    xhr1.send();
}

force_on.addEventListener('click', function (event) { f("on") ; })
force_off.addEventListener('click', function (event) { f("off") ; })
auto.addEventListener('click', function (event) { f("auto") ; })

refresh()


