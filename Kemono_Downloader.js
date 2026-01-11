function getPlatformName() {
  let platformName = document.querySelector(".post__title span:last-child").textContent;
  platformName = platformName.replace(/[()]/g, "");
  return sanitizeText(platformName);
}

function getUserName() {
  let userName = document.querySelector("a.post__user-name").textContent;
  return sanitizeText(userName);
}

function getUserID() {
  let userID = location.pathname.match(/(?<=user\/)(.*)(?=\/post)/);
  return userID[0];
}

function getPageID() {
  let pageID = location.pathname.match(/(?<=\/post\/)[a-zA-Z0-9-]+/);
  return pageID[0];
}

function getTitle() {
  let title = document.querySelector(".post__title span:first-child").textContent;
  return sanitizeText(title);
}

function getImagesCount() {
  return document.querySelectorAll(".post__thumbnail").length;
}

function getAttachmentsCount() {
  return document.querySelectorAll(".post__attachment").length;
}

function getImageURL(getnum) {
  return document.querySelectorAll(".post__thumbnail")[getnum].querySelector("a").getAttribute("href");
}

function getAttachmentURL(getnum) {
  return document.querySelectorAll(".post__attachment")[getnum].querySelector("a").getAttribute("href");
}

function getText() {
  try {
    text = document.querySelector(".post__content").querySelector("p");
    return text;
  } catch (error) {
    try {
      text = document.querySelector(".post__content").querySelector("pre").innerText;
      return text;
    } catch (err) {
      return 0;
    }
  }
}

function dlText() {
  if (getText() != 0) {
    const blob2 = new Blob([getText()], { type: "text/plain" });
    filename = getTextSavePathAndName(textname) + ".txt";

    if (isChrominum() == true) {
      const blob3 = URL.createObjectURL(blob2);
      dlFile("download", blob3, filename);
      //URL.revokeObjectURL(blob3)
    } else {
      chrome.runtime.sendMessage({
        type: "blob",
        blob: blob2,
        filename: filename,
      });
    }
  }
}

async function dlImages() {
  let count = getImagesCount();
  for (let num = 0; num < count; num++) {
    try {
      const url = getImageURL(num);
      const filename = getImageSavePathAndName(num) + "." + getFileExtension(url);
      await new Promise((resolve, reject) => {
        dlFile("download", url, filename);
        resolve();
      }, 100); // 지연 시간을 조금 늘려볼 수 있습니다 (예: 200ms)
    } catch (error) {
      console.error(`dlImages: Error processing image ${num + 1}:`, error);
      // 오류 발생 시 다음 이미지로 계속 진행할지 결정
    }
  }
}

async function dlAttachments() {
  const attachments = document.querySelectorAll(".post__attachment");
  const diff = attachments.length;

  for (var num = 0; num < diff; num++) {
    try {
      const attachmentElement = attachments[num].querySelector("a");

      const url_2 = attachmentElement.getAttribute("href");
      const file_2 = attachmentElement.getAttribute("download");
      if (!url_2 || !file_2) {
        console.warn(`dlAttachments: 첨부 파일 ${num + 1}의 URL 또는 파일 이름을 찾을 수 없습니다. 건너뜁니다.`);
        continue; // URL이나 파일 이름이 없으면 다음 반복으로 건너뜁니다
      }

      // *** 매크로 시스템을 사용하여 전체 경로 생성 ***
      // diff 유형(-2, 첨부 파일)과 원본 파일 이름을 전달합니다.
      full_path_filename = getAttachmentSavePathAndName(file_2);

      // 올바른 경로/파일 이름으로 다운로드 요청 보내기
      // 요청 간 지연을 위해 await new Promise 사용
      await new Promise((resolve) => {
          dlFile("download", url_2, full_path_filename);
          setTimeout(resolve, 150); // 다음 반복 시작 전 150ms 대기
      });

    } catch (error) {
      console.error(`dlAttachments: 첨부 파일 ${num + 1} 처리 중 오류 발생:`, error);
    }
  }
}

function getDate(num) {
  try {
    src = document.querySelector(".timestamp").getAttribute("datetime");
    replaced = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)/.exec(src);
    return replaced[num];
  } catch (error) {
    replaced = [ "0", "0000", "00", "00", "00", "00", "00" ]
    return replaced[num];
  }
}

function convertMacrosInPath(query) {
  query = query.replaceAll("$PlatformName$", getPlatformName());
  query = query.replaceAll("$UserName$", getUserName());
  query = query.replaceAll("$UserID$", getUserID());
  query = query.replaceAll("$Title$", getTitle());
  query = query.replaceAll("$PageID$", getPageID());
  query = query.replaceAll("$YYYY$", getDate(1));
  query = query.replaceAll("$YY$", getDate(1).slice(-2));
  query = query.replaceAll("$MM$", getDate(2));
  query = query.replaceAll("$DD$", getDate(3));
  query = query.replaceAll("$hh$", getDate(4));
  query = query.replaceAll("$YYYY28$", getDate(1, true));
  query = query.replaceAll("$YY28$", getDate(1, true).slice(-2));
  query = query.replaceAll("$MM28$", getDate(2, true));
  query = query.replaceAll("$DD28$", getDate(3, true));
  query = query.replaceAll("$hh28$", getDate(4, true));
  query = query.replaceAll("$mm$", getDate(5));
  query = query.replaceAll("$NYYYY28$", getDateNow(1, true));
  query = query.replaceAll("$NYY28$", getDateNow(1, true).slice(-2));
  query = query.replaceAll("$NMM28$", getDateNow(2, true));
  query = query.replaceAll("$NDD28$", getDateNow(3, true));
  query = query.replaceAll("$Nhh28$", getDateNow(4, true));
  query = query.replaceAll("$Nmm$", getDateNow(5));
  return query.trim();
}

function sanitizeText(text, includeDot = true) {
  if (!text) return "";

  const charMap = {
    ':': '：', '/': '／', '\\': '￥', '*': '＊',
    '?': '？', '"': '”', '<': '＜', '>': '＞', '|': '｜', '\n': ' '
  };

  if (includeDot) charMap['.'] = '．';

  const pattern = new RegExp(`[${Object.keys(charMap).join('\\')}]`, 'g');

  return text.replace(pattern, (match) => charMap[match]).trim();
}

function getImageSavePathAndName(diff) {
  let query;
  query = convertMacrosInPath(macro2);
  query = query.replaceAll("$DiffCount$", getImagesCount());
  query = query.replaceAll("$Diff$", ("" + (diff + 1)).padStart(3, "0"));
  return query;
}

function getTextSavePathAndName(name) {
  let query;
  query = convertMacrosInPath(macro);
  query = query.replaceAll("$TextName$", name);
  return query;
}

function getAttachmentSavePathAndName(name) {
  let query;
  query = convertMacrosInPath(macro3);
  query = query.replaceAll("$AttrName$", name);
  return query;
}

function getFileExtension(URL) {
  return URL.split("/").reverse()[0].split(".")[2];
}

function dlFile(type, url, filename) {
  chrome.runtime.sendMessage({
    type: type,
    url: url,
    filename: filename,
  });
}

function isChrominum() {
  const s = chrome.runtime.getURL("");
  if (/chrome/.test(s) == true) {
    return true;
  } else return false;
}

function getDateNow(query, custom) {
  dateNow = new Date(Date.now());

  replaced = [
    dateNow,
    dateNow.getFullYear().toString(),
    (dateNow.getMonth() + 1).toString(),
    dateNow.getDate().toString(),
    dateNow.getHours().toString(),
    dateNow.getMinutes().toString(),
  ];
  if (custom & (replaced[4] < 4)) {
    //28h表記 4時前ならば1日前にずらして本来の時間+24hにする
    // 年月日はDateの補正を利用する
    // 日時は純粋に進めればOKなので出力値を上書き
    customDate = new Date(replaced[1], replaced[2] - 1, replaced[3] - 1); //補正用
    replaced = [
      dateNow, //歪んだ値はそのまま入らない（元のまま）
      customDate.getFullYear().toString(),
      (customDate.getMonth() + 1).toString(),
      customDate.getDate().toString(),
      (dateNow.getHours() + 24).toString(),
      dateNow.getMinutes().toString(),
    ];
  }
  return replaced[query].padStart(2, "0");
}


async function main(str) {
  globalThis.textname = str.textname;
  globalThis.macro = str.macro;
  globalThis.macro2 = str.macro2;
  globalThis.macro3 = str.macro3;

  if (str.saveimg == true) {
    await dlImages(); // dlImages의 모든 요청 전송이 끝날 때까지 대기
  }
  if (str.savetext == true) {
    dlText(); // dlText는 동기적으로 메시지를 보내므로 await 불필요
  }
  if (str.saveattr == true) {
    await dlAttachments(); // dlAttachments의 모든 요청 전송이 끝날 때까지 대기
  }
}

chrome.runtime.onMessage.addListener(function (request, sender) {
  chrome.storage.local.get(
    ["savetext", "saveimg", "saveattr", "textname", "macro", "macro2", "macro3"],
    function (str) {
      if (str.macro == undefined) {
        alert("kemono-downloader：확장 프로그램 설정을 해주세요.");
        return chrome.runtime.sendMessage({ type: "set" });
      } else {
        main(str);
      }
    }
  );
});