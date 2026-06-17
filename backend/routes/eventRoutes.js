const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Booking = require("../models/Booking");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET events by club
router.get("/club/:clubName", async (req, res) => {
  try {
    const events = await Event.find({ clubName: req.params.clubName });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new event
router.post("/", async (req, res) => {
  try {
    const { title, venue, date, price, seats, createdBy, clubName, collegeName, category } = req.body;
    
    const newEvent = new Event({
      title,
      venue,
      date,
      price,
      seats,
      seatsLeft: seats,
      createdBy,
      clubName,
      collegeName,
      category: category || "General"
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /predict-success
router.post("/predict-success", async (req, res) => {
  try {
    const { title, venue, price, seats, clubName, category } = req.body;

    const numPrice = Number(price) || 0;
    const numSeats = Number(seats) || 0;
    const eventCategory = category || "General";
    const eventTitle = title || "";

    let score = 85;
    const reasons = [];
    const suggestions = [];

    // Price factor
    if (numPrice === 0) {
      score += 5;
      reasons.push("Free events naturally attract high student interest.");
    } else {
      const pricePenalty = Math.min(35, (numPrice / 15));
      score -= pricePenalty;
      if (pricePenalty > 15) {
        reasons.push(`The ticket price (₹${numPrice}) is relatively high for a college event, which might limit general student turnout.`);
        suggestions.push(`Consider lowering the price to under ₹${Math.round(numPrice * 0.7)} or offering early-bird discounts.`);
      } else {
        reasons.push(`The price of ₹${numPrice} is reasonable and budget-friendly for university students.`);
      }
    }

    // Seats capacity factor
    if (numSeats <= 50 && numSeats > 0) {
      score += 8;
      reasons.push("Limited seat capacity creates high exclusivity and FOMO.");
    } else if (numSeats > 250) {
      score -= 12;
      reasons.push(`A large capacity of ${numSeats} seats requires substantial marketing to fill completely.`);
      suggestions.push(`Try to limit initial seat releases or plan a joint club collab to increase marketing reach.`);
    } else {
      reasons.push(`A capacity of ${numSeats} seats matches typical demand patterns for this event scale.`);
    }

    // Category factor
    if (["Tech", "Cultural"].includes(eventCategory)) {
      score += 6;
      reasons.push(`${eventCategory} events generally experience strong organic engagement on campus.`);
    } else if (["Sports", "Workshop"].includes(eventCategory)) {
      score += 3;
      reasons.push(`Workshops and sports activities draw targeted, active interest.`);
    } else {
      reasons.push("General category events have standard campus-wide appeal.");
    }

    // Keyword boost
    const lowercaseTitle = eventTitle.toLowerCase();
    const hotKeywords = ["fest", "hackathon", "concert", "show", "giveaway", "free", "night", "clash", "tournament"];
    const hasHotKeyword = hotKeywords.some(keyword => lowercaseTitle.includes(keyword));
    if (hasHotKeyword) {
      score += 7;
      reasons.push("The event title contains high-engagement keywords that drive student interest.");
    } else if (lowercaseTitle.includes("meeting") || lowercaseTitle.includes("agm")) {
      score -= 8;
      reasons.push("Title keywords imply formal/administrative content, which historically sees lower volunteer turnout.");
      suggestions.push("Try rephrasing the title to be more engaging (e.g. using 'Summit' or 'Kickoff' instead of 'Meeting').");
    }

    score = Math.max(15, Math.min(99, score));
    score = Math.round(score);

    let demandLevel = "Moderate";
    if (score >= 80) demandLevel = "High";
    else if (score < 50) demandLevel = "Low";

    if (suggestions.length === 0) {
      suggestions.push("Ensure eye-catching banners are shared on campus social groups at least 5 days prior.");
      suggestions.push("Collaborate with other clubs or departments to cross-promote the event.");
    }

    res.json({
      successRate: score,
      demandLevel,
      reasons,
      suggestions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /recommendations/:studentId
router.get("/recommendations/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const bookings = await Booking.find({ studentId });
    const upcomingEvents = await Event.find({ seatsLeft: { $gt: 0 } });

    if (upcomingEvents.length === 0) {
      return res.json([]);
    }

    if (bookings.length === 0) {
      const popularRecommendations = upcomingEvents
        .map(event => {
          const bookingRate = event.seats > 0 ? (event.seats - event.seatsLeft) / event.seats : 0;
          return {
            ...event.toObject(),
            recommendationReason: "Popular event on campus",
            recommendationScore: bookingRate * 10
          };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore);

      return res.json(popularRecommendations.slice(0, 4));
    }

    const categoryCount = {};
    const clubCount = {};

    bookings.forEach(b => {
      if (b.clubId) {
        clubCount[b.clubId] = (clubCount[b.clubId] || 0) + 1;
      }
    });

    const bookedEventIds = bookings.map(b => b.eventId);
    const bookedEvents = await Event.find({ _id: { $in: bookedEventIds } });
    
    bookedEvents.forEach(e => {
      if (e.category) {
        categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
      }
    });

    const scoredRecommendations = upcomingEvents
      .filter(event => !bookedEventIds.includes(event._id.toString()))
      .map(event => {
        let score = 0;
        let reasons = [];

        const categoryAffinity = categoryCount[event.category] || 0;
        if (categoryAffinity > 0) {
          score += categoryAffinity * 3;
          reasons.push(`You attended ${categoryAffinity} other ${event.category} events`);
        }

        const clubAffinity = clubCount[event.clubName] || 0;
        if (clubAffinity > 0) {
          score += clubAffinity * 2;
          reasons.push(`You follow events by ${event.clubName}`);
        }

        const bookingRate = event.seats > 0 ? (event.seats - event.seatsLeft) / event.seats : 0;
        score += bookingRate * 1.5;
        if (bookingRate > 0.5) {
          reasons.push("Highly popular amongst your peers");
        }

        let mainReason = "Recommended based on your interests";
        if (reasons.length > 0) {
          mainReason = reasons[0];
        } else {
          mainReason = `Trending in ${event.category || 'General'}`;
        }

        return {
          ...event.toObject(),
          recommendationScore: score,
          recommendationReason: mainReason
        };
      })
      .filter(item => item.recommendationScore > 0 || upcomingEvents.length <= 5)
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    if (scoredRecommendations.length === 0) {
      const fallbackList = upcomingEvents
        .filter(event => !bookedEventIds.includes(event._id.toString()))
        .map(event => ({
          ...event.toObject(),
          recommendationReason: "Recommended for you",
          recommendationScore: 0
        }));
      return res.json(fallbackList.slice(0, 4));
    }

    res.json(scoredRecommendations.slice(0, 4));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an event and its bookings
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Also delete all bookings for this event
    await Booking.deleteMany({ eventId: req.params.id });
    res.json({ message: "Event and associated bookings deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
