# Victoria Finance: Client Satisfaction Survey (Customer Service Week 2026)

A Swahili, mobile-first survey form hosted on Vercel. Every response is written as one row in a single Google Sheet.

```
logo.png                      company logo shown in the header
index.html                    the form (no build step, no dependencies)
survey-config.js              all questions and options; edit content here only
api/submit.js                 Vercel function: validates a response, forwards it to the sheet
google-apps-script/Code.gs    paste into the Google Sheet; appends each response as a row
```

## Setup (about 10 minutes)

### 1. Google Sheet

1. Create a Google Sheet, e.g. "VFP Client Satisfaction Survey 2026 - Majibu".
2. Share it with Adelina (Viewer is enough for reading; Editor if she will clean data).
3. Extensions > Apps Script. Delete the sample code and paste all of `google-apps-script/Code.gs`.
4. Change `SECRET` at the top to a long random string. Keep it; you need it in step 2.
5. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and approve the permission prompt.
6. Copy the Web app URL (it ends in `/exec`).

"Anyone" is required so Vercel can reach the script; the secret is what stops other people writing to the sheet.

### 2. Vercel

1. Push this folder to a Git repo and import it in Vercel (Framework preset: **Other**, no build command), or run `vercel --prod` from this folder.
2. Project > Settings > Environment Variables, for Production:
   - `SHEET_WEBHOOK_URL` = the `/exec` URL from step 1.6
   - `SHEET_SECRET` = the same string you put in `Code.gs`
3. Redeploy so the variables take effect.

### 3. Test before sharing

1. Open the Vercel link on a phone and submit once with "Ndiyo" on question 7 and once with "Hapana".
2. Enter a phone number starting with 0 (e.g. 0712 345 678) and confirm the sheet keeps the leading zero.
3. Confirm both rows appear in the `Majibu` tab, then delete the test rows (keep the header row).

If the form says the answers were not sent, check Vercel > Project > Logs. The usual causes are a missing environment variable, a secret that does not match, or a web app deployed with access other than "Anyone".

## Changing things later

- **Questions, options, required or optional:** `survey-config.js`. Set `required: true/false` per question. The header row in the sheet is written only once, so if you add or reorder questions after responses exist, start a fresh tab (rename the old `Majibu` tab).
- **Colours:** the `:root` block at the top of the `<style>` in `index.html` (`--brand` is the logo blue, `--green` the logo green).
- **Logo:** replace `logo.png` (next to `index.html`) with a file of the same name.
- **Apps Script edits:** Deploy > Manage deployments > Edit > Version: New version. The URL stays the same.

## How the sheet is laid out

One row per response: timestamp (Dar es Salaam time), then questions 1 to 14 in order. Multi-choice answers (3, 8, 10) are joined with "; ". Question 6 takes six columns, one per item. Questions 8 and 9 are blank when the answer to 7 is "Hapana".
