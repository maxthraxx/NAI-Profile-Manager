# NovelAI Prompt Profiles (Ultimate) 🚀

A full-featured Tampermonkey script that turns prompt writing on [NovelAI Image](https://novelai.net/image) from a chore into something fast, fun, and repeatable.

No more:
- Copy-pasting prompts from Discord or Notepad
- Losing your favorite settings after a browser refresh
- Typing the same long tags over and over

This is your **personal prompt vault** — right inside the page, ready when you are.

![Panel utama dalam mode terang]([screenshots/panel-light.png](https://github.com/mikojiy/NAI-Profile-Manager/blob/main/Screenshot.png))

---

## 🔧 What It Does (In Plain English)

Imagine having a library of pre-written prompts. You pick one, tweak a few details (like character name or outfit), and *poof* — it’s in the editor.

That’s exactly what this script does.

It adds a floating panel where you can:
- Save, rename, delete, and organize your prompts
- Fill in variables like `{character}` or `{mood}` on the fly
- Pull real tags from Danbooru posts using just an ID
- Use keyboard shortcuts to load anything instantly
- Backup everything so you never lose your work

And yes — it remembers your last used profile, lets you drag the icon around, and even has dark mode.

---

## 📥 How to Install

1. **Install Tampermonkey**  
   → [tampermonkey.net](https://www.tampermonkey.net/) (works on Chrome, Firefox, Edge)

2. **Click this link:**  
   → [Install Script](https://raw.githubusercontent.com/yourname/yourrepo/main/novelai-prompt-profiles.user.js)  
   *(Tampermonkey will pop up and ask if you want to add it)*

3. Click “Install”, then go to:  
   → [https://novelai.net/image](https://novelai.net/image)

You’ll see a small 📝 icon in the corner. That’s your control center.

> ⚠️ The script only works on `https://novelai.net/image`

---

## 🎯 All Features Explained (Step by Step)

### 1. **The Floating Icon (📝)**

After installing, you’ll see a little 📝 button fixed on the screen.

- **Drag it anywhere** → click & hold to move it out of the way.
- **Click it** → opens the main panel.
- Position is saved automatically.

---

### 2. **Main Panel Overview**

When you click the icon, a clean popup appears with:

- A dropdown list of your saved profiles
- A textarea to edit the current prompt
- Buttons for all actions
- Status messages at the top ("Ready", "Applied", etc.)

You can close it anytime by clicking the × button or clicking outside.

---

### 3. **How to Save a New Profile**

Let’s say you made a cool prompt and want to save it:

1. Type your prompt in the NovelAI input box.
2. Open the panel (click 📝).
3. Click **"New"** → type a name like `Cute Waifu Outdoor`.
4. Click **"Save"** → done!

Now it shows up in the dropdown.

> 💡 Pro tip: You can also edit directly in the panel’s textarea before saving.

---

### 4. **Load & Apply Prompts**

To use a saved profile:

1. Pick one from the dropdown.
2. Click **"Apply"** → it goes straight into the editor.

Even better? There are **keyboard shortcuts**:

| Shortcut | What it does |
|--------|-------------|
| `Ctrl + 1` to `Ctrl + 9` | Instantly apply profile #1 to #9 |
| `Ctrl + Q` | Search profiles by number or keyword |

Try `Ctrl+Q`, then type “cyberpunk” — it’ll find any profile with that word and let you pick one.

---

### 5. **Use Variables Like a Pro: `{variable}`**

Want to reuse the same base prompt but change parts of it?

Write something like:
{character}, {outfit}, anime girl, detailed eyes, soft lighting, masterpiece


When you click **"Apply"**, a popup asks:
> _“What should {character} be?”_  
> _“What about {outfit}?”_

Fill them in → the script replaces the placeholders and sends the final prompt.

Perfect for keeping structure while changing details.

> ✅ Variables are filled **in order** — matches how they appear in your text.
>
> ❌ Empty variables (left blank) are removed cleanly, including trailing commas.

---

### 6. **Pull Tags from Danbooru by Post ID**

Found a Danbooru post you love? Want those exact tags in NovelAI?

Click **"Danbooru by ID"**, enter the number (e.g., `789532`), and it fetches the tags automatically.

Then applies them to the editor in one click.

Bonus:
- Remembers the last ID you used
- Filters out junk tags (artist:, _:score, etc.)
- Limits to 30 clean tags max (to avoid overflow)
- Works only with **danbooru.donmai.us**

If the site is down or your internet drops, it tells you clearly.

---

### 7. **Rename, Delete, Reorder**

Right in the panel:

- **Rename**: Fix typos or improve names without losing data.
- **Delete**: Remove old or unused profiles.
- **Swap Pos**: Swap two profiles’ positions so `Ctrl+3` uses your new favorite instead of an old one.

Example: Move your `"Masterpiece Default"` from #7 to #3 → now `Ctrl+3` loads it instantly.

---

### 8. **Backup & Restore (Don’t Lose Everything)**

Your profiles are stored locally — which means they could vanish if you clear cache or switch devices.

So use these:

- **"Backup All"** → downloads a `.json` file with all your prompts.
- **"Restore from JSON"** → upload that file later (or on another PC).

It’s like insurance for your creativity.

---

### 9. **Dark Mode Toggle (🌙 / ☀️)**

Click the moon/sun button in the top-right of the panel.

Switch between light and dark themes based on your preference.

Also saves your choice — so it stays dark (or light) next time.

---

### 10. **Clear All (💥 Nuclear Option)**

Clicked **"Clear All"**? Yeah, it wipes every single profile.

Useful when starting fresh… but dangerous.

Always backup first.

---

### 11. **Auto-Loads Last Used Profile**

Every time you open the panel:
- It automatically loads your **last-used profile**
- So you don’t have to hunt for it

Handy if you always use the same one.

---

### 12. **Status Messages (Top Bar)**

The top bar gives feedback like:
- Ready
- Applying...
- Success
- Error

All short, clear, and helpful.

---

## 🤔 Why This Is Better Than Copy-Paste

| With This Script | Without It |
|------------------|-----------|
| Load any prompt in 1 click | Manually copy from notes |
| Change variables on the fly | Edit entire prompt each time |
| Use `Ctrl+Q` to search | Scroll through endless tabs |
| Pull real tags from Danbooru | Guess what tags might work |
| Backup everything | Risk losing years of tweaks |

It doesn’t just save time — it makes prompt crafting **actually enjoyable**.

---

## ❤️ Real User Feedback (Fictional But Realistic)

> “I had 47 different prompt versions in Google Keep. Now I just hit Ctrl+Q and I’m done.”  
> – Someone who got their life back

> “The `{character}` thing changed how I write prompts. So flexible.”  
> – A very happy weeb artist

> “Finally, someone made this. Thank you.”  
> – Literally everyone

---

## 🛠 Future Ideas (For You, the Creator)

Since you're maintaining this, here are some ideas:
- Add support for Safebooru / Gelbooru
- Sync profiles via Google Drive (advanced)
- Let users assign hotkeys per profile
- Add per-profile settings (model, noise schedule, etc.)

But honestly? Right now, it already does **everything most people need**.

---

## 🌟 Enjoying the Script?

If this saves you hours of frustration, consider:
- Sharing it with friends
- Adding a Star ⭐ on GitHub
- Leaving a comment saying “thanks” (makes my day)

And if you ever fork it or build your own version — go wild. That’s what open source is for.

Now go make some amazing art.  
You’ve got the tools. 💫
