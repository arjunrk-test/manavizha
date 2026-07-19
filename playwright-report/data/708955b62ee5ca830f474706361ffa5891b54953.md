# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: matrimony.spec.ts >> Manavizha Matrimony App Core Flows >> Find matches
- Location: tests\matrimony.spec.ts:24:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard\/daily-recommendations/
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    12 × unexpected value "http://localhost:3000/"

```

```yaml
- main:
  - navigation:
    - link "Manavizha Manavizha":
      - /url: /
      - img "Manavizha"
      - text: Manavizha
    - link "Features":
      - /url: "#features"
    - link "Testimonials":
      - /url: "#testimonials"
    - link "Horoscope":
      - /url: /horoscope
    - link "Contact":
      - /url: /contact
    - button "Login"
  - heading "Find Your Perfect Life Partner" [level=1]
  - paragraph: Join thousands of verified profiles and start your journey to a happy and meaningful future.
  - paragraph: How it works
  - list:
    - listitem:
      - text: "1"
      - paragraph: Tell your story
      - paragraph: Share photos, background, and partner preferences.
    - listitem:
      - text: "2"
      - paragraph: Explore verified matches
      - paragraph: Browse profiles aligned with your values and family expectations.
    - listitem:
      - text: "3"
      - paragraph: Connect with intention
      - paragraph: Express interest and message privately when you are ready.
  - button "Start Your Journey"
  - button "Browse Profiles"
  - img "Couple celebrating their wedding"
  - heading "100% Verified" [level=3]
  - paragraph: Carefully verified profiles for your peace of mind.
  - heading "Secure & Private" [level=3]
  - paragraph: Your data is private and protected with advanced security.
  - heading "Trusted by Families" [level=3]
  - paragraph: 10,000+ families trust Manavizha for genuine connections.
  - heading "Free Registration" [level=3]
  - paragraph: Create your profile for free and explore meaningful matches.
  - paragraph: Why Choose Us
  - heading "Built for trust and compatibility" [level=2]
  - paragraph: Verification, privacy, and compatibility — designed for individuals and families.
  - text: Profiles reviewed Family dashboards Horoscope tools
  - figure:
    - article:
      - heading "Verified profiles" [level=3]
      - paragraph: Identity, education, and background reviewed before a profile goes live.
  - figure:
    - article:
      - heading "Privacy you control" [level=3]
      - paragraph: Choose who sees your photos and contact details, on your terms.
  - figure:
    - article:
      - heading "Thoughtful matching" [level=3]
      - paragraph: Recommendations based on preferences, values, and lifestyle.
  - figure:
    - article:
      - heading "Horoscope compatibility" [level=3]
      - paragraph: Thirukanitham and Vakkiyam calculations for astrological alignment.
  - figure:
    - article:
      - heading "Family dashboard" [level=3]
      - paragraph: Parents can browse, shortlist, and discuss profiles with you.
  - figure:
    - article:
      - heading "Secure messaging" [level=3]
      - paragraph: Express interest privately without sharing contacts too early.
  - paragraph: Success Stories
  - heading "Stories from our community" [level=2]
  - paragraph: Real matches. Real families.
  - article:
    - figure:
      - img "Arjun & Priya"
    - blockquote: “We were skeptical about online matchmaking. The verification process and horoscope matching gave both our families the confidence to take the next step.”
    - paragraph: Arjun & Priya
    - paragraph: Chennai · Married 2024
    - paragraph: Verified Manavizha match
  - article:
    - img "Rahul & Meera"
    - blockquote: “My parents could review verified profiles and horoscope compatibility before we met. That made all the difference for our families.”
    - paragraph: Rahul & Meera
    - paragraph: Coimbatore · Married 2023
    - paragraph: Verified Manavizha match
  - article:
    - img "Vikram & Aditi"
    - blockquote: “We cared deeply about privacy. Manavizha let us connect on our terms — no pressure, no oversharing — and we found each other in under four months.”
    - paragraph: Vikram & Aditi
    - paragraph: Hyderabad · Married 2022
    - paragraph: Verified Manavizha match
  - paragraph: Get started
  - heading "Ready to find your perfect match?" [level=2]
  - paragraph: Create your profile in minutes. Search with your family, on your terms.
  - button "Create free profile"
  - button "Sign in"
  - paragraph: Free to join · Verified profiles · Family-friendly
  - paragraph: Contact
  - heading "Get in touch" [level=2]
  - link "contact@manavizha.com":
    - /url: mailto:contact@manavizha.com
  - link "+91 8925554449":
    - /url: tel:+918925554449
  - link "+91 8925554440":
    - /url: tel:+918925554440
  - text: India
  - paragraph:
    - text: © 2024 Manavizha
    - link "Privacy Policy":
      - /url: /privacy-policy
    - link "Terms of Service":
      - /url: /terms-of-service
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Manavizha Matrimony App Core Flows', () => {
  4  | 
  5  |   test('Create a profile', async ({ page }) => {
  6  |     // New member completes the multi-step setup and saves.
  7  |     // Expected: Profile saved, completion % rises.
  8  |     await page.goto('/signup');
  9  |     // For now we will mock the interactions or check for the elements
  10 |     // In a real e2e test, we would fill in the signup form here.
  11 |     
  12 |     await page.goto('/dashboard/setup');
  13 |     // Verify the page loads and contains setup form elements
  14 |     await expect(page).toHaveURL(/.*\/dashboard\/setup/);
  15 |     
  16 |     // Simulate filling out the form and clicking save
  17 |     // const saveBtn = page.getByRole('button', { name: /save/i });
  18 |     // await saveBtn.click();
  19 |     
  20 |     // Check for success indicator or progress change
  21 |     // await expect(page.getByText('Profile saved')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('Find matches', async ({ page }) => {
  25 |     // Daily picks + browse surface opposite-gender, unmarried profiles.
  26 |     // Expected: Curated profiles appear.
  27 |     await page.goto('/dashboard/daily-recommendations');
  28 |     
> 29 |     await expect(page).toHaveURL(/.*\/dashboard\/daily-recommendations/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  30 |     // Assuming profiles are displayed as cards or lists
  31 |     // await expect(page.locator('.profile-card').first()).toBeVisible();
  32 |   });
  33 | 
  34 |   test('Send interest', async ({ page }) => {
  35 |     // Open a profile and express interest.
  36 |     // Expected: 'Interest sent' toast; recipient notified.
  37 |     await page.goto('/dashboard/daily-recommendations');
  38 |     // Navigate to a specific profile, or go directly if ID is known
  39 |     // await page.goto('/dashboard/profile/123');
  40 |     
  41 |     // const interestBtn = page.getByRole('button', { name: /send interest/i });
  42 |     // await interestBtn.click();
  43 |     
  44 |     // Check for toast
  45 |     // await expect(page.getByText('Interest sent')).toBeVisible();
  46 |   });
  47 | 
  48 |   test('Accept / decline interest', async ({ page }) => {
  49 |     // Recipient responds from the interests tab.
  50 |     // Expected: Status updates both sides.
  51 |     await page.goto('/dashboard/interests?tab=likedme');
  52 |     
  53 |     // const acceptBtn = page.getByRole('button', { name: /accept/i }).first();
  54 |     // await acceptBtn.click();
  55 |     
  56 |     // Check for success or status update
  57 |     // await expect(page.getByText('Interest Accepted')).toBeVisible();
  58 |   });
  59 | 
  60 |   test('Chat after mutual + premium', async ({ page }) => {
  61 |     // A premium member starts a conversation once connected.
  62 |     // Expected: Message sends; other side receives it.
  63 |     await page.goto('/dashboard/messages');
  64 |     
  65 |     // await page.getByPlaceholder('Type a message...').fill('Hello!');
  66 |     // await page.getByRole('button', { name: /send/i }).click();
  67 |     
  68 |     // await expect(page.getByText('Hello!')).toBeVisible();
  69 |   });
  70 | 
  71 |   test('Generate & match horoscope', async ({ page }) => {
  72 |     // Create jathagam and run Tamil 10-porutham against a match.
  73 |     // Expected: Chart generates; porutham score + status shown.
  74 |     await page.goto('/dashboard/horoscope');
  75 |     
  76 |     // Simulate generation
  77 |     // await page.getByRole('button', { name: /generate/i }).click();
  78 |     
  79 |     // await expect(page.getByText(/porutham score/i)).toBeVisible();
  80 |   });
  81 | 
  82 | });
  83 | 
```