---
title: "כותרת הסיפור"
summary: "משפט אחד לרשימת הסיפורים"
date: 2026-05-28
draft: true
order: 10
---

פסקת פתיחה. כתוב כאן את הסיפור בעברית.

## פרק ראשון

פסקאות נוספות. השתמש ב־`##` לכותרות פרקים.

## פרק שני

תמונות: שים קבצים ב־`public/images/<slug>/` והצג ב־Markdown:

```markdown
![תיאור](/My_Website/images/<slug>/photo.jpg)
```

---

# הוראות

- העתק קובץ זה, שנה את שם הקובץ (ללא `_` בתחילה).
- `draft: true` — לא מופיע באתר. שנה ל־`false` כשמוכן לפרסום.
- `order` — מספר נמוך יותר מופיע ראשון ברשימה.
- ייבוא מ־Word: `npm run import:docx -- "C:\path\to\file.docx" --type story --title "כותרת"`
