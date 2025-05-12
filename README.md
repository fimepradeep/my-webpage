# Professional Reminder & Scheduler

## Description

A professional-themed web application that functions as a reminder and scheduler tool. Built with HTML, JavaScript, and Tailwind CSS, this application helps users schedule reminders with automatic time zone conversion to Indian Standard Time (IST).

## Features

### Country and Phone Code Selection

- Searchable and filterable dropdown list containing all country names and their respective phone codes
- Automatic update of country code label when a country is selected

### Phone Number Input

- Text box for entering a phone number next to the country code label

### Date and Time Management

- Input fields for selecting date and time
- Automatic conversion to IST (Indian Standard Time)
- Display of converted time in a non-editable field

### Reminder Notes

- Text area for entering reminder notes

### Browser Notifications

- Alert via browser notifications at the scheduled IST time
- Notification includes the entered reminder notes

### Scheduler History and Status

- List of scheduled reminders with their details
- Status tracking: "Done", "In Progress", or "Needs Action"
- Ability to change the status of each reminder
- Option to delete reminders

### Additional Features

- Persistent storage using localStorage
- Responsive design for all device types
- Clean, professional UI using Tailwind CSS
- Color indicators for different statuses
- Ability to filter reminders by status

## Technologies Used

- HTML5
- JavaScript (ES6+)
- Tailwind CSS
- Browser Notifications API
- LocalStorage API

## Usage

1. Open the `index.html` file in a modern web browser
2. Enable browser notifications when prompted
3. Fill in the form with your reminder details:
   - Select a country (which sets the phone code)
   - Enter a phone number (optional)
   - Set the date and time
   - Add notes for your reminder
4. Click "Create Reminder" to schedule it
5. View and manage your reminders in the Reminder History section
6. Receive browser notifications at the scheduled time

## Browser Compatibility

This application works best in modern browsers that support the Notifications API:

- Chrome
- Firefox
- Edge
- Safari (macOS)
- Opera

## License

This project is open source and available under the MIT License.

## Author

Created on May 12, 2025
