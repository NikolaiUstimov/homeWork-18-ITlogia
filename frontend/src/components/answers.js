"use strict";

import {Auth} from "../services/auth.js";
import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Answers {
    constructor () {
        this.routeParams = UrlManager.getQueryParams();
        this.result = null;
        this.nameTest = null;
        this.spanUserText = null;
        this.answersBox = null;
        this.backResultText = null;

        this.init();
        this.backLocation();
    }

    async init () {

        this.nameTest = document.querySelector('.answers-questions-text');
        this.answersBox = document.getElementById('answers-box');

        this.showUser();

        //Запрос теста по id
        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + this.routeParams.userId);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.result = result;
                console.log('result', result);
                console.log('result', result.test.questions);
                this.nameTest.innerText = result.test.name;
            }
        } catch (error) {
            return console.log(error);
        }

        console.log(this.result);
        this.result.test.questions.forEach((question, index) => {
            question.id = index + 1;
            const questionBox = document.createElement('div');
            const questionTitle = document.createElement('h2');
            questionTitle.innerHTML = '<span>Вопрос ' + question.id +':</span> ' + question.question;
            questionTitle.className = 'test-question-title answers-title';
            const answerBox = document.createElement('ul');
            answerBox.className = 'answer-question-options';
            questionBox.append(questionTitle, answerBox);

            question.answers.forEach((answer) => {
                const answerElement = document.createElement('li');
                answerElement.className = 'test-question-option';

                const inputId = 'answer-' + answer.id;
                const inputElement = document.createElement('input');
                inputElement.className = 'option-answer';
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer' + question.id);
                inputElement.setAttribute('value', answer.id);
                inputElement.setAttribute('disabled', 'disabled');

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                answerElement.append(inputElement, labelElement);
                answerBox.appendChild(answerElement);
                questionBox.appendChild(answerBox);

                //По значению флага correct добавляем стили к выбранным пользователем вопросам
                if (answer.correct === true) {
                    inputElement.classList.add('correct-answer');
                    labelElement.classList.add('correct-answer-text');
                } else if (answer.correct === false) {
                    inputElement.classList.add('incorrect-answer');
                    labelElement.classList.add('incorrect-answer-text');
                }
            });

            this.answersBox.append(questionBox);
        });

    }

    backLocation() {
        this.backResultText = document.getElementById('back-result').onclick = function () {
            window.history.back();
        }
    }

    showUser() {
        //Показ на странице имени, фамилии и email
        const userEmail = Auth.getUserEmail();
        const userFullName = Auth.getUserInfo();

        this.spanUserText = document.getElementById('user-text');
        if (userEmail && userFullName && userFullName.fullName) {
            this.spanUserText.innerText = `${userFullName.fullName}, ${userEmail}`;
        } else {
            console.error("User data is missing or incomplete");
            this.spanUserText.innerText = 'Данные пользователя отсутствуют';
        }
    }
}