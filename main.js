const content = document.getElementById('content');
const Select = document.getElementById('servers');
const ReloadBtn = document.getElementById('reload');
const Loading = document.getElementById('loading');
let NiceSelectElem = undefined;

const BASE_URL = 'https://napi.arvancloud.com/';
let lastRegion = '';
let API_KEY = '';
let isLoading = true;
let reloadInterval = undefined;

function gettingApiToken() {
    const col = document.createElement('div');
    col.setAttribute( "class", "col-xs-24" );

    const form = document.createElement('div');
    form.setAttribute( "class", "token-form" );
    col.appendChild(form);

    const input = document.createElement('input');
    input.setAttribute( "type", "text" );
    input.setAttribute( "id", "token_field" );
    input.setAttribute( "placeholder", "کلید API را وارد کنید..." );
    form.appendChild(input);

    const btn = document.createElement('button');
    btn.setAttribute( "type", "button" );
    btn.setAttribute( "class", "btn btn--primary" );
    btn.addEventListener('click', (event) => {
        localStorage.setItem('api_key', input.value);
        initialQueries();
    });
    btn.innerText = 'ذخیره';
    form.appendChild(btn);

    content.appendChild(col);
}

function getRegions(url, token) {
    const Http = new XMLHttpRequest();

    Http.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const res = JSON.parse(this.responseText);
            if (res['data'].length > 0) {
                const prevValue = localStorage.getItem('region');
                res['data'].forEach((item, index) => {
                    option = document.createElement( 'option' );
                    option.text = item.dc;
                    option.value = item.code;
                    Select.appendChild(option);
                });

                if (!prevValue) {
                    localStorage.setItem('region', res['data'][0]['code']);
                    getServer(BASE_URL, API_KEY, res['data'][0]['code']);
                    Select.value = res['data'][0]['code'];
                } else {
                    Select.value = prevValue;
                    getServer(BASE_URL, API_KEY, prevValue);
                }
                console.log(NiceSelectElem);
                NiceSelectElem.update();
            }
        }
    });


    Http.open("GET", `${url}ecc/v1/regions`);
    Http.setRequestHeader('Accept', 'application/json');
    Http.setRequestHeader('Authorization',token);
    Http.send();
}

function getServer(url, token, region) {
    isLoading = true;
    Loading.classList.remove("loading--hide");
    const Http = new XMLHttpRequest();

    Http.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            isLoading = false;
            Loading.classList.add("loading--hide");
            const res = JSON.parse(this.responseText);
            res['data'].forEach((item, index) => {
                addServerLayout(item.name, item.status.toLowerCase());
            });
        }
    });


    Http.open("GET", `${url}ecc/v1/regions/${region}/servers`);
    Http.setRequestHeader('Accept', 'application/json');
    Http.setRequestHeader('Authorization',token);
    Http.send();
}

function addServerLayout(name, status) {
    const Icon = {
        active: 'active',
        shutoff: 'migrating',
        build: 'migrating',
        rebuild: 'migrating',
        reboot: 'migrating',
        resize: 'migrating',
        verify_resize: 'migrating',
        suspended: 'error',
        error: 'error',
        block_device_mapping: 'migrating',
        hard_reboot: 'migrating',
        rescue: 'migrating',
        migrating: 'migrating',
    };
    const Status = {
        active: 'روشن',
        shutoff: 'خاموش',
        build: 'در حال ساخت',
        rebuild: 'در حال بازسازی',
        reboot: ' راه‌اندازی مجدد',
        resize: ' تغییر اندازه',
        verify_resize: 'تایید تغییر اندازه',
        suspended: 'معلق',
        error: 'خطا در ساخت',
        block_device_mapping: 'در حال اتصال دیسک',
        hard_reboot: 'راه‌اندازی مجدد سخت‌افزاری',
        rescue: 'حالت Rescue',
        migrating: 'در حال جابجایی ابرک',
    };

    const col = document.createElement('div');
    col.setAttribute( "class", "col-xs-12 col-sm-8 col-md-6 col-lg-4" );

    const wrapper = document.createElement('div');
    wrapper.setAttribute( "class", "server" );
    col.appendChild(wrapper);

    const img = document.createElement('img');
    img.setAttribute( "src", `./statics/${Icon[status]}.png` );
    img.setAttribute( "class", "server__img" );
    img.setAttribute( "alt", status );
    wrapper.appendChild(img);

    const title = document.createElement('p');
    title.setAttribute( "class", "server__title" );
    title.setAttribute( "title", name );
    title.innerText = name;
    wrapper.appendChild(title);

    const state = document.createElement('p');
    state.setAttribute( "class", "server__status" );
    wrapper.appendChild(state);


    const stateLabel = document.createElement('span');
    stateLabel.innerText = 'وضعیت:';
    state.appendChild(stateLabel);
    

    const stateValue = document.createElement('span');
    stateValue.innerText = Status[status];
    state.appendChild(stateValue);

    content.appendChild(col);
}

function initialQueries() {
    API_KEY = localStorage.getItem('api_key');

    const Select = document.getElementById('servers');
    content.innerHTML = '';

    getRegions(BASE_URL, API_KEY);

    Select.addEventListener('change', (select) => {
        content.innerHTML = '';
        localStorage.setItem('region', select.target.value);
        getServer(BASE_URL, API_KEY, select.target.value);
    });

    ReloadBtn.addEventListener('click', () => {
        content.innerHTML = '';
        getServer(BASE_URL, API_KEY, localStorage.getItem('region'));
    });
}

(function() {
    NiceSelectElem = NiceSelect.bind(Select);
    if (localStorage.getItem('api_key')) {
        Loading.classList.remove("loading--hide");
        isLoading = true;
        initialQueries();
    } else {
        isLoading = false;
        Loading.classList.add("loading--hide");
        gettingApiToken();
    }
})();