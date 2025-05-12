// Professional Reminder & Scheduler - Main Application Logic
document.addEventListener("DOMContentLoaded", function () {
  // Initialize variables
  let reminders = loadFromLocalStorage() || [];
  let selectedCountry = { name: "United States", code: "US", dialCode: "+1" }; // Default country
  let notificationPermissionGranted = false;

  // DOM Elements
  const countrySearch = document.getElementById("countrySearch");
  const countryDropdown = document.getElementById("countryDropdown");
  const selectedCountryCode = document.getElementById("selectedCountryCode");
  const phoneNumber = document.getElementById("phoneNumber");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const istTime = document.getElementById("istTime");
  const notesInput = document.getElementById("notesInput");
  const reminderForm = document.getElementById("reminderForm");
  const remindersList = document.getElementById("remindersList");
  const notificationPermission = document.getElementById(
    "notificationPermission"
  );
  const notificationStatus = document.getElementById("notificationStatus");
  const statusFilters = document.querySelectorAll(".status-filter");

  // Set default date to today
  const today = new Date();
  dateInput.value = today.toISOString().split("T")[0];

  // Initialize countries dropdown
  initializeCountryDropdown();

  // Set up event listeners
  setupEventListeners();

  // Display existing reminders
  displayReminders();

  // Initialize notifications
  initializeNotifications();

  // Check for pending notifications
  checkPendingNotifications();

  // ----- COUNTRY DROPDOWN FUNCTIONALITY -----
  function initializeCountryDropdown() {
    // Populate country dropdown
    for (let country of countriesData) {
      const item = document.createElement("div");
      item.classList.add("country-item");
      item.dataset.dialCode = country.dialCode;
      item.dataset.code = country.code;
      item.innerHTML = `<span>${country.name}</span> <span class="text-gray-500">${country.dialCode}</span>`;

      item.addEventListener("click", function () {
        selectedCountry = country;
        countrySearch.value = country.name;
        selectedCountryCode.textContent = country.dialCode;
        countryDropdown.classList.add("hidden");
      });

      countryDropdown.appendChild(item);
    }
  }

  function filterCountries(searchText) {
    const countryItems = countryDropdown.querySelectorAll(".country-item");
    let hasVisibleItems = false;

    for (let item of countryItems) {
      const countryName = item.querySelector("span").textContent.toLowerCase();
      const countryCode = item.dataset.dialCode.toLowerCase();

      if (
        countryName.includes(searchText.toLowerCase()) ||
        countryCode.includes(searchText.toLowerCase())
      ) {
        item.style.display = "block";
        hasVisibleItems = true;
      } else {
        item.style.display = "none";
      }
    }

    return hasVisibleItems;
  }

  // ----- TIME CONVERSION FUNCTIONALITY -----
  function convertToIST(date, time) {
    // Create a date object with the input date and time
    const localDate = new Date(`${date}T${time}`);

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
    const utcMs =
      localDate.getTime() + localDate.getTimezoneOffset() * 60 * 1000;
    const istMs = utcMs + istOffset;
    const istDate = new Date(istMs);

    // Format the IST date and time
    const istDateString = istDate.toDateString();
    const istTimeString = istDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      formatted: `${istDateString} ${istTimeString} IST`,
      date: istDate,
    };
  }

  function updateISTTime() {
    if (dateInput.value && timeInput.value) {
      const convertedTime = convertToIST(dateInput.value, timeInput.value);
      istTime.value = convertedTime.formatted;
      istTime.classList.add("updated");

      // Remove highlight after animation
      setTimeout(() => {
        istTime.classList.remove("updated");
      }, 1000);
    }
  }

  // ----- NOTIFICATION FUNCTIONALITY -----
  function initializeNotifications() {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        notificationPermissionGranted = true;
        updateNotificationStatus();
      } else if (Notification.permission !== "denied") {
        notificationPermission.addEventListener(
          "click",
          requestNotificationPermission
        );
      }
    } else {
      notificationStatus.textContent = "Not supported in this browser";
      notificationPermission.disabled = true;
    }
  }

  function requestNotificationPermission() {
    Notification.requestPermission().then((permission) => {
      notificationPermissionGranted = permission === "granted";
      updateNotificationStatus();

      // Send a test notification if permission granted
      if (notificationPermissionGranted) {
        setTimeout(() => {
          new Notification("Notification Test", {
            body: "Notifications are now working!",
            icon: "https://cdn-icons-png.flaticon.com/512/2838/2838779.png",
          });
        }, 1000);
      }
    });
  }

  function updateNotificationStatus() {
    if (notificationPermissionGranted) {
      notificationStatus.textContent = "Enabled";
      notificationStatus.classList.add("text-green-600");
      notificationPermission.innerHTML =
        '<i class="fas fa-bell mr-2"></i> Test Notification';
      notificationPermission.classList.add("bg-green-600");
      notificationPermission.classList.remove(
        "bg-secondary",
        "hover:bg-primary"
      );

      // Change event listener to test notification
      notificationPermission.removeEventListener(
        "click",
        requestNotificationPermission
      );

      notificationPermission.addEventListener("click", function () {
        new Notification("Test Notification", {
          body: "This is a test notification. If you see this, notifications are working correctly!",
          icon: "https://cdn-icons-png.flaticon.com/512/2838/2838779.png",
        });
      });
    } else {
      notificationStatus.textContent = "Disabled";
      notificationStatus.classList.add("text-red-600");
    }
  }

  function sendNotification(reminder) {
    console.log("Sending notification for:", reminder);

    if (notificationPermissionGranted) {
      const notification = new Notification("Reminder", {
        body: reminder.notes,
        icon: "https://cdn-icons-png.flaticon.com/512/2838/2838779.png",
      });

      notification.onclick = function () {
        window.focus();
        const reminderElement = document.querySelector(
          `[data-id="${reminder.id}"]`
        );
        if (reminderElement) {
          reminderElement.scrollIntoView({ behavior: "smooth" });
          reminderElement.classList.add("bg-blue-50");
          setTimeout(() => {
            reminderElement.classList.remove("bg-blue-50");
          }, 3000);
        }
      };
    }
  }

  function checkPendingNotifications() {
    console.log("Checking for pending notifications...");

    // Check every 5 seconds for pending notifications
    setInterval(() => {
      const now = new Date();
      console.log("Current time:", now);

      reminders.forEach((reminder) => {
        // Correctly parse the reminder time from istTimeRaw
        const reminderTime = new Date(reminder.istTimeRaw);

        console.log("Checking reminder:", {
          id: reminder.id,
          notes: reminder.notes,
          scheduledTime: reminderTime,
          currentTime: now,
          timeDiff: now - reminderTime,
          notified: reminder.notified,
        });

        // If the reminder time has passed and hasn't been notified yet
        if (!reminder.notified && now >= reminderTime) {
          console.log("Notification triggered for:", reminder.notes);

          sendNotification(reminder);

          // Add visual indicator that notification was sent
          const reminderElement = document.querySelector(
            `[data-id="${reminder.id}"]`
          );
          if (reminderElement) {
            reminderElement.classList.add("bg-yellow-50");
            setTimeout(() => {
              reminderElement.classList.remove("bg-yellow-50");
            }, 5000);
          }

          // Mark as notified
          reminder.notified = true;
          saveToLocalStorage();
        }
      });
    }, 5000); // Check every 5 seconds
  }

  // Function to create immediate test reminder (for testing notifications)
  function createTestReminder() {
    const now = new Date();
    const testTime = new Date(now.getTime() + 10000); // 10 seconds from now

    const reminder = {
      id: "test-" + Date.now().toString(),
      date: today.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      localTime: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      istTime: "Test Notification (10 seconds)",
      istTimeRaw: testTime.toISOString(),
      phoneCode: "+1",
      phoneNumber: "Test",
      notes: "This is a test notification that should appear in 10 seconds",
      status: "in-progress",
      notified: false,
    };

    reminders.push(reminder);
    saveToLocalStorage();
    displayReminders();

    console.log("Test reminder created:", reminder);

    return reminder;
  }

  // ----- REMINDERS MANAGEMENT -----
  function createReminder() {
    if (!dateInput.value || !timeInput.value || !notesInput.value.trim()) {
      alert("Please fill all the required fields");
      return;
    }

    const localDate = `${dateInput.value}T${timeInput.value}`;
    const convertedTime = convertToIST(dateInput.value, timeInput.value);

    const reminder = {
      id: Date.now().toString(),
      date: dateInput.value,
      time: timeInput.value,
      localTime: new Date(localDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      istTime: convertedTime.formatted,
      istTimeRaw: convertedTime.date.toISOString(), // Store IST date for notification checking
      phoneCode: selectedCountry.dialCode,
      phoneNumber: phoneNumber.value,
      notes: notesInput.value.trim(),
      status: "needs-action",
      notified: false,
    };

    console.log("Created reminder:", reminder);

    reminders.push(reminder);
    saveToLocalStorage();
    displayReminders();

    // Clear form
    notesInput.value = "";
  }

  function updateReminderStatus(id, status) {
    const index = reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      reminders[index].status = status;
      saveToLocalStorage();
      displayReminders();
    }
  }

  function deleteReminder(id) {
    reminders = reminders.filter((r) => r.id !== id);
    saveToLocalStorage();
    displayReminders();
  }

  function displayReminders(filter = "all") {
    remindersList.innerHTML = "";

    let filteredReminders = reminders;

    // Apply filter
    if (filter !== "all") {
      filteredReminders = reminders.filter((r) => r.status === filter);
    }

    // Sort by date and time
    filteredReminders.sort(
      (a, b) => new Date(a.istTimeRaw) - new Date(b.istTimeRaw)
    );

    if (filteredReminders.length === 0) {
      remindersList.innerHTML = `
                <tr class="text-center text-gray-500">
                    <td colspan="5" class="px-6 py-4">No reminders found</td>
                </tr>
            `;
      return;
    }

    filteredReminders.forEach((reminder) => {
      const row = document.createElement("tr");
      row.dataset.id = reminder.id;
      row.classList.add("hover:bg-gray-50", "transition-colors");

      // Status class
      const statusClass = `status-${reminder.status}`;

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium">${
                      reminder.istTime.split(" ")[0]
                    } ${reminder.istTime.split(" ")[1]} ${
        reminder.istTime.split(" ")[2]
      }</div>
                    <div class="text-sm text-gray-500">${
                      reminder.istTime.split(" ")[3] || ""
                    } ${reminder.istTime.split(" ")[4] || ""}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${reminder.phoneCode} ${reminder.phoneNumber || "-"}
                </td>
                <td class="px-6 py-4">
                    <div class="max-w-xs break-words">${reminder.notes}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${statusClass}">
                        ${
                          reminder.status === "needs-action"
                            ? "Needs Action"
                            : reminder.status === "in-progress"
                            ? "In Progress"
                            : "Done"
                        }
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2 justify-end">
                        <button class="action-btn text-blue-600 hover:text-blue-900" data-action="needs-action" title="Mark as Needs Action">
                            <i class="fas fa-exclamation-circle"></i>
                        </button>
                        <button class="action-btn text-yellow-600 hover:text-yellow-900" data-action="in-progress" title="Mark as In Progress">
                            <i class="fas fa-spinner"></i>
                        </button>
                        <button class="action-btn text-green-600 hover:text-green-900" data-action="done" title="Mark as Done">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button class="action-btn text-red-600 hover:text-red-900" data-action="delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

      // Add event listeners to buttons
      row.querySelectorAll(".action-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const action = this.dataset.action;
          if (action === "delete") {
            if (confirm("Are you sure you want to delete this reminder?")) {
              deleteReminder(reminder.id);
            }
          } else {
            updateReminderStatus(reminder.id, action);
          }
        });
      });

      remindersList.appendChild(row);
    });
  }

  // ----- LOCAL STORAGE FUNCTIONALITY -----
  function saveToLocalStorage() {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }

  function loadFromLocalStorage() {
    const storedReminders = localStorage.getItem("reminders");
    return storedReminders ? JSON.parse(storedReminders) : null;
  }

  // ----- EVENT LISTENERS SETUP -----
  function setupEventListeners() {
    // Country search functionality
    countrySearch.addEventListener("focus", function () {
      countryDropdown.classList.remove("hidden");
      filterCountries(this.value);
    });

    countrySearch.addEventListener("input", function () {
      const hasResults = filterCountries(this.value);

      if (!hasResults) {
        countryDropdown.classList.add("hidden");
      } else {
        countryDropdown.classList.remove("hidden");
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !countrySearch.contains(e.target) &&
        !countryDropdown.contains(e.target)
      ) {
        countryDropdown.classList.add("hidden");
      }
    });

    // Date and time input change
    dateInput.addEventListener("change", updateISTTime);
    timeInput.addEventListener("change", updateISTTime);

    // Form submission
    reminderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      createReminder();
    });

    // Double click on notification button creates a test reminder
    notificationPermission.addEventListener("dblclick", function (e) {
      e.preventDefault();
      if (notificationPermissionGranted) {
        createTestReminder();
        alert(
          "Test reminder created for 10 seconds from now. Check the reminder list."
        );
      } else {
        alert("Please enable notifications first!");
      }
    });

    // Status filters
    statusFilters.forEach((filter) => {
      filter.addEventListener("click", function () {
        // Remove active class from all filters
        statusFilters.forEach((f) => f.classList.remove("active"));

        // Add active class to clicked filter
        this.classList.add("active");

        // Display reminders with filter
        const filterValue = this.dataset.filter;
        displayReminders(filterValue);
      });
    });
  }
});
