let findCalendarPageInterval = setInterval(findCalendarPage, 2000);

let listenForCalendarInterval = null;

let calendarOpen = false;

let courseData = null;

function findCalendarPage() {
  const bodyText = document.body.innerText;
  const regex = /(View My Courses|View as Course Calendar)/;
  if (bodyText.match(regex) != null) {
    listenForCalendarInterval = setInterval(listenForCalendar, 1000);
    clearInterval(findCalendarPageInterval);
  }
}

function listenForCalendar() {
  const bodyText = document.body.innerHTML;
  const regex = />View as Course Calendar</;
  const textMatched = bodyText.match(regex) != null
  if (textMatched && !calendarOpen) {
    calendarOpen = true;
    injectButtons();
    parseCourseData();
  } else if (!textMatched && calendarOpen) {
    calendarOpen = false;
  }
}

function injectButtons() {
  const calendarToolbar = document.querySelector("[data-automation-id='calendarToolbar']")
  const extensionToolbar = `
    <div class='cbt-toolbar'>
      <a role='button' id='cbt-allButton' class='cbt-button cbt-active'>All</a>
      <a role='button' id='cbt-termOneButton' class='cbt-button'>Term 1</a>
      <a role='button' id='cbt-termTwoButton' class='cbt-button'>Term 2</a>
    </div>
  `;
  
  if (calendarToolbar) {
    calendarToolbar.innerHTML += extensionToolbar;

    const allButton = document.getElementById("cbt-allButton");
    const termOneButton = document.getElementById("cbt-termOneButton");
    const termTwoButton = document.getElementById("cbt-termTwoButton");
    allButton.addEventListener("click", function() {
      resetAll();
      allButton.classList.add("cbt-active");
      termOneButton.classList.remove("cbt-active");
      termTwoButton.classList.remove("cbt-active");
    });
    termOneButton.addEventListener("click", function() {
      chooseTermOne();
      termOneButton.classList.add("cbt-active");
      allButton.classList.remove("cbt-active");
      termTwoButton.classList.remove("cbt-active");
    });
    termTwoButton.addEventListener("click", function() {
      chooseTermTwo();
      termTwoButton.classList.add("cbt-active");
      allButton.classList.remove("cbt-active");
      termOneButton.classList.remove("cbt-active");
    });
  }
}

function resetAll() {
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
    if (!(sectionData.startMonth === 9 || sectionData.startMonth === 5)) {
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
    if (!(sectionData.endMonth === 4 || sectionData.endMonth === 8)) {
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
  return document.querySelectorAll(".WJSC.WKSC.WKTC.WJUC");
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
  for (var i=2; i<table.rows.length; i++) {
      var tableRow = table.rows[i];
      var rowData = {
        section: tableRow.cells[5]?.innerText,
        startDate: tableRow.cells[11]?.innerText,
        endDate: tableRow.cells[12]?.innerText
      };
      if (!(rowData.section && rowData.startDate && rowData.endDate)) {
        continue;
      }
      data.push(rowData);
  }
  return data;
}
