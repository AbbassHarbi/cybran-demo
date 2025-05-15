// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws"); // npm install ws
const { v4: uuidv4 } = require("uuid"); // npm install uuid

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created uploads directory at ${UPLOADS_DIR}`);
}

// --- HTTP Server Setup ---
const server = http.createServer((req, res) => {
    let filePath;
    let contentType = "text/html";

    console.log(`Request for: ${req.url}`);

    switch (req.url) {
        case "/":
            filePath = path.join(PUBLIC_DIR, "index.html");
            break;
        case "/admin":
            filePath = path.join(PUBLIC_DIR, "admin.html");
            break;
        case "/gallery": // New gallery page
            filePath = path.join(PUBLIC_DIR, "gallery.html");
            break;
        case "/photos": // API endpoint to list photos
            fs.readdir(UPLOADS_DIR, (err, files) => {
                if (err) {
                    console.error("Error reading uploads directory:", err);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to list photos" }));
                    return;
                }
                const imageFiles = files.filter(file => file.endsWith(".jpeg") || file.endsWith(".jpg") || file.endsWith(".png"));
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(imageFiles.map(file => `/uploads/${file}`))); // Send paths relative to web root
            });
            return; // Important: return here to avoid further processing
        case "/audio/user_voice.mp3":
            filePath = path.join(PUBLIC_DIR, "audio", "user_voice.mp3");
            contentType = "audio/mpeg";
            break;
        default:
            if (req.url.startsWith("/uploads/")) { // Serve uploaded images
                const requestedImagePath = path.join(PUBLIC_DIR, req.url);
                 if (fs.existsSync(requestedImagePath) && fs.lstatSync(requestedImagePath).isFile()) {
                    filePath = requestedImagePath;
                    if (req.url.endsWith(".jpeg") || req.url.endsWith(".jpg")) contentType = "image/jpeg";
                    if (req.url.endsWith(".png")) contentType = "image/png";
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("404 Image Not Found");
                    console.log(`404 Image Not Found: ${requestedImagePath}`);
                    return;
                }
            } else {
                const requestedPath = path.join(PUBLIC_DIR, req.url.substring(1));
                if (fs.existsSync(requestedPath) && fs.lstatSync(requestedPath).isFile()) {
                    filePath = requestedPath;
                    if (req.url.endsWith(".js")) contentType = "text/javascript";
                    if (req.url.endsWith(".css")) contentType = "text/css";
                } else {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("404 Not Found");
                    console.log(`404 Not Found: ${req.url}`);
                    return;
                }
            }
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("404 File Not Found");
                console.log(`404 File Not Found: ${filePath}`);
            } else {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(`Server Error: ${err.code}`);
                console.error(`Server Error reading file ${filePath}: ${err.code}`);
            }
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
            console.log(`Served: ${filePath}`);
        }
    });
});

// --- WebSocket Server Setup ---
const wss = new WebSocket.Server({ server });

const clients = new Set();
let adminSocket = null;

wss.on("connection", (ws, req) => {
    const clientUrl = req.url;
    console.log(`Client connected from URL: ${clientUrl}`);

    if (clientUrl === "/admin-ws") {
        if (adminSocket) {
            console.log("An admin panel is already connected. Closing new admin connection.");
            ws.send(JSON.stringify({ type: "error", message: "Admin already connected" }));
            ws.close();
            return;
        }
        adminSocket = ws;
        console.log("Admin panel connected");
        adminSocket.send(JSON.stringify({ type: "admin_status", connectedClients: clients.size }));

        adminSocket.on("message", (message) => {
            console.log("Message from admin:", message.toString());
            try {
                const parsedMessage = JSON.parse(message.toString());
                if (parsedMessage.action === "trigger_audio") {
                    console.log("Admin triggered audio. Broadcasting to attendees...");
                    clients.forEach(client => {
                        if (client !== adminSocket && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ action: "play_audio" }));
                        }
                    });
                    adminSocket.send(JSON.stringify({ type: "trigger_ack", message: "Audio trigger sent to attendees." }));
                } else if (parsedMessage.action === "stop_all_audio") {
                    console.log("Admin triggered stop all audio. Broadcasting to attendees...");
                    clients.forEach(client => {
                        if (client !== adminSocket && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ action: "stop_audio" }));
                        }
                    });
                    adminSocket.send(JSON.stringify({ type: "stop_ack", message: "Stop audio command sent to attendees." }));
                } else if (parsedMessage.action === "request_photo_consent") { // Handle photo request
                    console.log("Admin requested photo consent. Broadcasting to attendees...");
                    clients.forEach(client => {
                        if (client !== adminSocket && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ action: "request_photo_consent" }));
                        }
                    });
                    adminSocket.send(JSON.stringify({ type: "photo_request_ack", message: "Photo consent request sent to attendees." }));
                } else if (parsedMessage.action === "get_client_count") {
                    adminSocket.send(JSON.stringify({ type: "client_count", count: clients.size }));
                }
            } catch (e) {
                console.error("Failed to parse admin message or unknown action:", e);
                if(adminSocket && adminSocket.readyState === WebSocket.OPEN) {
                    adminSocket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
                }
            }
        });

        adminSocket.on("close", () => {
            console.log("Admin panel disconnected");
            adminSocket = null;
        });

        adminSocket.on("error", (error) => {
            console.error("Admin panel WebSocket error:", error);
            adminSocket = null;
        });

    } else { // Attendee client
        clients.add(ws);
        console.log(`Attendee connected. Total attendees: ${clients.size}`);
        if (adminSocket && adminSocket.readyState === WebSocket.OPEN) {
            adminSocket.send(JSON.stringify({ type: "client_update", connectedClients: clients.size }));
        }

        ws.on("message", (message) => {
            console.log("Message from attendee:", message.toString().substring(0, 100) + "..."); // Log only part of image data
            try {
                const parsedMessage = JSON.parse(message.toString());
                if (parsedMessage.type === "photo_submission" && parsedMessage.imageData) {
                    console.log("Received photo submission from an attendee.");
                    const base64Data = parsedMessage.imageData.replace(/^data:image\/jpeg;base64,/, "");
                    const imageName = `photo_${uuidv4()}.jpeg`;
                    const imagePath = path.join(UPLOADS_DIR, imageName);
                    
                    fs.writeFile(imagePath, base64Data, "base64", (err) => {
                        if (err) {
                            console.error("Error saving photo:", err);
                            ws.send(JSON.stringify({ type: "photo_error", message: "Failed to save photo on server." }));
                        } else {
                            console.log(`Photo saved: ${imagePath}`);
                            ws.send(JSON.stringify({ type: "photo_saved", message: "Photo received and saved!" }));
                            // Optionally notify admin or update gallery in real-time (more complex)
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to parse attendee message or unknown type:", e);
            }
        });

        ws.on("close", () => {
            clients.delete(ws);
            console.log(`Attendee disconnected. Total attendees: ${clients.size}`);
            if (adminSocket && adminSocket.readyState === WebSocket.OPEN) {
                adminSocket.send(JSON.stringify({ type: "client_update", connectedClients: clients.size }));
            }
        });

        ws.on("error", (error) => {
            console.error("Attendee WebSocket error:", error);
            clients.delete(ws);
            if (adminSocket && adminSocket.readyState === WebSocket.OPEN) {
                adminSocket.send(JSON.stringify({ type: "client_update", connectedClients: clients.size }));
            }
        });
    }
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
    console.log(`Admin panel accessible at http://0.0.0.0:${PORT}/admin`);
    console.log(`Photo gallery accessible at http://0.0.0.0:${PORT}/gallery`);
    console.log("Ensure 'ws' and 'uuid' packages are installed: npm install ws uuid");
});

