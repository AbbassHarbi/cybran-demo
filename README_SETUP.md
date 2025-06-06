# Synchronized Audio Demonstration - Setup Instructions

This package contains the files for the synchronized audio demonstration.

## Files Included:

*   `index.html`: The webpage for attendees to load on their devices.
*   `server.js`: The Node.js server application.
*   `admin.html`: The control panel webpage for the presenter.
*   `audio/sync_sound.wav`: The placeholder audio file.
*   `generate_audio.py`: (Optional) Python script to regenerate the WAV file if needed.
*   `node_modules/`: Contains the `ws` WebSocket library dependency. If you have Node.js and npm set up on the machine that will run the server, you can alternatively delete this folder and run `npm install ws` in the main directory.
*   `package.json` & `package-lock.json`: Generated by `npm install ws`.

## Prerequisites:

1.  **Node.js and npm:** You need Node.js installed on the computer that will run the `server.js` file. npm (Node Package Manager) comes with Node.js.
2.  **Network Access:** The computer running the server must be accessible on the same network as the attendees' devices. For a live event, this usually means being on the same Wi-Fi network. Ensure any firewalls allow connections on the port you choose (default is 8080).

## Setup and Running the Demonstration:

1.  **Extract Files:** Unzip the `cyber_demo_files.zip` archive to a folder on the computer that will act as the server.

2.  **Install Dependencies (if `node_modules` was not included or you prefer a fresh install):
    *   Open a terminal or command prompt.
    *   Navigate to the folder where you extracted the files (e.g., `cd path/to/cyber_demo_files`).
    *   Run the command: `npm install ws`
    *   (If you keep the provided `node_modules` folder, you can skip this step).

3.  **Start the Server:**
    *   In the terminal, while still in the `cyber_demo_files` directory, run the command: `node server.js`
    *   You should see output like:
        ```
        Server running at http://0.0.0.0:8080/
        Admin panel accessible at http://0.0.0.0:8080/admin
        Ensure 'ws' package is installed: npm install ws
        ```
    *   Note the IP address of your server machine. If the server machine's IP is, for example, `192.168.1.100`, then the attendee page will be `http://192.168.1.100:8080/` and the admin panel `http://192.168.1.100:8080/admin`.

4.  **Prepare QR Code/Short URL:**
    *   Generate a QR code that points to the attendee URL (e.g., `http://<YOUR_SERVER_IP>:8080/`).
    *   Optionally, create a short URL that also points to this address.

5.  **Access Admin Panel (Presenter):**
    *   On your presenter device (can be the server machine itself or another device on the same network), open a web browser and go to the admin panel URL (e.g., `http://<YOUR_SERVER_IP>:8080/admin`).
    *   You should see the admin panel with a connected attendee count and the "Trigger Synchronized Audio" button.

6.  **Attendee Participation:**
    *   Display the QR code or short URL to your attendees.
    *   Attendees scan the QR code or type the URL into their device's web browser.
    *   Their browser will load `index.html`. The status on their page should indicate they are connected.
    *   The admin panel will update with the count of connected attendees.

7.  **Trigger the Audio:**
    *   When ready, click the "Trigger Synchronized Audio" button on your admin panel.
    *   All connected attendee devices should play the `sync_sound.wav` simultaneously.

## Customizing the Audio:

*   To use a different sound, replace the `audio/sync_sound.wav` file with your own WAV audio file.
*   Ensure the filename and path in `index.html` (the `audioFile` variable) and `server.js` (the case for serving the audio file) are updated if you change the name or format.
*   The current setup uses WAV. If you use MP3, you'll need to change the `contentType` in `server.js` to `audio/mpeg` and the path in `index.html`.

## Important Considerations:

*   **Network:** A stable local network (Wi-Fi) is crucial for this demonstration. Public Wi-Fi with client isolation might prevent devices from reaching your server.
*   **Browser Autoplay Policies:** Some browsers are very strict about playing audio without user interaction on the page. The `index.html` includes code to try and initialize the AudioContext on the first click/touch on the page. Test this with your target devices. If audio doesn't play, attendees might need to tap their screen once after the page loads to enable audio playback.
*   **Consent:** As discussed, ensure your consent forms clearly cover this interaction.
*   **Testing:** Test the entire setup thoroughly before your event with various devices if possible.

Let me know if you have any questions during setup!
