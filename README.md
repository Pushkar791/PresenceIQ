# PresenceIQ

PresenceIQ is an intelligent, automated attendance management system that uses facial recognition to mark student attendance quickly and accurately. Instead of traditional manual roll calls or ID scanning, the system allows teachers or administrators to capture a photo, instantly recognize the student, and securely log their attendance for the day.

## Key Features

- **Fast Face Recognition**: Instantly identifies students by analyzing a captured photo or webcam feed.
- **Robust Student Enrollment**: Register new students easily by uploading multiple photos. The system intelligently combines these photos to learn the student's face from different angles, ensuring high accuracy.
- **Automated Attendance Logging**: Once a face is recognized, the system automatically records the date, exact time, and "Present" status without manual data entry.
- **Duplicate Prevention**: Built-in checks prevent a student from being marked present multiple times on the same day.
- **Admin Dashboard**: A clean interface where teachers or admins can view attendance logs, see registered students, and manage the daily records.
- **Secure Access Control**: Requires user/admin login to access the dashboard and management features, keeping student data secure.

## Basic Technologies Used
- React.js for the User Interface
- Node.js & Express for the Backend Server
- MongoDB for the Database
- Python & OpenCV for the Face Recognition processing
