"use strict"

const TIMEOUT_SEC = 5
const BAR_HEIGHT = 120

const timer = async function (s) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("We have troble getting data, please try again"))
    }, s * 1000)
  })
}

const getData = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timer(TIMEOUT_SEC)])
    const data = await res.json()

    if (!res.ok) throw new Error(`Something wrong, ${res.status}`)
    return data
  } catch (err) {
    console.error(err)
  }
}

const generateMarkup = function (data) {
  let today = new Date().getDay()
  if (today === 0) today = 6

  return data
    .map((data, i) => {
      return `
      <li class="chart__item">
        
        <div class="bar ${data.day} ${today === i ? "today" : ""}">
          <div class="amount">$${data.amount}</div>
        </div>
        <span class="day">${data.day}</span>
      </li>
    `
    })
    .join("")
}

const loadChart = async function () {
  // 1) load data
  const data = await getData(`./data.json`)
  console.log(data)

  const amountArr = data.map((data) => data.amount)
  const max = Math.max(...amountArr)

  const totalAmount = data
    .map((data) => data.amount)
    .reduce((acc, exp) => (acc += exp), 0)

  const dayArr = data.map((data) => data.day)

  // 2) generate markup
  const markup = generateMarkup(data)

  // 3) render
  document.querySelector(".chart").insertAdjacentHTML("afterbegin", markup)
  document.querySelector(".expense__value").innerHTML = `$${totalAmount}`

  data.forEach(
    (data) =>
      (document.querySelector(`.${data.day}`).style.height = `${
        (data.amount / max) * BAR_HEIGHT
      }px`)
  )
}

loadChart()
