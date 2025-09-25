# 📝 NovelAI Profile Manager
A full-featured Tampermonkey script that turns prompt writing on NovelAI Image from a chore into something fast, fun, and repeatable.

No more:

Copy-pasting prompts from Discord or Notepad
Losing your favorite settings after a browser refresh
Typing the same long tags over and over
This is your personal prompt vault — right inside the page, ready when you are.

![ss](https://raw.githubusercontent.com/mikojiy/NAI-Profile-Manager/main/Screenshot.png)

> **A Tampermonkey script for NovelAI Image Generator**  
> Full support for **Negative Prompts**, **Global Variables**, **Wildcards**, **Danbooru import**, **Profile management**, and more — with **auto language detection** (English / Bahasa Indonesia / 日本語).

[![Donate via Ko-fi](https://img.shields.io/badge/☕_Buy_me_a_coffee-ff5f5f?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/mikojiy)

## 🌍 Need the full guide in your language?

- 🇺🇸 **English**: [README-en.md](./README-en.md)  
- 🇮🇩 **Bahasa Indonesia**: [README-id.md](./README-id.md)  
- 🇯🇵 **日本語**: [README-ja.md](./README-ja.md)

---

## 📥 How to Install
[VIDEO TUTORIAL](https://www.youtube.com/watch?v=SLr24q8o4C8)

1. **Install Tampermonkey**  
   → [tampermonkey.net](https://www.tampermonkey.net/) (works on Chrome, Firefox, Edge)

2. **Click this link:**  
   → [Install Script](https://raw.githubusercontent.com/mikojiy/NAI-Profile-Manager/main/NAIPM.user.js)  
   *(Tampermonkey will pop up and ask if you want to add it)*

3. Click “Install”, then go to:  
   → [https://novelai.net/image](https://novelai.net/image)

You’ll see a small 📝 icon in the corner. That’s your control center.
If you dont see the icon, go to **Extensions > Manage Extensions > Enable Developer Mode > then click Details on Tampermonkey > and Enable Allow User Scripts**

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| **Prompt Profiles** | Save & manage pairs of positive + negative prompts as named profiles. Switch, rename, delete, or reorder them instantly. |
| **Negative Prompt Support** | Every profile includes a dedicated negative prompt field — not just positive! |
| **Global Variables (`{name}`)** | Use placeholders like `{miku}` that expand to full prompts (e.g., `twintail, blue hair, aqua eyes`). |
| **Wildcards (`[name]`)** | Insert random values from a list: `[character]` → `miku`, `teto`, or `luka`. |
| **Danbooru Integration** | Fetch tags directly from Danbooru by post ID. Auto-remove unwanted tags (e.g., `text`, `watermark`, `white background`). |
| **Fill-on-Apply Dialog** | When your prompt contains `{var}`, `[wildcard]`, or `{DB}`, a popup lets you fill values **before applying** — without altering your original profile. |
| **Dark Mode & Draggable UI** | Toggle dark/light theme. Move the 📝 icon anywhere on screen. |
| **Full Backup & Restore** | Export/import everything: profiles, variables, wildcards, blacklist, and settings — as a single `.json` file. |
| **Keyboard Shortcuts** | <ul><li>`Ctrl+1`–`Ctrl+0` → Apply profile #1–#10</li><li>`Ctrl+Q` → Quick-search by name or number</li></ul> |
| **Auto-Update Check** | Get notified when a new version is available. One click to update. |
| **Multilingual UI** | Auto-detects browser language. Supports **English**, **Bahasa Indonesia**, and **日本語**. |

> ℹ️ **Note**: Prompts are **never translated**. Terms like `twintail`, `masterpiece`, or `school uniform` stay exactly as you write them.

---

## 📜 License

This script is released under the **MIT License** — free to use, modify, and share.
MIT License

Copyright (c) 2025 mikojiy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 💖 Support the Project

Enjoying the script?  
Consider buying me a coffee! ☕  
→ [**https://ko-fi.com/mikojiy**](https://ko-fi.com/mikojiy)

Your support helps keep this project alive and updated!

---
