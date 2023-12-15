/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
    const xhr = new XMLHttpRequest();
    let url = options.url;
    const formData = new FormData();

    if (options.method === GET) {
        const arr = [];
        for (let [key, value] of Object.entries(options.data || {})) {
                arr.push(`${key}=${value}`);
        }
        url += arr.length ? `?${arr.join('&')}` : '';
    } else {
        for (let [key, value] of Object.entries(options.data || {})) {
            formData.append(key, value);
        }
    }

    xhr.responseType = options.responseType;

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            options.callback(null, xhr.response);
        } 
    };

    try {
        xhr.open(options.method, url);
        xhr.send(options.method === GET ? null : formData);
    } catch (e) {
        return new Error('Что-то пошло не так', e);
    }
};
