# הרצה ופרסום

## במחשב

```powershell
cd C:\Users\chana\projects\My_Website
npm install
npm run dev
```

שרת הפיתוח מאזין ל־`127.0.0.1` בלבד, בדרך כלל פורט 4321. פותחים את הכתובת שהטרמינל מדפיס, למשל:

`http://127.0.0.1:4321/Chanans-literary-site/`

`localhost` דרך IPv6 נדחה, כי השרת אינו מאזין לו. אם 4321 תפוס, Astro עובר לפורט הבא ואומר זאת.

`npm run build` מכין את `dist/`. `npm run preview` מגיש את הבנייה המוכנה.

## מפתחות

מעתיקים את `.env.example` אל `.env`:

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

אלה כתובת הפרויקט ומפתח ה־anon מלוח Supabase. מפתח ה־service role אינו נכנס לכאן. `.env` אינו נדחף ל־Git.

בלי שני הערכים האתר נבנה, והכניסה מציגה הערת הגדרה.

## Supabase, פעם אחת

1. יוצרים פרויקט ב־[Supabase](https://supabase.com) ומפעילים כניסה בדוא״ל (Magic Link).
2. ב־**Authentication → URL Configuration** מוסיפים:
   - `http://127.0.0.1:4321/Chanans-literary-site/login/`
   - `https://chanankub.github.io/Chanans-literary-site/login/`
3. ב־**SQL Editor** מחליפים ב־`supabase/schema.sql` את כתובת הבעלים, ומריצים את כל הקובץ פעם אחת.
4. מעתיקים את כתובת הפרויקט ואת מפתח ה־anon אל `.env`.

ההודעה שנשלחת היא תבנית ברירת המחדל של Supabase. בגרסה החינמית אי אפשר להחליף את הנוסח, ולכן אין טעם להדביק את `supabase/templates/magic_link.html` בהגדרות. הקובץ נשאר במאגר כנוסח שהוכן לקוד בן 6 ספרות, והפרויקט החי אינו שולח אותו.

## GitHub Pages

האתר כבר מחובר ל־https://github.com/chanankub/Chanans-literary-site.git. דחיפה ל־`main` מפעילה את `.github/workflows/deploy.yml`: `npm ci`, `npm run build`, והעלאה ל־Pages.

ב־GitHub, תחת **Settings → Pages → Build and deployment**, המקור הוא **GitHub Actions**.

אותם שני ערכים הם secrets של המאגר: `PUBLIC_SUPABASE_URL` ו־`PUBLIC_SUPABASE_ANON_KEY`. ה־workflow מעביר אותם לבנייה. בלי secrets הבנייה מצליחה, והאתר המפורסם בלי כניסה.

הכתובת: https://chanankub.github.io/Chanans-literary-site/

Node בבנייה הוא 22.

## פרסום יצירה

```powershell
git add .
git commit -m "תוכן חדש"
git push
```

הודעות ה־commit במאגר כתובות עברית, ומתארות למה השינוי קיים.

אפשר לבדוק לפני הדחיפה עם `npm run build`. כשל בבנייה, למשל YAML שבור בשיר, עוצר גם את ה־workflow.
