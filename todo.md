# Cybersecurity Event Preparation Checklist

- [x] Clarify event requirements (Audience: stakeholders/field experts, Duration: flexible, Consent: attendees will sign acceptance form, University Guidelines: User to double-check with university, but proceeding with research based on consent)
- [x] Research cybersecurity techniques and hacking methods for synchronized audio demonstration
    - [x] Research file delivery mechanisms
    - [x] Research payload execution methods (benign, for audio playback)
    - [x] Research synchronization techniques
    - [x] Research ethical considerations and safety measures for live demos with consent
    - [x] Research cross-platform scripting for audio playback
- [x] Select engaging and demonstrable examples suitable for the audience and consent framework
    - Selected Concept: Synchronized audio playback via a web page (HTML/JavaScript using Web Audio API and WebSockets for server-triggered synchronization). File delivery via QR code/short URL. Benign audio payload. Focus on transparency and consent.
- [x] Design the show part outline, including the synchronized audio demonstration
- [x] Validate content for relevance, safety, and ethical compliance, especially concerning the university guidelines and consent
    - Validation complete: The proposed demonstration (synchronized audio via web page) and the detailed show outline are designed to be relevant for experts, safe (browser-sandboxed, benign payload, consent-based), and ethically sound. The outline emphasizes transparency and educational value. The user has been consistently advised to ensure full alignment with university policies.
- [x] Revise show part outline for surprise effect (created show_outline_revised.md)
- [x] Validate revised content for relevance, safety, and ethical compliance, especially for surprise effect and consent (show_outline_revised.md)
    - Validation complete: The revised outline maintains safety, ethical considerations (with strong emphasis on clear consent for a surprise event), and relevance for the expert audience. The surprise element is incorporated while ensuring the post-event debrief is thorough.
- [x] Report and send the revised outline and any relevant materials to the user



## Consent-Based Photo Capture Feature

- [x] Design consent flow and technical specifications for photo capture (photo_feature_design.md created)
- [x] Modify Admin Panel (`admin.html`):
    - [x] Add "Request Attendee Photos" button.
    - [x] Implement WebSocket message `{"type": "request_photo_consent"}` on button click.
    - [x] Add a link to the `gallery.html` page.
- [x] Modify Server (`server.js`):
    - [x] Handle `request_photo_consent` message from admin to broadcast `request_photo_consent` to attendees.
    - [x] Handle WebSocket message `photo_submission` from attendee to receive and save photos.
    - [x] Create HTTP GET endpoint `/photos` to list saved photo filenames.
    - [x] Configure static serving for `gallery.html` and saved photos in `/home/ubuntu/cyber_demo_files/uploads/`.
- [x] Modify Attendee Page (`index.html`):
    - [x] Listen for `request_photo_consent` WebSocket message.
    - [x] Display custom consent dialog.
    - [x] Handle user consent and browser camera permission request.
    - [x] Implement automatic photo capture (video stream to canvas, then to data URL).
    - [x] Stop camera stream immediately after capture.
    - [x] Send photo data URL via WebSocket message `photo_submission`.
    - [x] Display confirmation/error messages to attendee.
- [x] Create Gallery Page (`gallery.html`):
    - [x] Fetch photo list from `/photos` endpoint.
    - [x] Dynamically display photos from `/uploads/` directory.
    - [x] Implement a simple layout for the gallery.
    - [x] (Optional) Add refresh mechanism. (Implemented auto-refresh)
- [x] Ensure `uploads` directory (`/home/ubuntu/cyber_demo_files/uploads/`) is created by server if not present.
- [x] Test end-to-end photo capture and display functionality thoroughly.
- [x] Package all updated files and provide to user with updated setup instructions.
