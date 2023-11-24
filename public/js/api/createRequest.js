/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
    const xhr = new XMLHttpRequest(),
        arr = [],
        formData = new FormData();
    let url;
    if (options.method === `GET`) {
        if (options.data) {
            for (let i of Object.entries(options.data)) {
                const key = i[0],
                    value = i[1];

                arr.push(`${key}=${value}`);
            }

        }
        url = options.data ? `${options.url}?${arr.join(`&`)}` : `${options.url}`;
    } else {
        for (let i of Object.entries(options.data)) {
            const key = i[0],
                value = i[1];
            formData.append(`${key}`, `${value}`);
        }
        url = `${options.url}`;
    }  
    xhr.responseType = options.responseType;
    try {
        xhr.open(options.method, url);
        xhr.send(formData);
    } catch (e) {
        return  new Error(`Что то пошло не так`, e);

    }
    xhr.onload = () => options.callback(xhr.error, xhr.response);
}
