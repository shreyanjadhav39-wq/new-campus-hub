const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// POST a new booking
router.post("/", async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, studentMobile, studentRollNumber, collegeName, eventId, eventName, clubId, screenshot, eventPrice, eventDate, eventVenue } = req.body;
    
    // Explicit validation to prevent undefined/broken booking entries
    if (!studentId || !studentName || !studentEmail || !studentMobile || !studentRollNumber || !eventId || !eventName || !clubId || !screenshot) {
      return res.status(400).json({ error: "Missing required booking details (student info, event, club, or payment proof screenshot)." });
    }

    // Generate custom booking ID: 2 uppercase alphabetic/numeric chars of event name + sequential numbers
    let prefix = "EV";
    if (eventName) {
      const cleanName = eventName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (cleanName.length >= 2) {
        prefix = cleanName.substring(0, 2);
      } else if (cleanName.length === 1) {
        prefix = cleanName + "X";
      }
    }

    const lastBooking = await Booking.findOne().sort({ _id: -1 });
    let sequenceNum = 1001;
    if (lastBooking && lastBooking.bookingId) {
      const match = lastBooking.bookingId.match(/\d+$/);
      if (match) {
        sequenceNum = parseInt(match[0], 10) + 1;
      }
    }
    const bookingId = `${prefix}${sequenceNum}`;

    // Create the booking
    const newBooking = new Booking({
      bookingId,
      studentId,
      studentName,
      studentEmail,
      studentMobile,
      studentRollNumber,
      collegeName,
      eventId,
      eventName,
      clubId,
      screenshot,
      eventPrice,
      eventDate,
      eventVenue,
      status: "Pending"
    });

    const savedBooking = await newBooking.save();

    // Decrement available seats in the event
    await Event.findByIdAndUpdate(eventId, { $inc: { seatsLeft: -1 } });

    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bookings for a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.params.studentId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bookings for a specific club
router.get("/club/:clubId", async (req, res) => {
  try {
    const bookings = await Booking.find({ clubId: req.params.clubId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Seat adjustment based on status transition
    if (status === "Rejected" && oldStatus !== "Rejected") {
      await Event.findByIdAndUpdate(booking.eventId, { $inc: { seatsLeft: 1 } });
    } else if (status === "Approved" && oldStatus === "Rejected") {
      await Event.findByIdAndUpdate(booking.eventId, { $inc: { seatsLeft: -1 } });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If booking was approved/pending, and we delete it, should we increment seatsLeft back?
    // In real-time production, yes, let's restore seats if status was not Rejected
    if (booking.status !== "Rejected") {
      await Event.findByIdAndUpdate(booking.eventId, { $inc: { seatsLeft: 1 } });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted/cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
