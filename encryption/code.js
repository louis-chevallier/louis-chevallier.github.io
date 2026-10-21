const label  = document.getElementById('label');

const safe = new class {
  #key = '';

  #encoder = new TextEncoder();
  #decoder = new TextDecoder();

  #buffer(string) {
    const bytes = new Uint8Array(string.length);
    [...string].forEach((c, i) => bytes[i] = c.charCodeAt(0));
    return bytes;
  }

  async open(password) {
    this.#key = await crypto.subtle.digest({
      name: 'SHA-256'
    }, this.#encoder.encode(password)).then(result => crypto.subtle.importKey('raw', result, {
      name: 'AES-CBC'
    }, true, ['encrypt', 'decrypt'])) ;

      
  }

    async refresh() {
        label.innerHTML = #key;
    }
    
  async decrypt(string) {
    // compatibility fix
    string = string.replace('data:application/octet-binary;base64,', '');

    const iv = crypto.getRandomValues(new Uint8Array(16));

    const result = await crypto.subtle.decrypt({
      name: 'AES-CBC',
      iv
    }, this.#key, this.#buffer(atob(string)));

    const ab = (new Uint8Array(result)).subarray(16);
    return this.#decoder.decode(ab);
  }
};

(async () => {
    const d = await safe.open('PASSWORD');
    //await safe.decrypt('ENCRYPTED_STRING');
    label.innerHTML = "done";
    //const response = await fetch('/api/data');
    //const data = await response.json();
    console.log(d);
})();


const intervalId = setInterval(() => {
    safe.refresh();

}, 1000);


