"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const categoryColors = {
    work: "bg-blue-100",
    personal: "bg-green-100",
    others: "bg-purple-100",
  };

  const handleEventClick = (event) => {
    setSelectedDate(new Date(event.start));
    setEventDetails({
      id: event.id,
      title: event.title,
      startTime: new Date(event.start)
        .toLocaleTimeString("en-US", { hour12: false })
        .slice(0, 5),
      endTime: new Date(event.end)
        .toLocaleTimeString("en-US", { hour12: false })
        .slice(0, 5),
      description: event.description,
      category: event.category,
    });
    setIsEdit(true);
    setIsDialogOpen(true);
  };

  const [eventDetails, setEventDetails] = useState({
    id: "",
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    category: "work",
  });

  const [filterKeyword, setFilterKeyword] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  // Calendar  Functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date, options = {}) => {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };


  const generateCalendarData = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const weeks = [];
    let days = [];

 
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }


    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );

      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
    }


    while (days.length > 0 && days.length < 7) {
      days.push(null);
      if (days.length === 7) {
        weeks.push(days);
      }
    }

    return weeks;
  };

  // Navigation Functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event Handling Functions
  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setEventDetails({
      id: "",
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      category: "work",
    });
    setIsEdit(false);
    setIsDialogOpen(true);
  };

  const handleAddOrUpdateEvent = (e) => {
    e.preventDefault();


    const timeError = validateTimeRange(
      eventDetails.startTime,
      eventDetails.endTime
    );
    if (timeError) {
      alert(timeError);
      return;
    }

    const eventDate = selectedDate;
    const startDateTime = new Date(eventDate);
    const endDateTime = new Date(eventDate);

    const [startHours, startMinutes] = eventDetails.startTime.split(":");
    const [endHours, endMinutes] = eventDetails.endTime.split(":");

    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    // Check for overlapping events
    const overlapping = currentEvents.some((event) => {
      if (event.id === eventDetails.id) return false; 

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        eventStart.toDateString() === startDateTime.toDateString() &&
        ((startDateTime >= eventStart && startDateTime < eventEnd) ||
          (endDateTime > eventStart && endDateTime <= eventEnd))
      );
    });

    if (overlapping) {
      alert("Event times overlap. Please choose a different time.");
      return;
    }

    const newEvent = {
      id: isEdit
        ? eventDetails.id
        : `${startDateTime.toISOString()}-${eventDetails.title}`,
      title: eventDetails.title,
      start: startDateTime,
      end: endDateTime,
      description: eventDetails.description,
      category: eventDetails.category,
    };

    setCurrentEvents((prev) =>
      isEdit
        ? prev.map((event) => (event.id === eventDetails.id ? newEvent : event))
        : [...prev, newEvent]
    );

    handleCloseDialog();
  };

  const validateTimeRange = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startMinutesSinceMidnight = startHours * 60 + startMinutes;
    const endMinutesSinceMidnight = endHours * 60 + endMinutes;

    if (endMinutesSinceMidnight <= startMinutesSinceMidnight) {
      return "End time must be after start time";
    }
    return "";
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return currentEvents.filter(
      (event) => new Date(event.start).toDateString() === date.toDateString()
    );
  };

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setCurrentEvents((prev) =>
        prev.filter((event) => event.id !== eventDetails.id)
      );
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEventDetails({
      id: "",
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "work",
    });
  };
  const filteredEvents = filterKeyword
    ? currentEvents.filter((event) =>
        event.title.toLowerCase().includes(filterKeyword.toLowerCase())
      )
    : currentEvents;


  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>

          <input
            type="text"
            placeholder="Filter events"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />

          <ul className="space-y-4">
            {filteredEvents.length <= 0 && <div>No Events Present</div>}

            {filteredEvents.length > 0 &&
              filteredEvents.map((event) => (
                <li
                  className="border-gray-200 shadow px-4 py-2 rounded-md text-blue-800 hover:bg-gray-50 cursor-pointer transition-colors"
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                >
                  <strong>{event.title}</strong>
                  <br />
                  <span className="text-slate-600">
                    {formatDate(new Date(event.start), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    <br />
                    {formatDate(new Date(event.start), {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {formatDate(new Date(event.end), {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {event.description && (
                    <p className="text-slate-600 mt-1">{event.description}</p>
                  )}
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12">
          <div className="bg-white rounded-lg shadow">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  Previous
                </button>

                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  Next
                </button>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-700 mt-4">
                {formatDate(currentDate, { month: "long", year: "numeric" })}
              </h2>
            </div>

            {/* Calendar Grid */}
            <div className="border-t">
              <div className="grid grid-cols-7 gap-px">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="px-4 py-2 text-center font-semibold bg-gray-50"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {generateCalendarData().map((week, weekIndex) =>
                  week.map((date, dayIndex) => {
                    const events = getEventsForDate(date);
                    const isToday =
                      date && date.toDateString() === new Date().toDateString();
                    const isWeekend =
                      date && (date.getDay() === 0 || date.getDay() === 6);

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        onClick={() => handleDateClick(date)}
                        className={`min-h-[120px] bg-white p-2 cursor-pointer
            ${isToday ? "bg-blue-100" : ""}
            ${isWeekend ? "bg-gray-50" : ""}
            hover:bg-gray-50`}
                      >
                        {date && (
                          <>
                            <div className={`text-right ${isToday ? " " : ""}`}>
                              {date.getDate()}
                            </div>
                            <div className="mt-1">
                              {events.map((event, index) => {
                                console.log("Event category:", event.category);
                                console.log(
                                  "Color being applied:",
                                  categoryColors[event.category]
                                );

                                return (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 mb-1 rounded truncate ${
                                      categoryColors[event.category] || ""
                                    }`}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white ">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleAddOrUpdateEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={eventDetails.title}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, title: e.target.value })
              }
              required
              className="w-full p-2 border border-gray-300 rounded"
            />

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm mb-1">Category</label>
              <select
                value={eventDetails.category}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, category: e.target.value })
                }
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Start Time</label>
                <input
                  type="time"
                  value={eventDetails.startTime}
                  onChange={(e) =>
                    setEventDetails({
                      ...eventDetails,
                      startTime: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">End Time</label>
                <input
                  type="time"
                  value={eventDetails.endTime}
                  onChange={(e) =>
                    setEventDetails({
                      ...eventDetails,
                      endTime: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) =>
                  setEventDetails({
                    ...eventDetails,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="bg-red-500 px-4 py-2 text-white rounded-md"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseDialog}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 px-4 py-2 text-white rounded-md"
              >
                {isEdit ? "Update Event" : "Add Event"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
