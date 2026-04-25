const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const QUESTIONS_PATH = path.join(__dirname, 'data', 'questions_dataset.json');
const RESPONSES_PATH = path.join(__dirname, 'data', 'responses_dataset.json');
const USERS_PATH = path.join(__dirname, 'data', 'users_dataset.json');
const FEEDBACK_PATH = path.join(__dirname, 'data', 'feedback_dataset.json');
const DOCTORS_PATH = path.join(__dirname, 'data', 'doctors_dataset.json');
const REMEDIES_PATH = path.join(__dirname, 'data', 'remedies_dataset.json');

// ──────────────────────────────────────────────
// Helper: safe read JSON
// ──────────────────────────────────────────────
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ══════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// POST /api/register — Register a new user
// ──────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const users = readJSON(USERS_PATH);

    // Check if email already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = {
      id: users.length + 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    writeJSON(USERS_PATH, users);

    // Return user info (without password)
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, message: 'Account created successfully', user: safeUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// ──────────────────────────────────────────────
// POST /api/login — Authenticate user
// ──────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const users = readJSON(USERS_PATH);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Return user info (without password)
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Failed to log in' });
  }
});

// ══════════════════════════════════════════════
//  QUESTIONS & QUIZ ROUTES
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// GET /api/questions — Return all questions
// ──────────────────────────────────────────────
app.get('/api/questions', (req, res) => {
  try {
    const data = fs.readFileSync(QUESTIONS_PATH, 'utf-8');
    const questions = JSON.parse(data);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error reading questions:', error);
    res.status(500).json({ success: false, message: 'Failed to load questions' });
  }
});

// ──────────────────────────────────────────────
// POST /api/submit-answers — Score and store
// ──────────────────────────────────────────────
app.post('/api/submit-answers', (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'No answers provided' });
    }

    // ── Scoring Algorithm ──
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };

    // Read questions to map answers
    const questionsData = fs.readFileSync(QUESTIONS_PATH, 'utf-8');
    const questions = JSON.parse(questionsData);

    answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question) {
        const selectedOption = question.options.find((opt) => opt.text === answer.selectedOption);
        if (selectedOption && scores.hasOwnProperty(selectedOption.type)) {
          scores[selectedOption.type]++;
        }
      }
    });

    // Determine the dominant dosha
    const maxScore = Math.max(scores.Vata, scores.Pitta, scores.Kapha);
    let dominantDosha = Object.keys(scores).filter((key) => scores[key] === maxScore);

    const result = {
      dominantDosha: dominantDosha.length === 1 ? dominantDosha[0] : dominantDosha.join('-'),
      scores,
      totalQuestions: answers.length,
    };

    // ── Save response to dataset ──
    let responses = [];
    try {
      const responsesData = fs.readFileSync(RESPONSES_PATH, 'utf-8');
      responses = JSON.parse(responsesData);
    } catch {
      responses = [];
    }

    const newResponse = {
      id: responses.length + 1,
      answers,
      result: result.dominantDosha,
      scores,
      created_at: new Date().toISOString(),
    };

    responses.push(newResponse);
    fs.writeFileSync(RESPONSES_PATH, JSON.stringify(responses, null, 2), 'utf-8');

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error processing answers:', error);
    res.status(500).json({ success: false, message: 'Failed to process answers' });
  }
});

// ──────────────────────────────────────────────
// GET /api/result/:id — Return a specific result
// ──────────────────────────────────────────────
app.get('/api/result/:id', (req, res) => {
  try {
    const responsesData = fs.readFileSync(RESPONSES_PATH, 'utf-8');
    const responses = JSON.parse(responsesData);
    const response = responses.find((r) => r.id === parseInt(req.params.id));

    if (!response) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.json({ success: true, result: response });
  } catch (error) {
    console.error('Error reading result:', error);
    res.status(500).json({ success: false, message: 'Failed to load result' });
  }
});

// ──────────────────────────────────────────────
// GET /api/result — Return the latest result
// ──────────────────────────────────────────────
app.get('/api/result', (req, res) => {
  try {
    const responsesData = fs.readFileSync(RESPONSES_PATH, 'utf-8');
    const responses = JSON.parse(responsesData);

    if (responses.length === 0) {
      return res.status(404).json({ success: false, message: 'No results found' });
    }

    const latestResult = responses[responses.length - 1];
    res.json({ success: true, result: latestResult });
  } catch (error) {
    console.error('Error reading result:', error);
    res.status(500).json({ success: false, message: 'Failed to load result' });
  }
});

// ══════════════════════════════════════════════
//  DOCTORS ROUTES
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// GET /api/doctors — Return all or filtered doctors
// ──────────────────────────────────────────────
app.get('/api/doctors', (req, res) => {
  try {
    const doctors = readJSON(DOCTORS_PATH);
    const { dosha } = req.query;

    if (dosha) {
      const filtered = doctors.filter((doc) =>
        doc.specialization.some((s) => s.toLowerCase() === dosha.toLowerCase())
      );
      return res.json({ success: true, doctors: filtered });
    }

    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Error reading doctors:', error);
    res.status(500).json({ success: false, message: 'Failed to load doctors' });
  }
});

// ══════════════════════════════════════════════
//  FEEDBACK ROUTES
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// POST /api/feedback — Submit feedback
// ──────────────────────────────────────────────
app.post('/api/feedback', (req, res) => {
  try {
    const { userName, email, rating, message } = req.body;

    if (!userName || !email || !rating || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const feedbacks = readJSON(FEEDBACK_PATH);

    const newFeedback = {
      id: feedbacks.length + 1,
      userName: userName.trim(),
      email: email.trim().toLowerCase(),
      rating: parseInt(rating),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    feedbacks.push(newFeedback);
    writeJSON(FEEDBACK_PATH, feedbacks);

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// ──────────────────────────────────────────────
// GET /api/feedback — Return all feedback
// ──────────────────────────────────────────────
app.get('/api/feedback', (req, res) => {
  try {
    const feedbacks = readJSON(FEEDBACK_PATH);
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('Error reading feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to load feedback' });
  }
});

// ══════════════════════════════════════════════
//  REMEDIES ROUTES
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// GET /api/remedies/:dosha — Return remedies for a specific dosha
// ──────────────────────────────────────────────
app.get('/api/remedies/:dosha', (req, res) => {
  try {
    const remedies = readJSON(REMEDIES_PATH);
    const dosha = req.params.dosha.charAt(0).toUpperCase() + req.params.dosha.slice(1).toLowerCase();

    if (!remedies[dosha]) {
      return res.status(404).json({ success: false, message: `No remedies found for dosha: ${dosha}` });
    }

    res.json({ success: true, dosha, data: remedies[dosha] });
  } catch (error) {
    console.error('Error reading remedies:', error);
    res.status(500).json({ success: false, message: 'Failed to load remedies' });
  }
});

// ──────────────────────────────────────────────
// GET /api/remedies — Return all remedies
// ──────────────────────────────────────────────
app.get('/api/remedies', (req, res) => {
  try {
    const remedies = readJSON(REMEDIES_PATH);
    res.json({ success: true, remedies });
  } catch (error) {
    console.error('Error reading remedies:', error);
    res.status(500).json({ success: false, message: 'Failed to load remedies' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Ayurvedic Diagnostic Backend running on http://localhost:${PORT}`);
});
