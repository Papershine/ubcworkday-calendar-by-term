let findCalendarPageInterval = setInterval(findCalendarPage, 2000);
let findCalendarPageCount = 0;

let listenForCalendarInterval = null;

let courseData = null;

function findCalendarPage() {
  const bodyText = document.body.innerText;
  const regex = /View My Courses/;
  if (bodyText.match(regex) != null) {
    listenForCalendarInterval = setInterval(listenForCalendar, 2000);
    clearInterval(findCalendarPageInterval);
  }
  if (findCalendarPageCount >= 100) {
    clearInterval(findCalendarPageInterval);
  }
  findCalendarPageCount++;
}

function listenForCalendar() {
  const bodyText = document.body.innerText;
  const regex = /View as Course Calendar/;
  if (bodyText.match(regex) != null) {
    console.log("Calendar opened");
    injectButtons();
    parseCourseData();
    clearInterval(listenForCalendarInterval);
  }
}

function injectButtons() {
  const calendarToolbar = document.querySelector("[data-automation-id='calendarToolbar']")
  const extensionToolbar = `
    <div class='cbt-toolbar'>
      <a role='button' id='cbt-allButton' class='cbt-button'>All</a>
      <a role='button' id='cbt-termOneButton' class='cbt-button'>Winter Term 1</a>
      <a role='button' id='cbt-termTwoButton' class='cbt-button'>Winter Term 2</a>
    </div>
  `;
  
  if (calendarToolbar) {
    console.log("found toolbar");
    calendarToolbar.innerHTML += extensionToolbar;

    const allButton = document.getElementById("cbt-allButton");
    const termOneButton = document.getElementById("cbt-termOneButton");
    const termTwoButton = document.getElementById("cbt-termTwoButton");
    allButton.addEventListener("click", function() {
      resetAll();
    });
    termOneButton.addEventListener("click", function() {
      chooseTermOne();
    });
    termTwoButton.addEventListener("click", function() {
      chooseTermTwo();
    });
  }
}

function resetAll() {
  console.log("resetAll");
  getAllCalendarCourses().forEach((elm) => {
    elm.classList.remove("cbt-hidden");
    elm.parentElement.parentElement.classList.remove("cbt-forceFullWidth");
    elm.parentElement.parentElement.classList.remove("cbt-forcePosition");
  })
}

function chooseTermOne() {
  resetAll();
  getAllCalendarCourses().forEach((elm) => {
    const sectionTitle = elm.innerText.split("\n")[0];
    const sectionData = findSection(sectionTitle);
    if (!(sectionData.startMonth === 9 || sectionData.startMonth === 5)) { // if the course doesnt start on January or May, hide it
      elm.classList.add("cbt-hidden");
    } else {
      elm.parentElement.parentElement.classList.add("cbt-forceFullWidth");
      if (isCourseElementOffset(elm)) {
        elm.parentElement.parentElement.classList.add("cbt-forcePosition");
      }
    }
  })
}

function chooseTermTwo() {
  resetAll();
  getAllCalendarCourses().forEach((elm) => {
    const sectionTitle = elm.innerText.split("\n")[0];
    const sectionData = findSection(sectionTitle);
    if (!(sectionData.endMonth === 4 || sectionData.endMonth === 8)) { // if the course doesnt end on August or April, hide it
      elm.classList.add("cbt-hidden");
    } else {
      elm.parentElement.parentElement.classList.add("cbt-forceFullWidth");
      if (isCourseElementOffset(elm)) {
        elm.parentElement.parentElement.classList.add("cbt-forcePosition");
      }
    }
  })
}

function getAllCalendarCourses() {
  return document.querySelectorAll(".WLSC.WMSC.WMUC.WMVC");
}

function findSection(section) {
  const found = courseData.filter((course) => course.section === section);
  return found[0];
}

function isCourseElementOffset(elm) {
  const conditions = ["7.", "21.", "35.", "50", "64.", "78.", "92."];
  return conditions.some((cond) => elm.parentElement.parentElement.style.left.startsWith(cond));
}

function parseCourseData() {
  const courseTables = document.querySelectorAll("[data-automation-id='table']");
  let courses = []
  courseTables.forEach((table) => {
    courses = courses.concat(tableToJson(table));
  })
  courseData = transformCourseJson(courses);
  console.log(courseData);
}

function transformCourseJson(cousesJson) {
  const transformedCourses = cousesJson.map((course) => {
    let newCourseObj = {
      section: course.section.split(" - ")[0],
      startMonth: new Date(Date.parse(course.startDate)).getMonth() + 1, // January is 1 here
      endMonth: new Date(Date.parse(course.endDate)).getMonth() + 1
    };
    return newCourseObj;
  });
  return transformedCourses;
}

function tableToJson(table) {
  var data = [];
  var headers = ["searchbar", "title", "credits", "grading", "section", "format", "delivery", "pattern", "status", "instructor", "startDate", "endDate"];
  for (var i=2; i<table.rows.length; i++) {
      var tableRow = table.rows[i];
      var rowData = {};
      for (var j=0; j<tableRow.cells.length; j++) {
          rowData[ headers[j] ] = tableRow.cells[j].innerText;
      }
      data.push(rowData);
  }
  return data;
}