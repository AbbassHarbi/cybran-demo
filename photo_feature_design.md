## Consent-Based Photo Capture Feature Design

### 1. Overview

This document outlines the design for a consent-based photo capture feature integrated into the CYBRAN event demonstration. The core flow involves an admin initiating a photo request, attendees on the main CYBRAN page providing two-stage consent (custom dialog followed by browser permission), automatic photo capture upon consent, and display of these photos on a new, separate public gallery page.

### 2. Admin Panel (`admin.html` modifications)

*   **New Control:** A button labeled "Request Attendee Photos" will be added.
*   **Action:** Clicking this button will send a WebSocket message (e.g., `{"type": "request_photos"}`) to the `server.js`.
*   **Gallery Link:** A direct link to the `gallery.html` page will be added for the admin to easily view submitted photos.

### 3. Server (`server.js` modifications)

*   **Photo Request Handling:** Upon receiving the `request_photos` message from an admin client, the server will broadcast a new WebSocket message (e.g., `{"type": "photo_consent_request"}`) to all connected attendee clients.
*   **Photo Upload Endpoint:**
    *   A new HTTP POST endpoint (e.g., `/upload_photo`) will be created to receive photos from attendee clients.
    *   Photos will be expected as base64 encoded data URLs (e.g., from a canvas element).
    *   The server will decode the base64 string and save the image as a file (e.g., JPEG or PNG) into a designated directory: `/home/ubuntu/cyber_demo_files/gallery_photos/`.
    *   Filenames must be unique (e.g., using timestamps or UUIDs).
*   **Gallery Data Endpoint:**
    *   A new HTTP GET endpoint (e.g., `/get_photos`) will be created for the `gallery.html` page.
    *   This endpoint will return a JSON array of filenames of the photos available in the `/home/ubuntu/cyber_demo_files/gallery_photos/` directory.
*   **Static File Serving:**
    *   The server will be configured to serve the new `gallery.html` page.
    *   The server will be configured to statically serve the image files from the `/home/ubuntu/cyber_demo_files/gallery_photos/` directory (e.g., requests to `/gallery_photos/image_name.jpg` will serve the corresponding file).

### 4. Attendee Page (`index.html` - Main CYBRAN Page modifications)

*   **Listen for Request:** The client-side JavaScript will listen for the `photo_consent_request` WebSocket message from the server.
*   **Display Consent Dialog:** Upon receiving the message, a non-intrusive modal dialog will be displayed to the attendee.
    *   **Dialog Text (Example):** "CYBRAN Interactive Experience: Would you like to share a photo for the event gallery? If you agree, we will briefly activate your camera to capture one photo, which will be displayed publicly."
    *   **Buttons:** "Agree to Share Photo" and "No Thanks".
*   **User Actions:**
    *   If "No Thanks" is clicked: The dialog will close, and no further action is taken.
    *   If "Agree to Share Photo" is clicked:
        1.  **Request Camera Permission:** The script will call `navigator.mediaDevices.getUserMedia({ video: true })`.
        2.  **Browser Permission Prompt:** The browser will display its native permission prompt to the user (e.g., "[Site URL] wants to use your camera. Allow / Block").
        3.  **Handle Permission Result:**
            *   **Permission Denied:** If the user clicks "Block" or denies permission, a message like "Camera access was not granted. Photo cannot be taken." will be displayed briefly, and the process stops.
            *   **Permission Granted:** If the user clicks "Allow":
                *   A brief status message like "Capturing photo..." may be shown.
                *   A hidden `<video>` element will be used to stream from the camera.
                *   Once the stream is active, a single frame will be drawn to a hidden `<canvas>` element.
                *   The camera stream will be immediately stopped (all video tracks on the stream will be stopped using `track.stop()`).
                *   The content of the canvas will be converted to a data URL (e.g., `canvas.toDataURL('image/jpeg')`).
                *   This data URL will be sent to the server's `/upload_photo` endpoint via an HTTP POST request (e.g., using `fetch` API).
                *   **Upload Confirmation:** Upon successful upload, a message like "Photo captured and sent to gallery!" will be displayed. If the upload fails, "Could not send photo. Please try again later." will be shown.

### 5. New Public Gallery Page (`gallery.html` - to be created)

*   **Fetch Photos:** On page load, JavaScript will make an HTTP GET request to the server's `/get_photos` endpoint to retrieve the list of photo filenames.
*   **Display Photos:**
    *   For each filename received, an `<img>` element will be dynamically created.
    *   The `src` attribute of each `<img>` element will be set to the path of the photo on the server (e.g., `/gallery_photos/unique_image_name.jpg`).
    *   Photos will be displayed in a simple grid layout.
*   **Refresh Mechanism (Optional):** A button to manually refresh the gallery or an automatic polling mechanism (e.g., every 30 seconds) can be implemented to load newly added photos.

### 6. Security, Privacy, and User Experience Considerations

*   **Explicit Consent:** The two-stage consent process (custom dialog explaining intent + mandatory browser permission prompt) is critical and must be clearly implemented.
*   **Transparency:** Users must be explicitly informed that their photo will be taken, how it will be used (public gallery), and that camera access is required.
*   **Minimal Camera Use:** The camera should only be activated for the brief moment needed to capture the frame and then immediately deactivated.
*   **No User Preview (as per user direction):** The current design specifies automatic capture without user preview or retake options after consent.
*   **Error Handling:** Clear feedback should be provided to the user for all states (e.g., permission denied, upload failed, success).
*   **Data Management:** Consideration should be given to the lifecycle of the photos (e.g., how long they will be stored, especially if for a temporary event). For this project, they will be stored on the server filesystem.
