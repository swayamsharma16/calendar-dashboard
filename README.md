# Calendar Application

## Overview

This Calendar application allows users to manage their events by adding, editing, filtering, and viewing events on a monthly calendar. It also supports storing event data locally, ensuring persistence even after the page is refreshed.

## Features

- **Event Management**: Add, edit, and delete events with name, start/end time, and optional description.
- **Event List**: View all events for the selected day in a modal or side panel.

- **Data Persistence**: Store events in `localStorage` or in-memory for page refresh retention.

- **Color Coding**: Differentiate event types (work, personal, others) with distinct colors.

- **Month Transition**: Automatically handle transitions between months.

- **No Overlap**: Prevent scheduling overlapping events.

- **Event Filtering**: Filter events by keywords for easy searching.

## Dependencies

- React
- TailwindCSS (for styling)
- Dialog component for event detail editing

## Setup Instructions

1. **Clone the Repository**:

   ```bash
 git clone https://github.com/swayamsharma16/calendar-dashboard
 cd calendar-dashboard
   ```

2. **Install Dependencies**:

   Ensure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. **Run the Application**:

   After installation, you can start the application by running:

   ```bash
   npm start
   ```

