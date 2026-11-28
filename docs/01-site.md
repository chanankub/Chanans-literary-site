<div dir="rtl">

# מהו האתר

אתר ספרותי אישי בעברית, מימין לשמאל. יש בו תרגומי שירה, שירים של חנן קוביצקי, סיפורים קצרים, והערות על קריאת שירה.

הדפים עצמם הם אתר סטטי. [Astro](https://astro.build) בונה אותם מראש, ו־[GitHub Pages](https://chanankub.github.io/Chanans-literary-site/) מגיש אותם. חשבונות, רשימת «מה ראיתי», ותגובות אינם בקבצי האתר. הם יושבים ב־[Supabase](https://supabase.com), והדפדפן פונה אליהם אחרי שהדף נטען.

**כתובת:** https://chanankub.github.io/Chanans-literary-site/

הנתיב הקבוע הוא `/Chanans-literary-site`, וכל כתובת מסתיימת בלוכסן.

## המדורים

| באתר | נתיב | מקור |
|------|------|------|
| בית | `/` | `src/pages/index.astro` |
| אודות | `/about/` | `src/content/about/about.md` |
| שירה ותרגומים | `/translations/` | `src/content/poems/` |
| סיפורים קצרים | `/stories/` | `src/content/stories/` |
| איך למדתי לאהוב שירה | `/notes/` | `src/content/notes/` |
| כניסה | `/login/` | `src/pages/login.astro` |
| מה ראיתי | `/seen/` | נבנה בדפדפן מ־Supabase |
| הערות פרטיות | `/inbox/` | נבנה בדפדפן, לבעלים בלבד |

רשימות הכותרות גלויות לכל אחד. מי רואה את גוף היצירה, ומי רואה תגובות, מתואר ב־[מה רואה הקורא](./02-readers.md).

## מפת תיקיות

```
src/content/          היצירות. רק אלה נבנות לאתר
  poems/              שיר או תרגום, שורה־שורה ב־frontmatter
  stories/            סיפורים ב־Markdown
  notes/              הערות ב־Markdown
  about/              עמוד אחד, about.md
src/pages/            הדפים
src/components/       חלקים משותפים (שיר מקביל, ניווט, תגובות)
src/layouts/          מעטפת העמוד
src/lib/              לוגיקה: תוכן, כניסה, תגובות
src/styles/literary.css
public/               קבצים כפי שהם: תמונות, favicon
docs/                 המדריכים האלה
supabase/             סכמת החשבונות והתגובות
scripts/              ייבוא מ־Word, וסקריפטים חד־פעמיים למילוי שיר
obsidian-templates/   תבניות לכתיבה
```

קובץ שמתחיל ב־`_` בתוך אוסף תוכן, למשל `src/content/poems/_template.md`, אינו מתפרסם. תיקיית `docs/` אינה אוסף תוכן, ולכן אין צורך בקו תחתון כדי להסתיר אותה.

תוכן היצירות שייך למחבר. קוד האתר מיועד לשימוש אישי.

</div>
