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
git remote add origin https://github.com/chanankub/My_Website.git
git add .
git commit -m "Initial Astro literary site"
git branch -M main
git push -u origin main
```

אם ה-repo כבר קיים עם היסטוריה, ייתכן שתצטרך `git pull --rebase origin main` לפני הדחיפה.

## הפעלת GitHub Pages

1. ב-GitHub: **Settings → Pages**
2. **Build and deployment → Source:** GitHub Actions
3. לאחר דחיפה ל-`main`, בדוק ב-**Actions** שה-workflow `Deploy to GitHub Pages` עבר בהצלחה
4. האתר: **https://chanankub.github.io/My_Website/**

## רשימת פרסום שוטפת

- [ ] שיר חדש: העתק `src/content/poems/_template.md` → קובץ חדש, מלא `pairs`, `draft: false`
- [ ] סיפור/הערה מ-Word: `npm run import:docx -- "path.docx" --type story --title "כותרת"`
- [ ] ערוך `summary` ו-`draft: false` בקובץ שנוצר
- [ ] `npm run build` (אופציונלי, לבדיקה מקומית)
- [ ] `git add . && git commit -m "..." && git push`

## פתרון בעיות

| בעיה | פתרון |
|------|--------|
| תמונות לא נטענות | ודא שנתיב ב-Markdown מתחיל ב-`/My_Website/images/...` אחרי ייבוא |
| שיר לא מופיע | `draft: false` ושם קובץ לא מתחיל ב-`_` |
| 404 בדפים פנימיים | ודא ש-`base: '/My_Website'` ב-`astro.config.mjs` תואם לשם ה-repo |
