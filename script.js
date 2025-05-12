function showNotification() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
  } else if (Notification.permission === "granted") {
    new Notification("Hello!", { body: "This is a GitHub Pages notification!" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification("Hello!", { body: "Thanks for enabling notifications!" });
      }
    });
  }
}
