// fanbox-downloaer

// Unique Functions
// Get Page Information

function getfanboxID() {
  if (location.hostname == "kemono.cr") {
    s = location.pathname.match(/(?<=user)(.*)(?=\/post)/); //@以降を取得
    return s[0];
  } else {
    return location.hostname.replace("kemono.cr", ""); //こっちはサブドメインを取得すればOK
  }
}

function getflatformName() {
  flatformName = document.querySelector(".post__title > span:nth-child(2)").textContent;
  if (flatformName == "(Pixiv Fanbox)") {
    flatformName = "Fanbox";
  } else if (flatformName == "(Patreon)") {
    flatformName = "Patreon";
  } else if (flatformName == "(Fantia)") {
    flatformName = "Fantia";
  } else if (flatformName == "(Afdian)") {
    flatformName = "Afdian";
  } else if (flatformName == "(Boosty)") {
    flatformName = "Boosty";
  } else if (flatformName == "(SubscribeStar)") {
    flatformName = "(SubscribeStar)";
  } else if (flatformName == "(DLsite)") {
    flatformName = "DLsite";
  } else if (flatformName == "(Gumroad)") {
    flatformName = "Gumroad";
  } else {
    flatformName = "Unknown";
  }
  return repFlatformname(flatformName);
}

function getuserID() {
  userID = document.querySelector("a.fancy-link:nth-child(1)").textContent;
  userID_true = userID.trim();
  return repUserID(userID_true);
}

function getPageID() {
  pageID = location.pathname.match(/(?<=\/post\/)[0-Z]*/);
  pageID_true = pageID[0].trim();
  return pageID_true;
}

function getTitle() {
  title = document.querySelector(".post__title > span:nth-child(1)").textContent;
  title_true = title.trim();
  return repTitlename(title_true);
}

function getDiff() {
  a = document.querySelectorAll(".post__thumbnail");
  a = a.length;
  return a;
}

function getAttDiff() {
  a = document.querySelectorAll(".post__attachment");
  a = a.length;
  return a;
}

function getimgURL(getnum) {
  a = document.querySelectorAll(".post__thumbnail")[getnum].querySelector("a").getAttribute("href");
  
  return a;
}

function getAttURL(getnum) {
  a = document.querySelectorAll(".post__attachment")[getnum].querySelector("a").getAttribute("href");
  if (a == null) {
  a = document.querySelectorAll(".post__attachments")[getnum].querySelector("a").getAttribute("href");
  }
  //console.log(`dlimg: Found ${a} files. Starting download requests...`);

  return a;
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
    filename = getTextname(textname) + ".txt";

    if (isChrominum() == true) {
      //console.log("SetFlag: Chrominum");
      const blob3 = URL.createObjectURL(blob2);
      //console.log(blob3);
      getFile("download", blob3, filename);
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
/*
async function dlimg() {
  diff = getDiff();
  for (var num = 0; num < diff; num++) {
    url = getimgURL(num);
    //console.log(url);
    filename = getFilename(num) + "." + getExttype(url);
    //console.log(filename);
    await new Promise((s) => {
      getFile("download", url, filename);
      setTimeout(s, 150);
    });
  }
}
*/

async function dlimg() {
  diff = getDiff();
  //console.log(`dlimg: Found ${diff} images. Starting download requests...`);
  for (var num = 0; num < diff; num++) {
    try { // 오류 발생 시 루프 중단을 막기 위해 try-catch 추가
      //console.log(`dlimg: Processing image ${num + 1}/${diff}`);
      const url = getimgURL(num);
      //console.log("dlimg: URL:", url);
      const filename = getFilename(num) + "." + getExttype(url);
      //console.log("dlimg: Filename:", filename);
      //console.log("dlimg: Sending download request for", filename);
      await new Promise((resolve, reject) => { // resolve/reject 추가
        getFile("download", url, filename);
          //console.log(`dlimg: Request sent for image ${num + 1}. Continuing...`);
          resolve(); // 성공 시 resolve 호출
        }, 100); // 지연 시간을 조금 늘려볼 수 있습니다 (예: 200ms)
    } catch (error) {
      console.error(`dlimg: Error processing image ${num + 1}:`, error);
      // 오류 발생 시 다음 이미지로 계속 진행할지 결정
    }
  }
  //console.log("dlimg: Finished sending all image download requests.");
}

/*
async function dlAttr() {
  diff = getAttDiff();
  for (var num = 0; num < diff; num++) {
    url_2 = getAttURL(num);
    //console.log(url_2);
    filename_2 = document.querySelectorAll(".post__attachment")[num].querySelector("a").getAttribute("download")
    //console.log(filename_2);
    await new Promise((s) => {
      getAttFile("download", url_2, filename_2);
      setTimeout(s, 150);
    });
  }
}
*/

// dlAttr 함수 내부 수정 예시
async function dlAttr() {
  const attachments = document.querySelectorAll(".post__attachment"); // 요소를 한 번만 선택
  const diff = attachments.length; // 선택된 요소의 길이 사용
  //console.log(`dlAttr: ${diff}개의 첨부 파일을 찾았습니다. 다운로드 요청을 시작합니다...`);

  for (var num = 0; num < diff; num++) {
    try { // 이전에 추가된 오류 처리는 좋습니다
      const attachmentElement = attachments[num].querySelector("a"); // 링크 요소 가져오기

      const url_2 = attachmentElement.getAttribute("href"); // URL 직접 가져오기
      const file_2 = attachmentElement.getAttribute("download"); // 파일 이름 가져오기
      //console.log("dlAttr: URL 및 파일 이름 확인 : ", url_2, file_2);
      if (!url_2 || !file_2) {
        console.warn(`dlAttr: 첨부 파일 ${num + 1}의 URL 또는 파일 이름을 찾을 수 없습니다. 건너뜁니다.`);
        continue; // URL이나 파일 이름이 없으면 다음 반복으로 건너뜁니다
      }

      //console.log("dlAttr: 원본 파일 이름 확인:", file_2);
      // *** 매크로 시스템을 사용하여 전체 경로 생성 ***
      // diff 유형(-2, 첨부 파일)과 원본 파일 이름을 전달합니다.
      full_path_filename = getAttFilename(file_2);

      // 올바른 경로/파일 이름으로 다운로드 요청 보내기
      // 요청 간 지연을 위해 await new Promise 사용
      await new Promise((resolve) => {
          getAttFile("download", url_2, full_path_filename);
          //console.log(`dlAttr: 다운로드 요청 전송 완료: ${full_path_filename}`);
          setTimeout(resolve, 150); // 다음 반복 시작 전 150ms 대기
      });
    //console.log("dlAttr: 모든 첨부 파일 다운로드 요청 전송 완료.");

    } catch (error) {
      console.error(`dlAttr: 첨부 파일 ${num + 1} 처리 중 오류 발생:`, error);
    }
  }
}

// getFilename 함수에 diff == -2 케이스가 이미 macro3를 사용하게 되어 있다면 위 코드에서 getFilename(-2) 사용 가능
// 또는 macro3 설정을 옵션 페이지에서 추가해야 함.

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

// Common Functions

function getFilename2(query) {
  // Macro処理
  query = query.replaceAll("$flatformName$", getflatformName());
  query = query.replaceAll("$userID$", getuserID());
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
  // ファイル名先頭処理
  return query.replace(/(^\s+)/g, "");
}

function repFlatformname(query) {
  hyp_src = [":", "/", "\\", "*", "?", '"', "<", ">", "|","."];
  hyp_rep = ["：", "／", "￥", "＊", "？", "”", "＜", "＞", "｜","．"];
  for (i = 0; i < hyp_src.length; i++) {
    query = query.replaceAll(hyp_src[i], hyp_rep[i]);
  }
  return query.replace(/(^\s+)/g, "");
}
function repFilename(query) {
  hyp_src = [":", "/", "\\", "*", "?", '"', "<", ">", "|",];
  hyp_rep = ["：", "／", "￥", "＊", "？", "”", "＜", "＞", "｜"];
  for (i = 0; i < hyp_src.length; i++) {
    query = query.replaceAll(hyp_src[i], hyp_rep[i]);
  }
  return query.replace(/(^\s+)/g, "");
}

function repTitlename(query) {
  hyp_src = [":", "/", "\\", "*", "?", '"', "<", ">", "|","."];
  hyp_rep = ["：", "／", "￥", "＊", "？", "”", "＜", "＞", "｜","．"];
  for (i = 0; i < hyp_src.length; i++) {
    query = query.replaceAll(hyp_src[i], hyp_rep[i]);
  }
  return query.replace(/(^\s+)/g, "");
}

function repUserID(query) {
  hyp_src = [":", "/", "\\", "*", "?", '"', "<", ">", "|","."];
  hyp_rep = ["：", "／", "￥", "＊", "？", "”", "＜", "＞", "｜","．"];
  for (i = 0; i < hyp_src.length; i++) {
    query = query.replaceAll(hyp_src[i], hyp_rep[i]);
  }
  return query.replace(/(^\s+)/g, "");
}

function getFilename(diff) {
  let query;
  query = getFilename2(macro2);
  query = query.replaceAll("$DiffCount$", getDiff());
  query = query.replaceAll("$Diff$", ("" + (diff + 1)).padStart(3, "0"));
  return query; // 최종 처리된 경로/파일 이름 반환
}

function getTextname(name) {
  let query;
  query = getFilename2(macro);
  query = query.replaceAll("$TextName$", name);
  //console.log("getTextname: 처리된 파일 이름:", query);
  return query; // 최종 처리된 경로/파일 이름 반환
}

function getAttFilename(name) {
  let query;
  query = getFilename2(macro3); // macro3의 기본 플레이스홀더 처리 ($userID$, $Title$ 등)
  // attachmentName이 유효하고, getFilename2 처리 결과 query에 '$AttrName$'이 포함되어 있는지 확인
  query = query.replaceAll("$AttrName$", name); // '$AttrName$'을 실제 파일 이름으로 치환
  //console.log("getAttFilename: 처리된 파일 이름:", query);
  return query; // 최종 처리된 경로/파일 이름 반환
}

// URIから判定する場合
function getExttype(URL) {
  return URL.split("/").reverse()[0].split(".")[2];
}

function getFile(type, url, filename) {
  chrome.runtime.sendMessage({
    type: type,
    url: url,
    filename: filename,
  });
}

function getAttFile(type, url, filename) {
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
  //dateNow = new Date (2023,7 -1 ,1,0,15,23);

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
  // ... 매크로 설정 ...
  if (str.saveimg == true) {
    //console.log("Enabled SaveImage");
    //console.log("Starting image downloads...");
    await dlimg(); // dlimg의 모든 요청 전송이 끝날 때까지 대기
    //console.log("Finished requesting image downloads.");  
  }
  
  if (str.savetext == true) {
    //console.log("Enabled SaveText");
    dlText(); // dlText는 동기적으로 메시지를 보내므로 await 불필요
  }

  if (str.saveattr == true) {
    //console.log("Enabled SaveAttributes");
    //console.log("Starting attribute downloads...");
    await dlAttr(); // dlAttr의 모든 요청 전송이 끝날 때까지 대기
    //console.log("Finished requesting attribute downloads.");
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