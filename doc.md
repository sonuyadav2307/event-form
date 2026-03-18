vent: Fun & Fitness Eve
Date: 21-03-2026



2️⃣ Participant Details

Full Name
⬜ _________

Age
⬜ _________

Gender
⬜ Male
⬜ Female
⬜ Prefer not to say

Mobile Number
⬜ _________

Email (Optional)
⬜ _________

City
⬜ _________

⸻

3️⃣ Emergency Contact

Emergency Contact Name
⬜ _________

Emergency Phone Number
⬜ _________

⸻

4️⃣ Health Declaration

Do you have any medical conditions?
⬜ No
⬜ Yes (Please specify)

If yes:
⬜ _________

⸻


7️⃣ Consent / Declaration

“I confirm that I am medically fit to participate in this event and I take full responsibility for my participation.”

⬜ I Agree

---

## Admin login (Firebase Auth)

1. In [Firebase Console](https://console.firebase.google.com) → your project → **Authentication** → **Sign-in method**, enable **Email/Password**.
2. Under **Users**, add an admin user (email + password) or register once via the Auth API.
3. **`/`** — public event registration form  
4. **`/login`** — admin sign-in (redirects to dashboard if already signed in)  
5. **`/dashboard`** — protected; unauthenticated users are sent to `/login`; shows all **`registrations`** in a grid (live updates).

**Firestore rules:** deploy `firestore.rules`. Public **create** (no `paymentStatus` or must be `unpaid`). Admins can **read** and may **update only** `paymentStatus` (`paid` / `unpaid`).
