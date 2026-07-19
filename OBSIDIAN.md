# עבודה עם Obsidian

האתר והכתיבה משתמשים באותם קבצי Markdown. פתח את **תיקיית הפרויקט** כ־vault ב־Obsidian — אין צורך להעתיק קבצים.

## פתיחת ה־vault

1. Obsidian → **Open folder as vault**
2. בחר: `C:\Users\chana\projects\My_Website`

## הגדרות מומלצות

| הגדרה | ערך |
|--------|------|
| **Editor → Right-to-left (RTL)** | מופעל (לעברית) |
| **Core plugins → Templates** | מופעל |
| **Templates → Template folder location** | `obsidian-templates` |
| **Templates → Date format** | `YYYY-MM-DD` |

התיקייה `.obsidian/` לא נדחפת ל־Git (רק הגדרות מקומיות שלך).

## תבניות

בתיקייה `obsidian-templates/`:

| קובץ | שימוש |
|------|--------|
| `תרגום.md` | שיר עם `pairs` |
| `סיפור.md` | סיפור קצר |
| `הערה.md` | הערה אישית |

**יצירת קובץ חדש:**

1. צור קובץ חדש בתיקייה הנכונה תחת `src/content/` (ראה למטה)
2. הרץ את פקודת Templates (ברירת מחדל: `Ctrl+T` / `Cmd+T`) ובחר תבנית
3. מלא את השדות; כשמוכן לפרסום: `draft: false`
4. **שם הקובץ** — באנגלית/תעתיק, למשל `my-poem.md` (לא להתחיל ב־`_`)

| סוג | תיקייה |
|-----|---------|
| תרגום | `src/content/poems/` |
| סיפור | `src/content/stories/` |
| הערה | `src/content/notes/` |

### שירים — מצב Source

את בלוק ה־`pairs` עדיף לערוך ב־**Source mode** (לא Live Preview), כדי שה־YAML יישאר תקין.

## מה להימנע ממנו בקבצים שמתפרסמים

- קישורי ויקי של Obsidian: `[[ככה]]` — השתמש בקישורי Markdown רגילים
- תמונות בסגנון Obsidian: `![[photo.png]]` — השתמש ב:

```markdown
![תיאור](/Chanans-literary-site/images/<slug>/photo.jpg)
```

שים את קבצי התמונה ב־`public/images/<slug>/`.

## תצוגה מקדימה ופרסום

```powershell
cd C:\Users\chana\projects\My_Website
npm run dev
```

אחרי בדיקה מקומית:

```powershell
git add .
git commit -m "תוכן חדש"
git push
```

אופציונלי: תוסף **Obsidian Git** לדחיפה מתוך Obsidian.

## עוד מידע

- כתיבה ופרסום: [AUTHORING.md](./AUTHORING.md)
- פריסה ל־GitHub Pages: [DEPLOY.md](./DEPLOY.md)
