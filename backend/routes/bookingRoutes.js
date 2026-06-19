const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// GET all bookings (admin overview)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().select("-screenshot");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new booking
router.post("/", async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, studentMobile, studentRollNumber, studentCollegeName, collegeName, eventId, eventName, clubId, screenshot, eventPrice, eventDate, eventVenue } = req.body;
    
    // Explicit validation to prevent undefined/broken booking entries
    if (!studentId || !studentName || !studentEmail || !studentMobile || !studentRollNumber || !studentCollegeName || !eventId || !eventName || !clubId || !screenshot) {
      return res.status(400).json({ error: "Missing required booking details (student info, college, event, club, or payment proof screenshot)." });
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
      studentCollegeName,
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
    const bookings = await Booking.find({ studentId: req.params.studentId }).select("-screenshot");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bookings for a specific club
router.get("/club/:clubId", async (req, res) => {
  try {
    const bookings = await Booking.find({ clubId: req.params.clubId }).select("-screenshot");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bookings for a specific event
router.get("/event/:eventId", async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.eventId }).select("-screenshot");
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

// GET screenshot for a specific booking
router.get("/:id/screenshot", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id, "screenshot");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ screenshot: booking.screenshot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /check-in (Check-in via QR code or direct ID)
router.post("/check-in", async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    // Try finding by custom bookingId first, then Mongo ObjectId
    let booking = await Booking.findOne({ bookingId });
    if (!booking && mongoose.isValidObjectId(bookingId)) {
      booking = await Booking.findById(bookingId);
    }

    if (!booking) {
      return res.status(404).json({ error: "Ticket booking not found." });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({ error: `Cannot check in. Ticket status is currently ${booking.status}. It must be Approved first.` });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ 
        error: "Ticket already checked in!", 
        alreadyCheckedIn: true,
        booking: {
          bookingId: booking.bookingId,
          studentName: booking.studentName,
          checkInTime: booking.checkInTime
        }
      });
    }

    booking.checkedIn = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.json({
      success: true,
      message: `Successfully checked in ${booking.studentName}!`,
      booking: {
        bookingId: booking.bookingId,
        studentName: booking.studentName,
        checkInTime: booking.checkInTime,
        eventName: booking.eventName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /:id/check-in (Manual check-in toggle from dashboard search)
router.patch("/:id/check-in", async (req, res) => {
  try {
    const { checkedIn } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Approved" && checkedIn) {
      return res.status(400).json({ error: "Cannot check in a ticket that is not Approved." });
    }

    booking.checkedIn = checkedIn;
    booking.checkInTime = checkedIn ? new Date() : undefined;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
