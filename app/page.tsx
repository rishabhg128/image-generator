"use client"

import { useState } from "react"
import { auth } from "../lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

const Spinner = () => (
  <div style={{
    width: "26",
    height: "26",
    border: "3px solid #ccc",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
    }}
  />
)

export default function Home() {

  //React state
  const [prompt, setPrompt] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  //Google Login
  const loginWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      alert("Login successful")
    } catch (error) {
      console.error(error)
      alert("Login failed")
    }
  }

  //Logout
  const logout = async (): Promise<void> => {
    await auth.signOut()
    setImage(null)
    setRemaining(null)
    setError(null)
    setPrompt("")
  }

  //Generate Image (REAL FEATURE)
  const generateImage = async (): Promise<void> => {
    const user = auth.currentUser
    if (!user) {
      alert("Please login first")
      return
    }

    if (!prompt) {
      alert("Please enter a prompt")
      return
    }

    setLoading(true)
    setImage(null)

    try {
      const token = await user.getIdToken()
      const res = await fetch("http://localhost:4000/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      })

      const data = await res.json()
      console.log("Backend response:", data)
      
      if(!res.ok) {
        setError(data.error || "Request failed")
        return
      }

      // Base64 → image
      setImage(`data:image/png;base64,${data.image}`)
      setRemaining(data.remaining)
      setError(null)
    } 
    catch (error) {
      console.error(error)
      alert("Image generation failed")
    } finally {
      setLoading(false)
    }
  }
  const downloadImage = () => {
    if (!image) return

    const link = document.createElement("a")
    link.href = image
    link.download = "ai-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  return (
    <main 
      style={{ 
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5"
        }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at left, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at right, rgba(236,72,153,0.18), transparent 50%)",
            zIndex: 0
          }}
        />


        <style>
        {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        `}
        </style>


          {auth.currentUser && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 15,
            color: "#444"
          }}
        >
          <span>
            Hi, {auth.currentUser.email
              ?.split("@")[0]
              .split(".")[0]
              .replace(/^\w/, c => c.toUpperCase())}
          </span>


          <button
            onClick={logout}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #e5533d",
              background: "#e5533d",
              color: "#fff",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            Logout
          </button>
          </div>
        )}


      {/* Card layout */}
      <div 
        style={{
          position: "relative",
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          width: "100%",
          maxWidth: 600,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          zIndex: 1 
        }}>
          <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: "bold",
            color: "#333"
          }}
        >
          AI Image Generator
        </h1>

      </div>


      {remaining !== null && (
       <p style={{color:"green"}}>
          Remaining images for today: {remaining}
        </p>
      )}

      {error && (
        <p style={{color:"red"}}>
          Error: {error}
        </p>
      )}

      {!auth.currentUser && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <button
            onClick={loginWithGoogle}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#1781d8ff",
              color: "#444",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Login with Google
          </button>
        </div>
      )}

      <br /><br />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        placeholder="Describe the image you want..."
        rows={3}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
          resize: "none"
        }}
      />
      

      <br /><br />

      <button
        onClick={generateImage}
        disabled={loading || remaining === 0}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          border: "none",
          background: loading || remaining === 0 ? "#ccc" : "#111",
          color: "#fff",
          fontSize: 16,
          cursor: loading || remaining === 0 ? "not-allowed" : "pointer"
        }}
      >
        {loading ? (
          <div style={{display: "flex",gap: 8,alignItems: "center",justifyContent: "center" }}>
            <Spinner />
            <span>Generating...</span>
          </div>
        ) : (
          "Generate Image"
        )}

      </button>

      <br /><br />

      {image && (
        <div style={{ marginTop: 20 }}>
          <img
            src={image}
            alt="Generated"
            style={{
              width: "100%",
              borderRadius: 12,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
            }}
          />
          <button
            onClick={downloadImage}
            style={{
              marginTop: 12,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Download Image
          </button>

        </div>
        )}
      </div>
    </main>
  )
}
