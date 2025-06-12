// ==UserScript==
// @name BiliBili 过滤器
// @namespace Violentmonkey Scripts
// @match https://www.bilibili.com/*
// @grant none
// @version 1.3
// @author ExpZero
// @description 2025/5/10 21:56:20
// ==/UserScript==

(function () {
  'use strict';

/* 定义一些状态 */
var flag_bFilter = true; // 是否启用过滤
var limit_seconds = 150; // 过滤阈值，单位是秒




/* 定义一些工具函数 */

// 将xx:xx转为秒数
function timestrToSecond(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

// 删除卡片自身
function rmCardSelf(card) {

  var card_t = card;
  while(card_t.className!='feed-card'){
    if(card_t.parentNode==null) {break;}
    var card_t = card_t.parentNode;
  }
  if(card_t.className === 'feed-card'){
    card_t.parentNode.removeChild(card_t);
  }else{
    console.log("--------> Card Remove Failed:");
    console.log(card);
  }
}


/* 这些是针对 https://www.bilibili.com 这个主站的 */

// 增加一个领导ID，经过研究发现带领导ID明显能使得页面加载的垃圾更少
function addLeaderId() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    if (pathname === '/' && search != '?leaderID=0101') {
        window.location.href = "https://www.bilibili.com/?leaderID=0101";
    }
}

// 获取所有普通展示卡片
function getNormalCards() {
    return document.querySelectorAll("div[class='bili-video-card is-rcmd enable-no-interest']");

}
// 获取所有广告卡片
function getAdCards() {
    return document.querySelectorAll("div[class='bili-video-card is-rcmd']");
}
// 获取所有课堂、电影推荐等卡片
function getSingleCards() {
    return document.querySelectorAll("div[class='floor-single-card']");
}
// 获取所有直播推荐卡片
function getLiveCards() {
    return document.querySelectorAll("div[class='bili-live-card is-rcmd enable-no-interest']");
}


// 获取视频卡片的时长-单位为秒
function getVideoDurationFromCard(card) {
    const strTime = card.querySelector("span[class='bili-video-card__stats__duration']");
    if (strTime) {
        return timestrToSecond(strTime.outerText);
    } else {
        return 1;
    }
}

// 清理掉超短时长视频卡片（垃圾水卡）
function cleanShortVideoCards(cards) {
    Array.from(cards).forEach((card) => {
        const numSeconds = getVideoDurationFromCard(card);
        // 设定过滤阈值(秒)
        if (numSeconds < limit_seconds) { rmCardSelf(card); }
    });
}

// 清理其他卡片
function cleanOtherCards() {
    let cards1 = getAdCards();
    Array.from(cards1).forEach((card) => { rmCardSelf(card); });
    let cards2 = getSingleCards();
    Array.from(cards2).forEach((card) => { rmCardSelf(card) });
    let live_cards = getLiveCards();
    Array.from(live_cards).forEach((card) => { rmCardSelf(card) });
}

// 定时清理
function CirclecleanShortVideoCards() {
    var numList = 0;
    function myFunction() {
        if(flag_bFilter){
            cleanOtherCards();
            let cards = getNormalCards();
            let numListTmp = cards.length;
            if (numListTmp != numList) {
                cleanShortVideoCards(cards);
                numList = numListTmp;
          }
        }
    }
    setInterval(myFunction, 1000);
}

// 添加设置按钮
function insertSettingButtion() {
    window.addEventListener('load',function (){
      // 生成设置按钮
        const htmlSettingButton = `<button class="right-entry__outside" id="filter_62185C17"><svg viewBox="0 0 24 24" width="20" height="20" class="right-entry-icon"><path d="M18.50005 13.62185C17.6035 13.62185 16.87675 12.89505 16.87675 11.99845C16.87675 11.10195 17.6035 10.37514 18.50005 10.37514C19.39665 10.37514 20.1234 11.10195 20.1234 11.99845C20.1234 12.89505 19.39665 13.62185 18.50005 13.62185zM5.49992 13.6219C4.6033 13.6219 3.87644 12.8951 3.87644 11.99845C3.87644 11.1018 4.6033 10.37497 5.49992 10.37497C6.39655 10.37497 7.12342 11.1018 7.12342 11.99845C7.12342 12.8951 6.39655 13.6219 5.49992 13.6219zM10.37357 11.99845C10.37357 12.8959 11.10105 13.6234 11.99845 13.6234C12.8959 13.6234 13.6234 12.8959 13.6234 11.99845C13.6234 11.10105 12.8959 10.37352 11.99845 10.37352C11.10105 10.37352 10.37357 11.10105 10.37357 11.99845z" fill="currentColor"></path></svg><span class="right-entry-text">启用过滤</span></button>`
        const new_li = document.createElement("li");
        new_li.innerHTML = htmlSettingButton;
        // 添加到页面
        const right_entry = document.querySelector(".right-entry");
        if (right_entry) {
            const right_entry_child = right_entry.querySelector('li[class="right-entry-item right-entry-item--upload"]');
            if (right_entry_child) {
                right_entry.insertBefore(new_li, right_entry_child);
            } else {
                right_entry.appendChild(new_li);
                console.log("-------> 定位目标位置失败，尝试直接加入");
            }
        } else {
            console.log("-------> Not Found right-entry:" + right_entry);
        }

        // 设置触发函数
        function set_filter(button) {
            const span = set_button.querySelector("span");
            flag_bFilter = !flag_bFilter;
            if(flag_bFilter){
              span.textContent = '已过滤';
            }else{
              span.textContent = '未过滤';
            }
        }
        const set_button = document.getElementById("filter_62185C17");
        if (set_button) {
            set_button.addEventListener("click", function () { set_filter(this); });
            console.log("----->已添加过滤设置按钮");
        }
    });
}


if (window.location.pathname === '/') {
    console.log("---> 主站：执行");
    addLeaderId();
    CirclecleanShortVideoCards();
    insertSettingButtion();
}


})();
