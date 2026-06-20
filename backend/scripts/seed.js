const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/user");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campushub";

async function seed() {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    // Clear existing collections
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    console.log("Database cleared.");

    // Create password hash
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Seed Club Users
    const clubUsersData = [
      {
        name: "COEP MindSpark Club",
        email: "mindspark@coep.ac.in",
        password: hashedPassword,
        role: "club",
        clubName: "COEP MindSpark Club",
        collegeName: "COEP Technological University"
      },
      {
        name: "PICT IEEE Student Branch",
        email: "ieee@pict.edu",
        password: hashedPassword,
        role: "club",
        clubName: "PICT IEEE Student Branch",
        collegeName: "Pune Institute of Computer Technology"
      },
      {
        name: "VIT Music Club",
        email: "music@vit.edu",
        password: hashedPassword,
        role: "club",
        clubName: "VIT Music Club",
        collegeName: "Vishwakarma Institute of Technology"
      },
      {
        name: "MIT Robotics Club",
        email: "robotics@mitwpu.edu.in",
        password: hashedPassword,
        role: "club",
        clubName: "MIT Robotics Club",
        collegeName: "MIT World Peace University"
      },
      {
        name: "Symbi Drama Club",
        email: "dramatics@siu.edu.in",
        password: hashedPassword,
        role: "club",
        clubName: "Symbi Drama Club",
        collegeName: "Symbiosis International University"
      }
    ];

    console.log("Seeding club users...");
    const clubUsers = await User.insertMany(clubUsersData);
    console.log(`Seeded ${clubUsers.length} club users.`);

    // Seed Student Users
    const studentUsersData = [
      {
        name: "Amit Sharma",
        email: "amit@coep.ac.in",
        password: hashedPassword,
        role: "student",
        collegeName: "COEP Technological University",
        rollNumber: "112003001",
        mobileNumber: "+91 9876543210"
      },
      {
        name: "Priya Patil",
        email: "priya@pict.edu",
        password: hashedPassword,
        role: "student",
        collegeName: "Pune Institute of Computer Technology",
        rollNumber: "23040",
        mobileNumber: "+91 8765432109"
      },
      {
        name: "Rahul Deshmukh",
        email: "rahul@vit.edu",
        password: hashedPassword,
        role: "student",
        collegeName: "Vishwakarma Institute of Technology",
        rollNumber: "2110293",
        mobileNumber: "+91 7654321098"
      },
      {
        name: "Sneha Joshi",
        email: "sneha@mitwpu.edu.in",
        password: hashedPassword,
        role: "student",
        collegeName: "MIT World Peace University",
        rollNumber: "1032210405",
        mobileNumber: "+91 9543210987"
      },
      {
        name: "Aditya Kulkarni",
        email: "aditya@siu.edu.in",
        password: hashedPassword,
        role: "student",
        collegeName: "Symbiosis International University",
        rollNumber: "2024-1002",
        mobileNumber: "+91 9123456789"
      }
    ];

    console.log("Seeding student users...");
    const studentUsers = await User.insertMany(studentUsersData);
    console.log(`Seeded ${studentUsers.length} student users.`);

    // Helper map of club names to club user documents
    const clubMap = {};
    clubUsers.forEach(c => {
      clubMap[c.clubName] = c;
    });

    // Seed Events
    const eventsData = [
      {
        title: "MindSpark '26: Annual National Level Tech Fest",
        venue: "COEP Main Campus Auditorium",
        date: "2026-09-12",
        startTime: "09:00 AM",
        price: 150,
        seats: 500,
        seatsLeft: 497,
        createdBy: clubMap["COEP MindSpark Club"]._id.toString(),
        clubName: "COEP MindSpark Club",
        collegeName: "COEP Technological University",
        category: "Tech",
        description: "MindSpark is the national level flagship technical festival of COEP. Experience high-octane robotics wars, coding hackathons, mock placements, keynotes from industry legends, and paper presentations. Join the legacy of innovation!",
        bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
        paymentType: "default"
      },
      {
        title: "Hack-a-Thon 5.0",
        venue: "PICT Seminar Hall 2",
        date: "2026-07-24",
        startTime: "08:00 AM",
        price: 100,
        seats: 150,
        seatsLeft: 147,
        createdBy: clubMap["PICT IEEE Student Branch"]._id.toString(),
        clubName: "PICT IEEE Student Branch",
        collegeName: "Pune Institute of Computer Technology",
        category: "Tech",
        description: "Crack your knuckles, sip some coffee, and build groundbreaking solutions in 24 hours. Hack-a-Thon 5.0 focuses on Web3, generative AI, and sustainable tech. Winners get cash prizes up to ₹50,000 and internship opportunities!",
        bannerImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
        paymentType: "default"
      },
      {
        title: "Aarohan '26: Symphony of Melodies",
        venue: "VIT Central Lawn",
        date: "2026-08-05",
        startTime: "06:00 PM",
        price: 50,
        seats: 300,
        seatsLeft: 298,
        createdBy: clubMap["VIT Music Club"]._id.toString(),
        clubName: "VIT Music Club",
        collegeName: "Vishwakarma Institute of Technology",
        category: "Cultural",
        description: "An evening filled with soulful fusion, rock, classical, and acoustic cover tracks. Catch our talented college bands and student ensembles performing live under the stars. Free mocktails included with every entry ticket!",
        bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
        paymentType: "default"
      },
      {
        title: "RoboCon Workshop: Intro to ROS 2",
        venue: "MIT Robotics Research Lab",
        date: "2026-10-18",
        startTime: "10:30 AM",
        price: 200,
        seats: 60,
        seatsLeft: 59,
        createdBy: clubMap["MIT Robotics Club"]._id.toString(),
        clubName: "MIT Robotics Club",
        collegeName: "MIT World Peace University",
        category: "Workshop",
        description: "Unlock the power of Robot Operating System (ROS 2). In this hands-on workshop, you'll learn to simulate mobile robots, interface sensors, write nodes in C++/Python, and run navigation packages. Ideal for beginners and intermediate enthusiasts.",
        bannerImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
        paymentType: "default"
      },
      {
        title: "Natyaranga: The Annual Inter-College Play",
        venue: "SIU Viman Nagar Auditorium",
        date: "2026-11-02",
        startTime: "04:30 PM",
        price: 80,
        seats: 250,
        seatsLeft: 248,
        createdBy: clubMap["Symbi Drama Club"]._id.toString(),
        clubName: "Symbi Drama Club",
        collegeName: "Symbiosis International University",
        category: "Arts",
        description: "A gripping theatrical performance exploring the dualities of modern life. Experience dramatic monologues, interactive street play sequences, and grand stage lighting. Winner of best direction in the state drama competition.",
        bannerImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80",
        paymentType: "default"
      }
    ];

    console.log("Seeding events...");
    const events = await Event.insertMany(eventsData);
    console.log(`Seeded ${events.length} events.`);

    // Helper maps of created event titles to documents
    const eventMap = {};
    events.forEach(e => {
      eventMap[e.title] = e;
    });

    // Helper maps of student names to documents
    const studentMap = {};
    studentUsers.forEach(s => {
      studentMap[s.name] = s;
    });

    // Seed Bookings
    const demoScreenshot = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%2310b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12">Demo Payment</text></svg>';

    const bookingsData = [
      // MindSpark '26 Bookings
      {
        bookingId: "MI1001",
        studentId: studentMap["Amit Sharma"]._id.toString(),
        studentName: "Amit Sharma",
        studentEmail: "amit@coep.ac.in",
        studentMobile: "+91 9876543210",
        studentRollNumber: "112003001",
        studentCollegeName: "COEP Technological University",
        collegeName: "COEP Technological University",
        eventId: eventMap["MindSpark '26: Annual National Level Tech Fest"]._id.toString(),
        eventName: "MindSpark '26: Annual National Level Tech Fest",
        clubId: "COEP MindSpark Club",
        screenshot: demoScreenshot,
        eventPrice: 150,
        eventDate: "2026-09-12",
        eventVenue: "COEP Main Campus Auditorium",
        status: "Approved",
        checkedIn: true,
        checkInTime: new Date("2026-06-19T10:15:00Z")
      },
      {
        bookingId: "MI1002",
        studentId: studentMap["Priya Patil"]._id.toString(),
        studentName: "Priya Patil",
        studentEmail: "priya@pict.edu",
        studentMobile: "+91 8765432109",
        studentRollNumber: "23040",
        studentCollegeName: "Pune Institute of Computer Technology",
        collegeName: "COEP Technological University",
        eventId: eventMap["MindSpark '26: Annual National Level Tech Fest"]._id.toString(),
        eventName: "MindSpark '26: Annual National Level Tech Fest",
        clubId: "COEP MindSpark Club",
        screenshot: demoScreenshot,
        eventPrice: 150,
        eventDate: "2026-09-12",
        eventVenue: "COEP Main Campus Auditorium",
        status: "Approved",
        checkedIn: false
      },
      {
        bookingId: "MI1003",
        studentId: studentMap["Rahul Deshmukh"]._id.toString(),
        studentName: "Rahul Deshmukh",
        studentEmail: "rahul@vit.edu",
        studentMobile: "+91 7654321098",
        studentRollNumber: "2110293",
        studentCollegeName: "Vishwakarma Institute of Technology",
        collegeName: "COEP Technological University",
        eventId: eventMap["MindSpark '26: Annual National Level Tech Fest"]._id.toString(),
        eventName: "MindSpark '26: Annual National Level Tech Fest",
        clubId: "COEP MindSpark Club",
        screenshot: demoScreenshot,
        eventPrice: 150,
        eventDate: "2026-09-12",
        eventVenue: "COEP Main Campus Auditorium",
        status: "Pending",
        checkedIn: false
      },
      // Hack-a-Thon 5.0 Bookings
      {
        bookingId: "HA1004",
        studentId: studentMap["Priya Patil"]._id.toString(),
        studentName: "Priya Patil",
        studentEmail: "priya@pict.edu",
        studentMobile: "+91 8765432109",
        studentRollNumber: "23040",
        studentCollegeName: "Pune Institute of Computer Technology",
        collegeName: "Pune Institute of Computer Technology",
        eventId: eventMap["Hack-a-Thon 5.0"]._id.toString(),
        eventName: "Hack-a-Thon 5.0",
        clubId: "PICT IEEE Student Branch",
        screenshot: demoScreenshot,
        eventPrice: 100,
        eventDate: "2026-07-24",
        eventVenue: "PICT Seminar Hall 2",
        status: "Approved",
        checkedIn: true,
        checkInTime: new Date("2026-06-19T11:00:00Z")
      },
      {
        bookingId: "HA1005",
        studentId: studentMap["Sneha Joshi"]._id.toString(),
        studentName: "Sneha Joshi",
        studentEmail: "sneha@mitwpu.edu.in",
        studentMobile: "+91 9543210987",
        studentRollNumber: "1032210405",
        studentCollegeName: "MIT World Peace University",
        collegeName: "Pune Institute of Computer Technology",
        eventId: eventMap["Hack-a-Thon 5.0"]._id.toString(),
        eventName: "Hack-a-Thon 5.0",
        clubId: "PICT IEEE Student Branch",
        screenshot: demoScreenshot,
        eventPrice: 100,
        eventDate: "2026-07-24",
        eventVenue: "PICT Seminar Hall 2",
        status: "Approved",
        checkedIn: false
      },
      {
        bookingId: "HA1006",
        studentId: studentMap["Aditya Kulkarni"]._id.toString(),
        studentName: "Aditya Kulkarni",
        studentEmail: "aditya@siu.edu.in",
        studentMobile: "+91 9123456789",
        studentRollNumber: "2024-1002",
        studentCollegeName: "Symbiosis International University",
        collegeName: "Pune Institute of Computer Technology",
        eventId: eventMap["Hack-a-Thon 5.0"]._id.toString(),
        eventName: "Hack-a-Thon 5.0",
        clubId: "PICT IEEE Student Branch",
        screenshot: demoScreenshot,
        eventPrice: 100,
        eventDate: "2026-07-24",
        eventVenue: "PICT Seminar Hall 2",
        status: "Pending",
        checkedIn: false
      },
      // Aarohan '26 Bookings
      {
        bookingId: "AA1007",
        studentId: studentMap["Rahul Deshmukh"]._id.toString(),
        studentName: "Rahul Deshmukh",
        studentEmail: "rahul@vit.edu",
        studentMobile: "+91 7654321098",
        studentRollNumber: "2110293",
        studentCollegeName: "Vishwakarma Institute of Technology",
        collegeName: "Vishwakarma Institute of Technology",
        eventId: eventMap["Aarohan '26: Symphony of Melodies"]._id.toString(),
        eventName: "Aarohan '26: Symphony of Melodies",
        clubId: "VIT Music Club",
        screenshot: demoScreenshot,
        eventPrice: 50,
        eventDate: "2026-08-05",
        eventVenue: "VIT Central Lawn",
        status: "Approved",
        checkedIn: true,
        checkInTime: new Date("2026-06-19T18:15:00Z")
      },
      // RoboCon Bookings
      {
        bookingId: "RO1008",
        studentId: studentMap["Sneha Joshi"]._id.toString(),
        studentName: "Sneha Joshi",
        studentEmail: "sneha@mitwpu.edu.in",
        studentMobile: "+91 9543210987",
        studentRollNumber: "1032210405",
        studentCollegeName: "MIT World Peace University",
        collegeName: "MIT World Peace University",
        eventId: eventMap["RoboCon Workshop: Intro to ROS 2"]._id.toString(),
        eventName: "RoboCon Workshop: Intro to ROS 2",
        clubId: "MIT Robotics Club",
        screenshot: demoScreenshot,
        eventPrice: 200,
        eventDate: "2026-10-18",
        eventVenue: "MIT Robotics Research Lab",
        status: "Approved",
        checkedIn: false
      },
      // Natyaranga Bookings
      {
        bookingId: "NA1009",
        studentId: studentMap["Aditya Kulkarni"]._id.toString(),
        studentName: "Aditya Kulkarni",
        studentEmail: "aditya@siu.edu.in",
        studentMobile: "+91 9123456789",
        studentRollNumber: "2024-1002",
        studentCollegeName: "Symbiosis International University",
        collegeName: "Symbiosis International University",
        eventId: eventMap["Natyaranga: The Annual Inter-College Play"]._id.toString(),
        eventName: "Natyaranga: The Annual Inter-College Play",
        clubId: "Symbi Drama Club",
        screenshot: demoScreenshot,
        eventPrice: 80,
        eventDate: "2026-11-02",
        eventVenue: "SIU Viman Nagar Auditorium",
        status: "Approved",
        checkedIn: true,
        checkInTime: new Date("2026-06-19T17:00:00Z")
      }
    ];

    console.log("Seeding bookings...");
    const bookings = await Booking.insertMany(bookingsData);
    console.log(`Seeded ${bookings.length} bookings.`);

    console.log("\nDatabase Seeding Completed Successfully! 🎉");
    console.log("\nCredentials to test:");
    console.log("Password for all users: password123");
    console.log("Clubs:");
    clubUsers.forEach(c => console.log(`  - ${c.name} (${c.collegeName}): ${c.email}`));
    console.log("Students:");
    studentUsers.forEach(s => console.log(`  - ${s.name} (${s.collegeName}): ${s.email}`));

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
