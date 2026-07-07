# אתר ספרותי אישי

אתר סטטי בעברית (RTL) לתרגומי שירה, סיפורים קצרים והערות אישיות.

**מחסנית:** [Astro](https://astro.build) · **אירוח:** [GitHub Pages](https://chanankub.github.io/Chanans-literary-site/)

## התחלה מהירה

```bash
npm install
npm run dev
```

## פקודות

| פקודה | תיאור |
|--------|--------|
| `npm run dev` | שרת פיתוח מקומי |
| `npm run build` | בנייה לפרודקשן |
| `npm run preview` | תצוגה מקדימה של הבנייה |
| `npm run import:docx -- <file> --type story\|note` | ייבוא מ־Word |

פרטים מלאים: [AUTHORING.md](./AUTHORING.md)

## מבנה

```
src/
  content/poems/     תרגומים (שורות מקבילות ב-frontmatter)
  content/stories/   סיפורים
  content/notes/     הערות
  components/        PoemParallel, Nav
  pages/             דפי האתר
public/images/       תמונות מייבוא Word
```

## פריסה (GitHub Pages)

1. ב־GitHub: **Settings → Pages → Build and deployment → GitHub Actions**
2. דחיפה ל־`main` מפעילה את `.github/workflows/deploy.yml`
3. האתר יהיה זמין ב־`https://chanankub.github.io/Chanans-literary-site/`

## רישיון

תוכן © המחבר. קוד האתר לשימוש אישי.
