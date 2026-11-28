<div dir="rtl">

# הוספת יצירה

האתר והכתיבה משתמשים באותם קבצי Markdown. שמירה תמיד ב־UTF-8. ב־Windows מחליפים לעברית ב־`Win + Space`.

קובץ מוכן לפרסום: `draft: false`, והשם אינו מתחיל ב־`_`. ניקוד שמוקלד מוצג כפי שהוא. האתר טוען Noto Serif Hebrew, ואין להסיר ניקוד אוטומטית.

אחרי בדיקה מקומית:

```powershell
git add .
git commit -m "תוכן חדש"
git push
```

דחיפה ל־`main` מפרסמת. הפרטים ב־[הרצה ופרסום](./07-running.md).

## שיר או תרגום

מעתיקים את `src/content/poems/_template.md` אל קובץ חדש באותה תיקייה. שם הקובץ באנגלית או בתעתיק, למשל `my-poem.md`. השם הזה הוא ה־slug בכתובת.

השדות שקובעים מה רואים:

| שדה | תפקיד |
|-----|--------|
| `title` | הכותרת העברית |
| `originalTitle` | כותרת המקור, אם יש |
| `author` / `authorEn` | שם עברי ושם אנגלי |
| `authorBirth` / `authorDeath` | שנים. שנה חסרה פשוט אינה מוצגת |
| `sourceLang` | שפת המקור. `he` מציג עמודה עברית אחת |
| `draft` | `true` מסתיר |
| `pairs` | השיר עצמו, שורה אחר שורה |

כל פריט ב־`pairs` הוא שורה:

- `original` — שורת המקור
- `translation` — השורה העברית
- `english` — שורה שלישית, כשהפריסה `pairLayout: trilingual`
- `spacer: true` — רווח בין בתים, בלי טקסט
- `indent` — 1, 2 או 3, במקום טאב
- `title: true` — כותרת של שיר בתוך קובץ שמכיל כמה שירים
- `image` — נתיב תמונה תחת `public/`, ו־`imageAlt`

שיר של חנן, בלי מקור לועזי, משתמש רק ב־`translation` וב־`sourceLang: he`.

אפשר גם:

- `footnote` והכוכבית עליו ב־`footnoteOn`: `death` (ברירת המחדל), `title`, או `author`
- `footnotes` — הערות ממוספרות מתחת לשיר
- `epigraph` — מוטו דו־לשוני מעל השיר
- `altTitle` ו־`altPairs` — גוש עברי נוסף מתחת לשיר
- `date` — תאריך בקובץ. הרשימה אינה ממיינת לפיו

את בלוק ה־`pairs` עדיף לערוך במצב מקור, לא בתצוגה חיה, כדי שה־YAML יישבר פחות.

איפה השיר יושב ברשימה: [מיקום שיר ברשימה](./03-poetry-index.md).

## אודות

עמוד אחד: `src/content/about/about.md`. הכותרת בשדה `title`. הטקסט שמתחת ל־frontmatter הוא העמוד. `draft: true` מסתיר אותו.

## סיפור או הערה

### מ־Word

```powershell
npm run import:docx -- "C:\path\to\story.docx" --type story --title "שם הסיפור"
npm run import:docx -- "C:\path\to\note.docx" --type note --title "כותרת ההערה"
```

אפשר להוסיף `--slug my-slug` ו־`--draft`. תמונות מוטמעות נשמרות ב־`public/images/<slug>/`.

אחרי הייבוא עורכים את הקובץ שנוצר: `summary`, כותרות, ו־`draft: false`.

### ישירות ב־Markdown

```yaml
---
title: "שם"
summary: "משפט לרשימה"
date: 2026-05-28
draft: false
lang: he
subtitle: ""
order: 10
---

הטקסט כאן...
```

`## כותרת` פותחת פרק. `lang: en` הופך את העמוד לשמאל־ימין. `order` קובע מקום בין יצירות שלא נמשכו לבלוק בעל שם: מספר קטן קודם, ואחר כך כותרת עברית. בשירים השדה הזה אינו קובע את סדר הרשימה.

רשימת הסיפורים והרשימה של ההערות נבנות כמו רשימת השירים, בקובץ העמוד שלהן: בלוקים לפי slugs, והשאר לפי `order` ואחר כך כותרת. את החלוקה משנים שם, לא במדריך.

ההערה הארוכה «הקדמה» מחזיקה תוכן עניינים משלה ב־`src/lib/notes-toc.ts`. תגובה שם נקשרת לפרק, לא להערה כולה. פרק חדש בתוכן העניינים דורש עדכון של הקובץ הזה.

## תמונות וקישורים

```markdown
![תיאור](/Chanans-literary-site/images/<slug>/photo.jpg)
```

הקובץ עצמו יושב ב־`public/images/<slug>/`. קישור ויקי של Obsidian (`[[ככה]]`) וקישור תמונה בסגנון `![[photo.png]]` אינם עובדים באתר.

## Obsidian

פותחים את תיקיית הפרויקט כוולת. אין עותק נפרד.

| הגדרה | ערך |
|--------|------|
| Editor → Right-to-left | מופעל |
| Core plugins → Templates | מופעל |
| Templates → Template folder location | `obsidian-templates` |
| Templates → Date format | `YYYY-MM-DD` |

`.obsidian/` נשאר במחשב ואינו נדחף ל־Git.

| תבנית | שימוש |
|-------|--------|
| `obsidian-templates/תרגום.md` | שיר עם `pairs` |
| `obsidian-templates/סיפור.md` | סיפור |
| `obsidian-templates/הערה.md` | הערה |

יוצרים קובץ בתיקייה הנכונה תחת `src/content/`, מפעילים את התבנית (`Ctrl+T`), וממלאים. כשמוכן: `draft: false`.

תוסף Obsidian Git יכול לדחוף מתוך Obsidian. אותן פקודות `git add`, `commit`, `push`.

</div>
