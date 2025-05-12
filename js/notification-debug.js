// Notification Test Utility
document.addEventListener("DOMContentLoaded", function () {
  // Check if browser supports notifications
  const notificationSupport = "Notification" in window;
  const notificationStatus = Notification.permission;

  // Console logs for debugging
  console.log("Notification Diagnostics:");
  console.log("- Browser supports notifications:", notificationSupport);
  console.log("- Current permission status:", notificationStatus);

  // Log timezone information (helpful for IST conversion debugging)
  console.log("Timezone Diagnostics:");
  console.log(
    "- Browser timezone:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  console.log(
    "- Local timezone offset (minutes):",
    new Date().getTimezoneOffset()
  );
  console.log("- IST offset from UTC (hours):", 5.5);

  // Create and log a sample IST time conversion
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const istMs = utcMs + 5.5 * 60 * 60 * 1000;
  const istDate = new Date(istMs);

  console.log("Time Conversion Test:");
  console.log("- Current local time:", now.toString());
  console.log("- Converted to IST:", istDate.toString());

  // Function to trigger a test notification from console
  window.testNotification = function (delay = 5) {
    console.log(`Scheduling test notification in ${delay} seconds...`);

    if (Notification.permission !== "granted") {
      console.error("Notification permission not granted. Cannot test.");
      return false;
    }

    setTimeout(() => {
      const notification = new Notification("Test Notification", {
        body: `This is a test notification triggered at ${new Date().toLocaleTimeString()}`,
        icon: "https://cdn-icons-png.flaticon.com/512/2838/2838779.png",
      });

      console.log("Test notification sent!");
    }, delay * 1000);

    return true;
  };

  // Log instructions for manual testing
  console.log("\nManual Testing Instructions:");
  console.log(
    "1. Run window.testNotification() to trigger a test notification"
  );
  console.log(
    "2. Run window.testNotification(10) to trigger a test notification after 10 seconds"
  );
  console.log(
    "3. Double-click the notification button in the UI to create a test reminder"
  );
});
