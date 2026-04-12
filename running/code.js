const pw_t  = document.getElementById('pw');
const encode  = document.getElementById('encode');
const decode  = document.getElementById('decode');
const message  = document.getElementById('message');
const encoded = document.getElementById('encoded');
const decoded = document.getElementById('decoded');

const char =  (c, _) => c.charCodeAt(0)
const [cA, cZ, ca, cz, c0, c9] = [...'AZaz09'].map(char)

console.log(cA, cZ, ca, cz, c0, c9)

const alphaU = [...Array(cZ-cA+1).keys()].map(i => String.fromCharCode(i + ca));
const alpha = [...Array(cz-ca+1).keys()].map(i => String.fromCharCode(i + ca));
const digits = [...Array(c9-c0+1).keys()].map(i => String.fromCharCode(i + c0));
const letters = [...alphaU, ...alpha, ...digits, ..."&+=_-* "]
console.log(letters)
const lletters = letters.length

const pw = pw_t.value;
console.log(pw)


function dec_l(c, i, ppw) {
    const pwa = [...ppw];
    const lpw = pw.length;

    const ii =  letters.indexOf(c);
    const dec = letters.indexOf(pwa[i %lpw]);
    return letters[(ii+dec) % lletters]
}

function enc(c, i, ppw) {
    const lpw = ppw.length;
    EKOX(c)
    const ii =  letters.indexOf(c);
    EKOX(ii);
    //const dec = letters.indexOf(pwa[i % lpw]);
    const decalage = ppw[i % lpw];
    const d = (ii+decalage) % lletters
    EKOX(decalage)
    EKOX(d)
    const e = letters[d]
    EKOX(e)
    const a = dec(e, i, ppw);
    EKOX(a)
    return e;
}

function dec(c, i, ppw) {
    EKOX(c)
    const lpw = ppw.length;
    const decalage = ppw[i % lpw];
    EKOX(decalage)
    const jj = letters.indexOf(c);
    EKOX(jj)
    const ii = jj-decalage + 2*lletters
    EKOX(ii)
    const r = letters[ii % lletters]
    EKOX(r)
    return r;
}

const m = message.value;
//console.log([..."louis"].map((c, i) => enc(c,i,pw)).join(""))
//console.log([..."xxxxxxxxx"].map((c, i) => enc(c, i, pw)).join(""))

function process(event) {
    const m = message.value;
    const pw = pw_t.value;    
    const pwa = [...pw].map(char);
    EKOX(pwa)
    //console.log(m);
    const ee = [...m].map((c, i) => enc(c, i, pwa)).join("");
    //const dd = [...ee].map((c, i) => dec(c, i, pwa)).join("");
    console.log(ee);
    //console.log(dd);
    encoded.innerHTML = ee;
};

message.addEventListener('input', process)
pw_t.addEventListener('input', process)

decode.addEventListener('click', function (event) {

});

