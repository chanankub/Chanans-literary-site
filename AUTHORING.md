# מדריך כתיבה ופרסום

## תרגומי שירה

1. העתק את `src/content/poems/_template.md` לקובץ חדש (שם באנגלית או עברית transliterated, למשל `my-poem.md`).
2. מלא את השדות בראש הקובץ, בעיקר `pairs` — כל שורה מקורית לצד תרגום.
3. לרווח בין בתים: הוסף פריט עם `spacer: true` בלבד.
4. `draft: true` — לא מופיע באתר. כשמוכן: `draft: false`.
5. שמור **תמיד ב־UTF-8** (ב־Cursor: פינה ימנית תחתונה → UTF-8).

### ניקוד

הניקוד שמוקלד בקובץ מוצג באתר כפי שהוא. השתמש בגופן שתומך בניקוד (האתר טוען Noto Serif Hebrew). אין להסיר ניקוד אוטומטית.

### מקלדת עברית ב־Windows

`Win + Space` להחלפת שפה, או הוסף עברית בהגדרות → שפה ואזור → מקלדת.

---

## סיפורים והערות

### אפשרות א: ייבוא מ־Word

```bash
npm run import:docx -- "C:\path\to\story.docx" --type story --title "שם הסיפור"
```

```bash
npm run import:docx -- "C:\path\to\note.docx" --type note --title "כותרת ההערה"
```

תמונות מוטמעות נשמרות ב־`public/images/<slug>/`.

לאחר הייבוא: ערוך את קובץ ה־`.md` שנוצר ב־`src/content/stories/` או `src/content/notes/` — הוסף `summary`, בדוק כותרות, והגדר `draft: false`.

### אפשרות ב: כתיבה ישירות ב־Markdown

צור קובץ `.md` חדש בתיקייה המתאימה, עם frontmatter:

```yaml
---
title: "שם"
summary: "משפט לרשימה"
date: 2026-05-28
draft: false
---

הטקסט כאן...
```

פרקים: `## כותרת פרק`

---

## תצוגה מקומית

```bash
npm install
npm run dev
```

פתח את הכתובת שמופיעה בטרמינל (בדרך כלל `http://localhost:4321/Chanans-literary-site/`).

## פרסום

```bash
git add .
git commit -m "תוכן חדש"
git push
```

GitHub Actions בונה ומפרסם ל־Pages אוטומטית (אחרי הפעלת Pages ב־repo).

**כתובת האתר:** https://chanankub.github.io/Chanans-literary-site/
