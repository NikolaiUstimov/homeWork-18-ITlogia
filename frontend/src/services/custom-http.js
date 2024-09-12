import {Auth} from "./auth.js";

//Кастомная отправка запросов для переиспользование
export class CustomHttp {
  static async request(url, method = 'GET', body = null) {

    const params = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };
    let token = localStorage.getItem(Auth.accessTokenKey);
    if (token) {
      params.headers['x-access-token'] = token;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    const response = await fetch(url, params);

    //проверка запроса
    if (response.status < 200 || response.status >= 300) {
      if (response.status === 401) {
        //Запрос на обновление токена, если он заэкспайрился
        const result = await Auth.processUnauthorizedResponse();
        if (result) {
          //Рекурсия
          return await this.request(url, method, body);
        } else {
          return null;
        }
      }
      throw new Error(response.message);
    }

    return await response.json();
  }
}