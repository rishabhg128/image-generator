import express from "express"
import cors from "cors"
import admin from "firebase-admin"
import fs from "fs"
import fetch from "node-fetch"


const dailyUsage = {};
const DAILY_LIMIT = 5
const app = express()
app.use(cors())
app.use(express.json())

// Load Firebase service account
const serviceAccount = JSON.parse(
    fs.readFileSync("./serviceAccountKey.json")
)

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

// Health check
app.get("/", (req, res) => {
    res.send("Backend is running")
})

// AI Image Generation Route
app.post("/generate-image", async (req, res) => {

    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: "Not Authenticated" })
    }

    const token = authHeader.split("Bearer ")[1]
    let decodedUser;
    try {
        decodedUser = await admin.auth().verifyIdToken(token)
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" })
    }
    
    const userId = decodedUser.uid
    const { prompt } = req.body

    //Daily limit check logic starts
    const today = new Date().toISOString().split("T")[0]
    const usageKey = `${userId}_${today}`
    
    if (!dailyUsage[usageKey]) {
        dailyUsage[usageKey] = 0
    }

    if (dailyUsage[usageKey] >= DAILY_LIMIT) {
        return res.status(429).json(
            { error: "Daily limit reached.Try again tomorrow" })
    }
    dailyUsage[usageKey] += 1

    //Check if prompt is exists
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" })
    }

    try {
        //Calling python AI service
        const response = await fetch("http://127.0.0.1:8000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
                body: JSON.stringify({ prompt })
        })
        const data = await response.json()
        //Sending back the response
        res.json({
            image : data.image,
            remaining: DAILY_LIMIT - dailyUsage[usageKey]
        })
    } 
    catch (error) {
        console.error("AI Service error:", error)
        res.status(500).json({ error: "AI Service failed" })
    }
})

app.listen(4000, () => {
    console.log("Backend running at http://localhost:4000")
})
