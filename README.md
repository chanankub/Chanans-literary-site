<div dir="rtl">

# אתר ספרותי אישי

אתר סטטי בעברית (RTL) לתרגומי שירה, סיפורים קצרים והערות אישיות.

**מחסנית:** [Astro](https://astro.build) · **אירוח:** [GitHub Pages](https://chanankub.github.io/Chanans-literary-site/)

המדריכים נמצאים ב־[docs/](./docs/README.md). הם נפרדים מקובצי היצירות שב־`src/content/`.

## התחלה מהירה

```bash
npm install
npm run dev
```

השרת מאזין ל־`127.0.0.1`. פותחים את הכתובת שהטרמינל מדפיס.

## פקודות

| פקודה | תיאור |
|--------|--------|
| `npm run dev` | שרת פיתוח מקומי |
| `npm run build` | בנייה לפרודקשן |
| `npm run preview` | תצוגה מקדימה של הבנייה |
| `npm run import:docx -- <file> --type story\|note` | ייבוא מ־Word |

## מבנה

```
docs/                  מדריכים. אינם נבנים לאתר
src/content/poems/     תרגומים ושירים
src/content/stories/   סיפורים
src/content/notes/     הערות
src/content/about/     אודות (about.md)
src/pages/             דפי האתר
public/images/         תמונות
```

## רישיון

תוכן © המחבר. קוד האתר לשימוש אישי.

</div>
