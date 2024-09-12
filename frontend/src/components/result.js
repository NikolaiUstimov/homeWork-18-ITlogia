'use strict';

import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Result {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.result = null;

        this.init();
        this.routAnswers();
    }

    //Функция запроса на backend для получения результатов теста
    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId);

                if (result) {
                    console.log('result', result);
                    this.result = result;
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    document.getElementById('result-score').innerText = result.score + '/' + result.total;
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
        location.href = '#/';
    }

    routAnswers() {
        document.getElementById('pass').onclick = () => {
            location.href = '#/answers?id=' + this.result.test_id + '&userId=' + this.result.user_id;
        }
    }
}