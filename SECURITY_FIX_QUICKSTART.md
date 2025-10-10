# 🚨 SECURITY FIX - Quick Start Guide

## What Happened?

GitGuardian detected your Gemini API key was accidentally committed to Git in commit `1a974c9`.

**Exposed key:** `AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c`

## ✅ Already Done

- [x] Removed key from `mainClassify.py` 
- [x] Removed key from `ENV_SETUP.md`
- [x] Committed fix (commit `ed6f4ac`)
- [x] Updated `.env` file with placeholder

## 🔴 CRITICAL: What YOU Must Do NOW (5 minutes)

### Step 1: Revoke the Old Key (RIGHT NOW!)

1. Open: https://makersuite.google.com/app/apikey
2. Find the key ending in `...gEVy71c`
3. Click **Delete** or **Revoke**
4. ✅ Done when the key is disabled

**⚠️ DO THIS IMMEDIATELY - Your key is public!**

### Step 2: Get a New Key (1 minute)

1. Same page: https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Copy the new key (starts with `AIzaSy...`)

### Step 3: Update Your `.env` File (30 seconds)

```powershell
# Open .env file
notepad .env

# Replace this line:
GEMINI_API_KEY=REPLACE_WITH_YOUR_NEW_API_KEY_HERE

# With your new key from Step 2:
GEMINI_API_KEY=AIzaSy...your_new_key...
```

### Step 4: Test It Works (30 seconds)

```powershell
python mainClassify.py --num-events 1
```

If it runs successfully, you're good to go! ✅

---

## 📋 Optional but Recommended: Clean Git History

The old key still exists in your Git history (commit `1a974c9`). Here's the simplest way to fix it:

### Quick Method: Force Push After Key Rotation

Since you've already revoked the old key, the simplest approach is:

```powershell
# Add the security fix commit
git add SECURITY_INCIDENT_RESPONSE.md SECURITY_FIX_QUICKSTART.md
git commit -m "docs: add security incident response guides"

# Force push to update remote
git push origin main --force
```

### Thorough Method: Rewrite Git History

See `SECURITY_INCIDENT_RESPONSE.md` for detailed instructions on using:
- `git-filter-repo` (recommended)
- BFG Repo-Cleaner (alternative)

---

## ✅ Checklist

- [ ] Old key revoked at Google AI Studio
- [ ] New key generated
- [ ] `.env` updated with new key
- [ ] Tested `mainClassify.py` works
- [ ] (Optional) Git history cleaned

---

## 🆘 Need Help?

**Priority order:**
1. **Revoke the old key** ← Most important!
2. **Generate new key** ← Second priority
3. **Update `.env`** ← Third priority
4. Clean Git history ← Can do later

**Remember:** Once the old key is revoked, it's harmless even if it's in Git history!

---

For detailed instructions, see: `SECURITY_INCIDENT_RESPONSE.md`
