import express from "express"
import cors from "cors"
import admin from "firebase-admin"
import fs from "fs"

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

// Protected test route
app.post("/test-auth", async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.split("Bearer ")[1]

    try {
        const decoded = await admin.auth().verifyIdToken(token)
        res.json({ message: `Hello ${decoded.email}` })
    } catch (err) {
        res.status(401).json({ error: "Invalid token" })
    }
})

app.listen(4000, () => {
    console.log("Backend running at http://localhost:4000")
})
