const start = document.querySelector("#start");

start.addEventListener("click", (event) => {
  event.preventDefault();
  start.textContent = "Coming next";
});
