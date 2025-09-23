// ==UserScript==
// @name         NovelAI Prompt Profiles
// @namespace    http://tampermonkey.net/
// @updateURL    https://raw.githubusercontent.com/mikojiy/NAI-Profile-Manager/main/NAIPM.user.js
// @downloadURL  https://raw.githubusercontent.com/mikojiy/NAI-Profile-Manager/main/NAIPM.user.js
// @version      1.1
// @description  Prompt profiles made easy for NovelAI
// @match        https://novelai.net/image
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = "nai_prompt_profiles_v2";
    const LAST_PROFILE_KEY = "nai_last_profile";
    const ICON_POS_KEY = "nai_icon_position";
    const DARK_MODE_KEY = "nai_dark_mode";

    let profiles = [];
    let lastProfileName = localStorage.getItem(LAST_PROFILE_KEY);

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                profiles = parsed;
            }
        }
    } catch (e) {
        console.error("Failed to load profiles:", e);
    }

    function saveProfilesToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        } catch (e) {
            console.error("Failed to save profiles:", e);
        }
    }

    function updateSelectOptions(select, selectedName = null) {
        select.innerHTML = "";
        if (profiles.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "No profiles yet";
            opt.disabled = true;
            select.appendChild(opt);
            return;
        }
        profiles.forEach((p, i) => {
            const opt = document.createElement("option");
            opt.value = p.name;
            opt.textContent = `${i + 1}. ${p.name}`;
            select.appendChild(opt);
        });
        if (selectedName && profiles.some(p => p.name === selectedName)) {
            select.value = selectedName;
        } else if (profiles.length > 0) {
            select.selectedIndex = 0;
        }
    }

    function setLastProfile(name) {
        lastProfileName = name;
        localStorage.setItem(LAST_PROFILE_KEY, name);
    }

    function findSiteEditor() {
        return document.querySelector('.image-gen-prompt-main .ProseMirror') ||
               document.querySelector('.prompt-input-box-prompt .ProseMirror');
    }

    function findPMView(node, maxDepth = 6) {
        let el = node;
        let depth = 0;
        while (el && depth < maxDepth) {
            try {
                const maybeKeys = Object.keys(el);
                for (const k of maybeKeys) {
                    try {
                        const v = el[k];
                        if (v && typeof v === 'object' && v.state && typeof v.dispatch === 'function') {
                            return v;
                        }
                    } catch (e) {}
                }
                if (el.pmView) return el.pmView;
                if (el.__pmView) return el.__pmView;
                if (el._pmView) return el._pmView;
                if (el.__view) return el.__view;
                if (el._view) return el._view;
            } catch (e) {}
            el = el.parentNode;
            depth++;
        }
        return null;
    }

    async function applyTextToEditor(text, statusEl) {
        if (!text) {
            statusEl.textContent = "⚠️ Nothing to paste here.";
            return false;
        }

        statusEl.textContent = "🔍 Looking for editor...";
        const editor = findSiteEditor();
        if (!editor) {
            statusEl.textContent = "❌ Can't find the editor.";
            return false;
        }

        const view = findPMView(editor);
        if (view) {
            try {
                const tr = view.state.tr;
                tr.delete(0, view.state.doc.content.size);
                tr.insertText(text);
                view.dispatch(tr);
                statusEl.textContent = "✅ Done (ProseMirror)";
                return true;
            } catch (e) {
                console.error("PM view dispatch error:", e);
                statusEl.textContent = "⚠️ That didn’t work, trying another way...";
            }
        }

        try {
            editor.focus();
            const range = document.createRange();
            range.selectNodeContents(editor);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            const okIns = document.execCommand('insertText', false, text);
            editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));

            if (okIns) {
                statusEl.textContent = "✅ Pasted!";
                return true;
            }
        } catch (e) {
            console.error("execCommand error:", e);
            statusEl.textContent = "⚠️ Still having trouble... trying clipboard trick...";
        }

        try {
            await navigator.clipboard.writeText(text);
            statusEl.textContent = "📋 Copied! Just hit Ctrl+V to paste it yourself.";
            return false;
        } catch (e) {
            console.error("Clipboard error:", e);
            statusEl.textContent = "❌ Couldn’t copy to clipboard.";
            return false;
        }
    }

    // Main panel
    let panel = null;

    function createPanelOnce() {
        if (document.getElementById('nai-profiles-panel')) return;

        const container = document.querySelector('.image-gen-prompt-main') ||
                         document.querySelector('.prompt-input-box-prompt');

        if (!container) {
            setTimeout(createPanelOnce, 500);
            return;
        }

        // Load icon position
        let savedPos = { x: 10, y: 10 };
        try {
            const posStr = localStorage.getItem(ICON_POS_KEY);
            if (posStr) savedPos = JSON.parse(posStr);
        } catch (e) { console.warn("Failed to read icon position"); }

        // Draggable icon
        const toggle = document.createElement('div');
        toggle.id = "nai-profiles-toggle";
        Object.assign(toggle.style, {
            position: "fixed",
            top: "0", left: "0",
            zIndex: "10000",
            cursor: "move",
            fontSize: "20px",
            padding: "8px",
            backgroundColor: "#f8fafc",
            color: "#1e40af",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            userSelect: "none",
            transform: `translate(${savedPos.x}px, ${savedPos.y}px)`,
            transition: "opacity 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px"
        });

        toggle.title = "Drag to move | Click to open";
        toggle.innerHTML = "📝";

        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        toggle.addEventListener("mousedown", (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offsetX = e.clientX - savedPos.x;
            offsetY = e.clientY - savedPos.y;
            toggle.style.opacity = "0.85";
            toggle.style.cursor = "grabbing";
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            savedPos = { x, y };
            toggle.style.transform = `translate(${x}px, ${y}px)`;
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            toggle.style.opacity = "1";
            toggle.style.cursor = "move";
            try {
                localStorage.setItem(ICON_POS_KEY, JSON.stringify(savedPos));
            } catch (e) { console.warn("Failed to save icon position"); }
        });

        document.body.appendChild(toggle);

        // Create panel
        panel = document.createElement('div');
        panel.id = "nai-profiles-panel";
        Object.assign(panel.style, {
            position: "fixed",
            zIndex: "9999",
            width: "360px",
            background: "#ffffff",
            color: "#111827",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            display: "none",
            overflow: "hidden",
            boxSizing: "border-box"
        });

        // Status bar
        const status = document.createElement('div');
        Object.assign(status.style, {
            padding: "10px",
            fontSize: "12.5px",
            color: "#64748b",
            textAlign: "center",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            fontWeight: "500"
        });
        status.textContent = "Ready to go 🎯";

        // Header
        const hdr = document.createElement('div');
        Object.assign(hdr.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            fontWeight: "600",
            color: "#1e40af",
            fontSize: "16px"
        });
        hdr.textContent = "Prompt Profiles";

        // Dark mode toggle
        const btnDarkMode = document.createElement('button');
        btnDarkMode.textContent = "🌙";
        btnDarkMode.title = "Toggle Dark Mode";
        Object.assign(btnDarkMode.style, {
            background: "transparent",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "18px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "8px"
        });

        // Close button
        const btnClose = document.createElement('button');
        btnClose.innerHTML = "&times;";
        Object.assign(btnClose.style, {
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "20px",
            lineHeight: "1",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        });
        btnClose.onmouseover = () => btnClose.style.color = "#f43f5e";
        btnClose.onmouseout = () => btnClose.style.color = "#94a3b8";
        btnClose.onclick = () => panel.style.display = "none";

        hdr.appendChild(btnDarkMode);
        hdr.appendChild(btnClose);

        const inner = document.createElement('div');
        inner.style.padding = "16px";
        inner.style.boxSizing = "border-box";

        // Dropdown select
        const select = document.createElement('select');
        Object.assign(select.style, {
            width: "100%",
            height: "50px",
            marginBottom: "12px",
            padding: "0 12px",
            background: "#f8fafc",
            color: "#1e293b",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none"
        });
        select.onfocus = () => select.style.borderColor = "#3b82f6";
        select.onblur = () => select.style.borderColor = "#cbd5e1";
        updateSelectOptions(select, lastProfileName);
        inner.appendChild(select);

        // Textarea
        const ta = document.createElement('textarea');
        Object.assign(ta.style, {
            width: "100%",
            height: "120px",
            marginBottom: "12px",
            padding: "12px",
            background: "#f8fafc",
            color: "#1e293b",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            resize: "vertical",
            fontSize: "13.5px",
            outline: "none",
            fontFamily: "inherit",
            overflowY: "auto"
        });
        ta.placeholder = "Write or paste your favorite prompt here...";
        inner.appendChild(ta);

        // Button grid
        const grid = document.createElement('div');
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "1fr 1fr";
        grid.style.gap = "10px";
        grid.style.marginBottom = "12px";

        function mkBtn(label, cb, bg = "#3b82f6", color = "#fff") {
            const b = document.createElement('button');
            b.textContent = label;
            Object.assign(b.style, {
                padding: "8px",
                border: "none",
                borderRadius: "8px",
                background: bg,
                color: color,
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
            });
            b.onmouseover = () => b.style.transform = "translateY(-2px)";
            b.onmouseout = () => b.style.transform = "translateY(0)";
            b.onclick = cb;
            return b;
        }

        // --- 🔧 TEMPORARY VARIABLES + {DB} SUPPORT (IN ORIGINAL ORDER) ---
        function fillVariablesTemporarily(content, callback) {
            const regex = /{([^{}]+)}/g;
            const hasDB = content.includes('{DB}');
            const matches = [];
            let match;
            const seen = new Set();

            regex.lastIndex = 0;
            while ((match = regex.exec(content)) !== null) {
                const key = match[1];
                if (!seen.has(key) && key !== "DB") {
                    seen.add(key);
                    matches.push(key);
                }
            }

            if (matches.length === 0 && !hasDB) {
                callback(content);
                return;
            }

            const dialog = document.createElement('div');
            Object.assign(dialog.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '360px',
                background: getComputedStyle(panel).backgroundColor,
                color: getComputedStyle(panel).color,
                border: getComputedStyle(panel).border,
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                zIndex: '20000',
                padding: '16px',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box'
            });

            let inputsHTML = `<div style="font-size:14px; margin-bottom:12px; font-weight:500;">Fill in values for variables:</div>`;

            matches.forEach(key => {
                inputsHTML += `
                    <div style="margin-bottom:10px;">
                        <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">${key}</label>
                        <textarea data-key="${key}"
                                  style="width:100%; min-height:40px; padding:8px; border-radius:6px; border:1px solid ${getComputedStyle(panel).borderColor};
                                         background:${panel.style.background === 'rgb(30, 41, 59)' ? '#334155' : '#f8fafc'};
                                         color:${panel.style.color};
                                         font-size:13px;
                                         resize:vertical;"></textarea>
                    </div>`;
            });

            if (hasDB) {
                inputsHTML += `
                    <div style="margin-bottom:10px;">
                        <label style="display:block; font-size:13px; margin-bottom:4px; opacity:0.9;">DB (Danbooru ID)</label>
                        <input type="text" placeholder="789532"
                               data-key="DB_ID"
                               style="width:100%; padding:8px; border-radius:6px; border:1px solid ${getComputedStyle(panel).borderColor};
                                      background:${panel.style.background === 'rgb(30, 41, 59)' ? '#334155' : '#f8fafc'};
                                      color:${panel.style.color};
                                      font-size:13px;" />
                        <div style="font-size:11px; color:#94a3b8; margin-top:4px;">
                            Enter a post ID from Danbooru
                        </div>
                    </div>`;
            }

            dialog.innerHTML = `
                <div style="font-weight:bold; font-size:15px; margin-bottom:16px;">Fill Variables</div>
                <div id="inputs">${inputsHTML}</div>
                <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px;">
                    <button id="cancel" style="padding:6px 12px; background:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer;">Cancel</button>
                    <button id="apply" style="padding:6px 12px; background:#0ea5e9; color:white; border:none; border-radius:6px; cursor:pointer;">Apply</button>
                </div>
            `;
            document.body.appendChild(dialog);

            const applyBtn = dialog.querySelector('#apply');
            const cancelBtn = dialog.querySelector('#cancel');

            applyBtn.onclick = async () => {
                let filled = content;

                const normalInputs = dialog.querySelectorAll('textarea[data-key]');
                normalInputs.forEach(input => {
                    const key = input.dataset.key;
                    const value = input.value.trim();
                    if (value) {
                        filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
                    } else {
                        filled = filled.replace(new RegExp(`\\{${key}\\}\\s*,?\\s*`, 'g'), '');
                    }
                });

                const dbInput = dialog.querySelector('input[data-key="DB_ID"]');
                if (dbInput && filled.includes('{DB}')) {
                    const id = dbInput.value.trim();
                    if (id && /^\d+$/.test(id)) {
                        try {
                            const res = await fetch(`https://danbooru.donmai.us/posts/${id}.json`, {
                                headers: { "User-Agent": "NovelAI-Prompt-Profiles/3.55" }
                            });
                            if (!res.ok) throw new Error("HTTP " + res.status);
                            const data = await res.json();
                            const tags = [
                                data.tag_string_character || "",
                                data.tag_string_copyright || "",
                                data.tag_string_general || ""
                            ].join(" ").split(" ")
                              .filter(t => t && !t.includes("_:") && !t.startsWith("artist:") && t.length > 1);

                            const tagString = [...new Set(tags)]
                                .map(t => t.replace(/_/g, ' ').trim())
                                .filter(t => t)
                                .slice(0, 30)
                                .join(", ");

                            filled = filled.replace(/\{DB\}/g, tagString);
                        } catch (err) {
                            filled = filled.replace(/\{DB\}\s*,?\s*/g, '');
                        }
                    } else {
                        filled = filled.replace(/\{DB\}\s*,?\s*/g, '');
                    }
                }

                document.body.removeChild(dialog);
                callback(filled);
            };

            cancelBtn.onclick = () => {
                document.body.removeChild(dialog);
                callback(null);
            };
        }

        // Buttons
        const btnNew = mkBtn("🆕 New", () => {
            const input = prompt("Name your new profile:");
            if (!input || !input.trim()) return;
            const name = input.trim();
            if (profiles.some(p => p.name === name)) {
                status.textContent = `❌ "${name}" already exists.`;
                return;
            }
            profiles.push({ name, content: "" });
            saveProfilesToStorage();
            updateSelectOptions(select, name);
            select.value = name;
            select.dispatchEvent(new Event('change'));
            setLastProfile(name);
            status.textContent = `✅ Created "${name}".`;
        }, "#10b981");

        const btnSave = mkBtn("💾 Save", () => {
            const name = select.value;
            if (!name || !profiles.some(p => p.name === name)) {
                status.textContent = "❌ Pick a profile first.";
                return;
            }
            const idx = profiles.findIndex(p => p.name === name);
            profiles[idx].content = ta.value;
            saveProfilesToStorage();
            syncTextarea();
            status.textContent = `✔️ "${name}" saved.`;
        });

        const btnRename = mkBtn("✏️ Rename", () => {
            const oldName = select.value;
            if (!oldName) return;
            const newName = prompt("New name:", oldName);
            if (!newName || !newName.trim()) return;
            const trimmed = newName.trim();
            if (profiles.some(p => p.name === trimmed)) {
                status.textContent = `❌ "${trimmed}" already taken.`;
                return;
            }
            const idx = profiles.findIndex(p => p.name === oldName);
            profiles[idx].name = trimmed;
            if (lastProfileName === oldName) setLastProfile(trimmed);
            saveProfilesToStorage();
            updateSelectOptions(select, trimmed);
            select.value = trimmed;
            syncTextarea();
            status.textContent = `🔄 Renamed "${oldName}" → "${trimmed}"`;
        });

        const btnDelete = mkBtn("🗑️ Delete", () => {
            const name = select.value;
            if (!name) return;
            if (confirm(`Delete "${name}"?`)) {
                profiles = profiles.filter(p => p.name !== name);
                saveProfilesToStorage();
                updateSelectOptions(select);
                ta.value = "";
                if (profiles.length > 0) {
                    const newSelectedName = profiles[0].name;
                    select.value = newSelectedName;
                    select.dispatchEvent(new Event('change'));
                    setLastProfile(newSelectedName);
                    status.textContent = `🗑️ Deleted "${name}". Switched to "${newSelectedName}".`;
                } else {
                    syncTextarea();
                    if (lastProfileName === name) {
                        localStorage.removeItem(LAST_PROFILE_KEY);
                        lastProfileName = null;
                    }
                    status.textContent = `🗑️ Deleted "${name}". No profiles left.`;
                }
            }
        }, "#ef4444");

        const btnApply = mkBtn("➡️ Apply", async () => {
            const name = select.value;
            if (!name) return;
            const idx = profiles.findIndex(p => p.name === name);
            if (idx === -1) return;
            const content = profiles[idx].content;
            fillVariablesTemporarily(content, (finalPrompt) => {
                if (finalPrompt === null) return;
                ta.value = content;
                syncTextarea();
                setLastProfile(name);
                status.textContent = "🔧 Applying...";
                applyTextToEditor(finalPrompt, status).catch(console.error);
            });
        }, "#0ea5e9");

        const btnClearAll = mkBtn("💥 Clear All", () => {
            if (confirm("⚠️ Delete ALL profiles? This can't be undone.")) {
                profiles = [];
                saveProfilesToStorage();
                updateSelectOptions(select);
                ta.value = "";
                syncTextarea();
                localStorage.removeItem(LAST_PROFILE_KEY);
                lastProfileName = null;
                status.textContent = "🧹 Cleared everything.";
            }
        }, "#dc2626", "#fff");

        const btnReorder = mkBtn("🔁 Swap Pos", () => {
            const currentName = select.value;
            if (!currentName) {
                status.textContent = "❌ Pick a profile first.";
                return;
            }
            const currentIndex = profiles.findIndex(p => p.name === currentName);
            if (currentIndex === -1) return;

            const targetPosInput = prompt(
                `Swap "${currentName}" with which number?
` +
                `Enter 1-${profiles.length}
` +
                `(Currently at ${currentIndex + 1})`
            );

            const targetIndex = parseInt(targetPosInput) - 1;
            if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= profiles.length) {
                status.textContent = "❌ Invalid position.";
                return;
            }
            if (targetIndex === currentIndex) {
                status.textContent = "ℹ️ Already there.";
                return;
            }

            [profiles[currentIndex], profiles[targetIndex]] = [profiles[targetIndex], profiles[currentIndex]];
            saveProfilesToStorage();
            updateSelectOptions(select, currentName);
            select.value = currentName;
            select.dispatchEvent(new Event('change'));
            status.textContent = `✅ Swapped "${currentName}" with profile #${targetIndex + 1}.`;
        }, "#a855f7", "#fff");

        // --- 🔍 DANBOORU BY ID (WORKS PERFECTLY) ---
        const LAST_ID_KEY = "nai_last_danbooru_id";
        let lastId = localStorage.getItem(LAST_ID_KEY) || "";

        const btnBooruById = mkBtn("🔍 Danbooru by ID", () => {
            const idInput = prompt(
                `📌 Pull prompt from Danbooru
` +
                `Enter post ID (like: 789532)
` +
                `Last used: ${lastId || 'None'}`
            );
            if (!idInput) return;
            const id = idInput.trim();
            if (!/^\d+$/.test(id)) {
                status.textContent = "❌ ID must be numbers only.";
                return;
            }

            status.textContent = `📥 Fetching Danbooru #${id}...`;

            fetch(`https://danbooru.donmai.us/posts/${id}.json`, {
                headers: { "User-Agent": "NovelAI-Prompt-Profiles/3.55" }
            })
            .then(res => {
                if (res.status === 404) throw new Error("Post not found");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!data.tag_string_general) {
                    throw new Error("Tag data missing");
                }

                const tags = [
                    data.tag_string_character || "",
                    data.tag_string_copyright || "",
                    data.tag_string_general || ""
                ]
                .join(" ")
                .split(" ")
                .filter(tag => tag && tag.length > 1 && !tag.includes("_:") && !tag.startsWith("artist:"));

                const cleanTags = [...new Set(tags)]
                    .map(t => t.replace(/_/g, ' ').trim())
                    .filter(t => t)
                    .slice(0, 30)
                    .join(", ");

                if (!cleanTags) {
                    throw new Error("No usable tags found");
                }

                localStorage.setItem(LAST_ID_KEY, id);
                status.textContent = `🔧 Applying prompt from Danbooru #${id}...`;
                applyTextToEditor(cleanTags, status).catch(err => {
                    console.error("Apply error:", err);
                    status.textContent = "❌ Failed to send to editor.";
                });
            })
            .catch(err => {
                console.error("Danbooru fetch error:", err);
                const message = err.message.includes("network")
                    ? "Check connection or site down"
                    : err.message;
                status.textContent = `❌ Danbooru: ${message}`;
            });
        });

        // Add buttons to grid
        [btnNew, btnSave, btnRename, btnDelete, btnApply, btnClearAll, btnReorder, btnBooruById].forEach(b => grid.appendChild(b));
        inner.appendChild(grid);

        // Backup & Restore
        const bottomButtons = document.createElement('div');
        bottomButtons.style.display = "flex";
        bottomButtons.style.flexDirection = "column";
        bottomButtons.style.gap = "10px";

        const btnBackup = mkBtn("📦 Backup All", () => {
            const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nai-profiles-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            status.textContent = "📥 Backup downloaded.";
        }, "#8b5cf6", "#fff");

        const btnRestore = mkBtn("🔁 Restore from JSON", () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (Array.isArray(data)) {
                            profiles = data;
                            saveProfilesToStorage();
                            updateSelectOptions(select);
                            ta.value = "";
                            if (profiles.length > 0) {
                                select.value = profiles[0].name;
                                select.dispatchEvent(new Event('change'));
                                status.textContent = `🔄 Restored ${data.length} profiles. Loaded first one.`;
                            } else {
                                syncTextarea();
                                status.textContent = `🔄 Empty data: 0 profiles.`;
                            }
                        } else {
                            status.textContent = "❌ Invalid file format.";
                        }
                    } catch (err) {
                        status.textContent = "❌ Failed to read file.";
                        console.error(err);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }, "#06b6d4", "#fff");

        [btnBackup, btnRestore].forEach(btn => {
            btn.style.width = "100%";
        });

        bottomButtons.appendChild(btnBackup);
        bottomButtons.appendChild(btnRestore);
        inner.appendChild(bottomButtons);

        panel.appendChild(status);
        panel.appendChild(hdr);
        panel.appendChild(inner);
        document.body.appendChild(panel);

        // --- Dark Mode Styling ---
        function applyDarkMode(isDark) {
            if (isDark) {
                Object.assign(panel.style, {
                    background: "#1e293b",
                    color: "#e2e8f0",
                    borderColor: "#334155"
                });
                const inputs = panel.querySelectorAll('select, textarea, button');
                inputs.forEach(el => {
                    if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                        Object.assign(el.style, {
                            background: "#334155",
                            color: "#e2e8f0",
                            borderColor: "#475569"
                        });
                    }
                });
                status.style.background = "#0f172a";
                status.style.borderBottomColor = "#334155";
                hdr.style.color = "#93c5fd";
            } else {
                Object.assign(panel.style, {
                    background: "#ffffff",
                    color: "#111827",
                    border: "1px solid #e2e8f0"
                });
                const inputs = panel.querySelectorAll('select, textarea, button');
                inputs.forEach(el => {
                    if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                        Object.assign(el.style, {
                            background: "#f8fafc",
                            color: "#1e293b",
                            borderColor: "#cbd5e1"
                        });
                    }
                });
                status.style.background = "#f8fafc";
                status.style.borderBottomColor = "#e2e8f0";
                hdr.style.color = "#1e40af";
            }
        }

        // Check dark mode preference
        let isDarkMode = false;
        try {
            isDarkMode = localStorage.getItem(DARK_MODE_KEY) === '1';
        } catch (e) {}

        if (isDarkMode) {
            panel.classList.add('dark-mode');
            btnDarkMode.textContent = "☀️";
            btnDarkMode.title = "Switch to Light Mode";
        }
        applyDarkMode(isDarkMode);

        // Toggle dark mode
        btnDarkMode.onclick = (e) => {
            e.stopPropagation();
            const isNowDark = !panel.classList.contains('dark-mode');
            panel.classList.toggle('dark-mode', isNowDark);
            btnDarkMode.textContent = isNowDark ? "☀️" : "🌙";
            btnDarkMode.title = isNowDark ? "Switch to Light Mode" : "Switch to Dark Mode";
            applyDarkMode(isNowDark);
            try {
                localStorage.setItem(DARK_MODE_KEY, isNowDark ? '1' : '0');
            } catch (e) {
                console.warn("Failed to save dark mode preference");
            }
        };

        // Sync textarea changes
        function syncTextarea() {
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Update textarea when switching profiles
        select.addEventListener('change', () => {
            const name = select.value;
            const profile = profiles.find(p => p.name === name);
            ta.value = profile ? profile.content : "";
            syncTextarea();
            if (name) setLastProfile(name);
            status.textContent = name ? `📄 Loaded: ${name}` : "No profile selected.";
        });

        // Toggle panel visibility
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = toggle.getBoundingClientRect();
            panel.style.top = `${rect.bottom + window.scrollY + 6}px`;
            panel.style.left = `${rect.left + window.scrollX}px`;
            if (panel.style.display === "none" && lastProfileName) {
                const profile = profiles.find(p => p.name === lastProfileName);
                if (profile) {
                    select.value = lastProfileName;
                    ta.value = profile.content;
                    syncTextarea();
                }
            }
            panel.style.display = panel.style.display === "none" ? "block" : "none";
        });

        // Ctrl+1 to Ctrl+9 shortcuts
        document.addEventListener('keydown', (e) => {
            if (!e.ctrlKey || e.altKey || e.shiftKey) return;
            const key = e.key;
            if (!/^[1-9]$/.test(key)) return;
            e.preventDefault();
            const idx = parseInt(key) - 1;
            if (idx >= profiles.length || idx < 0) {
                status.textContent = `⚠️ Profile ${key} doesn’t exist.`;
                return;
            }
            const { name, content } = profiles[idx];
            select.value = name;
            select.dispatchEvent(new Event('change'));
            ta.value = content;
            syncTextarea();
            setLastProfile(name);
            status.textContent = `⚡ Ctrl+${key}: "${name}" active.`;
            applyTextToEditor(content, status).catch(console.error);
        });

        // ================================
        // 🔍 Ctrl + Q: Quick Apply Profile
        // ================================
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && !e.shiftKey && !e.altKey && ['q', 'Q'].includes(e.key)) {
                e.preventDefault();
                const input = prompt(
                    `Profile (${profiles.length} total)
` +
                    ` • Number 1-${profiles.length}
` +
                    ` • Keyword search`
                );
                if (!input || !input.trim()) return;
                const query = input.trim();
                const num = parseInt(query);
                if (!isNaN(num) && num >= 1 && num <= profiles.length) {
                    const profile = profiles[num - 1];
                    fillVariablesTemporarily(profile.content, (finalPrompt) => {
                        if (finalPrompt === null) return;
                        select.value = profile.name;
                        select.dispatchEvent(new Event('change'));
                        ta.value = finalPrompt;
                        syncTextarea();
                        setLastProfile(profile.name);
                        status.textContent = `⚡ Applying profile ${num}: "${profile.name}"...`;
                        applyTextToEditor(finalPrompt, status).catch(console.error);
                    });
                } else {
                    const keyword = query.toLowerCase();
                    const matches = profiles.filter(p => p.name.toLowerCase().includes(keyword));
                    if (matches.length === 0) {
                        alert(`❌ No profile contains "${keyword}"`);
                        return;
                    }
                    if (matches.length === 1) {
                        const { name, content } = matches[0];
                        fillVariablesTemporarily(content, (finalPrompt) => {
                            if (finalPrompt === null) return;
                            select.value = name;
                            select.dispatchEvent(new Event('change'));
                            ta.value = finalPrompt;
                            syncTextarea();
                            setLastProfile(name);
                            status.textContent = `🔍 Found: "${name}". Applying...`;
                            applyTextToEditor(finalPrompt, status).catch(console.error);
                        });
                    } else {
                        const list = matches.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                        const choiceIndex = parseInt(prompt(
                            `🔎 Found ${matches.length} matches:
${list}
Pick number (1-${matches.length}):`
                        )) - 1;
                        if (choiceIndex >= 0 && choiceIndex < matches.length) {
                            const { name, content } = matches[choiceIndex];
                            fillVariablesTemporarily(content, (finalPrompt) => {
                                if (finalPrompt === null) return;
                                select.value = name;
                                select.dispatchEvent(new Event('change'));
                                ta.value = finalPrompt;
                                syncTextarea();
                                setLastProfile(name);
                                status.textContent = `🎯 Applying: "${name}"...`;
                                applyTextToEditor(finalPrompt, status).catch(console.error);
                            });
                        }
                    }
                }
            }

// ================================
// 🔔 AUTO UPDATE NOTIFICATION
// ================================
(function checkUpdate() {
    const currentVersion = '1.1'; // Keep this matching your @version
    const scriptURL = 'https://raw.githubusercontent.com/mikojiy/NAI-Profile-Manager/main/NAIPM.user.js';

    setTimeout(async () => {
        try {
            const res = await fetch(scriptURL + '?t=' + Date.now());
            const text = await res.text();
            const match = text.match(/@version\s+([0-9.]+)/);
            if (!match) return;

            const latestVersion = match[1];
            if (compareVersions(latestVersion, currentVersion) > 0) {
                if (!document.getElementById('nai-update-notice')) {
                    const notice = document.createElement('div');
                    notice.id = 'nai-update-notice';
                    Object.assign(notice.style, {
                        position: 'fixed',
                        top: '30px',
                        right: '30px',
                        zIndex: '99999',
                        background: '#1e40af',
                        color: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        maxWidth: '380px',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.5'
                    });

                    notice.innerHTML = `
                        <b>🎉 Update Available!</b><br>
                        Version ${latestVersion} is ready.<br>
                        You're still on v${currentVersion}.<br>
                        <button id="update-now" style="
                            margin-top: 10px;
                            padding: 8px 14px;
                            background: white;
                            color: #1e40af;
                            border: none;
                            borderRadius: 8px;
                            fontWeight: bold;
                            cursor: pointer;
                        ">Update Now</button>
                    `;
                    document.body.appendChild(notice);

                    document.getElementById('update-now').onclick = () => {
                        window.open(scriptURL, '_blank');
                        notice.remove();
                    };
                }
            }
        } catch (e) {
            console.warn('Failed to check for updates:', e);
        }
    }, 3000); // Check 3 seconds after page loads
})();

function compareVersions(v1, v2) {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const num1 = a[i] || 0;
        const num2 = b[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}
            
        });
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanelOnce);
    } else {
        createPanelOnce();
    }
})();
