# פריסה ל-GitHub Pages

## לפני הדחיפה הראשונה (מקומית)

```bash
cd C:\Users\chana\Projects\My_Website
npm install
npm run build
```

אם `npm run build` מצליח, התיקייה `dist/` מוכנה לפריסה.

## חיבור ל-GitHub

```bash
git init
git remote add origin https://github.com/chanankub/Chanans-literary-site.git
git add .
git commit -m "Initial Astro literary site"
git branch -M main
git push -u origin main
```

אם ה-repo כבר קיים עם היסטוריה, ייתכן שתצטרך `git pull --rebase origin main` לפני הדחיפה.

## הפעלת GitHub Pages

1. ב-GitHub: [Settings → Pages](https://github.com/chanankub/Chanans-literary-site/settings/pages)
2. תחת **Build and deployment → Source** בחר **GitHub Actions** (לא «Deploy from a branch»)
3. שמור — אין צורך לבחור workflow נוסף; הקיים `.github/workflows/deploy.yml` ירוץ בדחיפה ל-`main`
4. ב-**Actions** לחץ **Re-run all jobs** על הריצה האחרונה (או דחוף commit חדש)
5. האתר: **https://chanankub.github.io/Chanans-literary-site/**

## כניסת קוראים (Supabase)

האתר נשאר סטטי. חשבונות, רשימת «מה ראיתי» ותגובות יושבים ב-Supabase. בלי המפתחות האתר נבנה כרגיל, ובמקום הכניסה מופיעה הערת הגדרה.

1. צרו פרויקט ב-[Supabase](https://supabase.com) והפעילו כניסה בדוא״ל (Magic Link).
2. ב-**Authentication → URL Configuration** הוסיפו:
   - `http://127.0.0.1:4321/Chanans-literary-site/login/`
   - `https://chanankub.github.io/Chanans-literary-site/login/`
3. ב-**Authentication → Email Templates → Magic Link** הדביקו את הנושא ואת הגוף מ-`supabase/templates/magic_link.html` (הנושא: `קוד כניסה`). הפרויקט החי אינו קורא את `config.toml`. ההודעה כוללת קוד בן 6 ספרות (`{{ .Token }}`) וקישור `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink`. ב-**Authentication → Providers → Email** השאירו את אורך הקוד על 6. אורך 4 נדחה ונשלח כ-6.
4. ב-**SQL Editor** החליפו את `you@example.com` בקובץ `supabase/schema.sql` בכתובת שלכם, והריצו את כל הקובץ פעם אחת.
5. העתיקו את כתובת הפרויקט ואת מפתח ה-**anon** אל `.env` (ראו `.env.example`). את מפתח ה-service role לא שמים באתר ולא ב-Git.
6. אותם שני ערכים כ-secrets ב-GitHub: `PUBLIC_SUPABASE_URL` ו-`PUBLIC_SUPABASE_ANON_KEY`. הם כבר מועברים ב-`.github/workflows/deploy.yml`.
7. הפעלה מקומית: `npm run dev`, ואז `http://127.0.0.1:4321/Chanans-literary-site/login/`.

## רשימת פרסום שוטפת

- [ ] שיר חדש: העתק `src/content/poems/_template.md` → קובץ חדש, מלא `pairs`, `draft: false`
- [ ] סיפור/הערה מ-Word: `npm run import:docx -- "path.docx" --type story --title "כותרת"`
- [ ] ערוך `summary` ו-`draft: false` בקובץ שנוצר
- [ ] `npm run build` (אופציונלי, לבדיקה מקומית)
- [ ] `git add . && git commit -m "..." && git push`

## פתרון בעיות

| בעיה              | פתרון                                                            |
| ----------------- | ---------------------------------------------------------------- |
| תמונות לא נטענות  | ודא שנתיב ב-Markdown מתחיל ב-`/Chanans-literary-site/images/...` אחרי ייבוא |
| שיר לא מופיע      | `draft: false` ושם קובץ לא מתחיל ב-`_`                           |
| 404 ב-deploy (`Failed to create deployment`) | הפעל Pages ידנית: [Settings → Pages](https://github.com/chanankub/Chanans-literary-site/settings/pages) → Source → **GitHub Actions**, ואז הרץ מחדש את ה-workflow |
| שגיאת `configure-pages` / `Get Pages site failed` | Pages עדיין לא מופעל — אותו תיקון כמו בשורה למעלה |
