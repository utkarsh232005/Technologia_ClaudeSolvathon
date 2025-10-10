# 🚨 Security Incident Response - API Key Exposure

## Incident Summary

**Date:** October 10, 2025  
**Severity:** HIGH  
**Issue:** Gemini API key was hardcoded in commit `1a974c9` in the following locations:
- `mainClassify.py` (line 86, commented code)
- `ENV_SETUP.md` (line 12, documentation example)

**Status:** ✅ Files cleaned in commit `ed6f4ac`, but key still exists in Git history

---

## ✅ COMPLETED STEPS

### 1. Remove API Key from Current Files ✓
- [x] Removed hardcoded key from `mainClassify.py`
- [x] Replaced real key with placeholder in `ENV_SETUP.md`
- [x] Committed fix: `ed6f4ac`
- [x] Verified `.env` is in `.gitignore`

---

## ⚠️ CRITICAL: STEPS YOU MUST COMPLETE IMMEDIATELY

### Step 1: Revoke the Compromised API Key

**The exposed key:** `AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c`

1. Go to Google AI Studio: https://makersuite.google.com/app/apikey
2. Find the compromised key
3. Click **Delete** or **Revoke** to disable it
4. **Do this NOW** - the key is public in your Git history!

### Step 2: Generate a New API Key

1. In Google AI Studio: https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Copy the new key (it will look like `AIzaSy...`)
4. Save it securely

### Step 3: Update Your Local `.env` File

Open your `.env` file and replace the old key:

```powershell
notepad .env
```

Replace the old key with your new one:
```env
# OLD (COMPROMISED - DO NOT USE):
# GEMINI_API_KEY=AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c

# NEW (from Step 2):
GEMINI_API_KEY=your_new_api_key_here
```

### Step 4: Remove API Key from Git History

The old key still exists in commit `1a974c9`. You have two options:

#### Option A: Use git-filter-repo (Recommended, Safer)

1. **Install git-filter-repo:**
   ```powershell
   pip install git-filter-repo
   ```

2. **Create a backup first:**
   ```powershell
   cd D:\
   cp -r Technologia_ClaudeSolvathon Technologia_ClaudeSolvathon_backup
   cd Technologia_ClaudeSolvathon
   ```

3. **Remove the API key from all commits:**
   ```powershell
   git-filter-repo --invert-paths --path-regex 'AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c'
   ```

   Or use a more targeted approach with replace-text:
   ```powershell
   # Create a replacement file
   echo "AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c==>REMOVED_API_KEY" > replacements.txt
   git-filter-repo --replace-text replacements.txt
   ```

4. **Force push to remote:**
   ```powershell
   git push origin main --force
   ```

#### Option B: Use BFG Repo-Cleaner (Alternative)

1. **Download BFG:**
   - Download from: https://rtyley.github.io/bfg-repo-cleaner/
   - Save `bfg.jar` to your Desktop

2. **Create a backup:**
   ```powershell
   cd D:\
   cp -r Technologia_ClaudeSolvathon Technologia_ClaudeSolvathon_backup
   ```

3. **Run BFG to replace the API key:**
   ```powershell
   # Create a replacements file
   echo "AIzaSyDrp9uzRara99-VFDqXhKJ59qX4gEVy71c==>REMOVED_API_KEY" > replacements.txt
   
   # Run BFG (adjust path to where you saved bfg.jar)
   java -jar "$HOME\Desktop\bfg.jar" --replace-text replacements.txt Technologia_ClaudeSolvathon
   ```

4. **Clean up and force push:**
   ```powershell
   cd Technologia_ClaudeSolvathon
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin main --force
   ```

#### Option C: Nuclear Option - Delete and Recreate Repository

If the above seems too complex:

1. **Create a new GitHub repository**
2. **Clone your cleaned local version** (which already has the fix)
3. **Push to the new repository:**
   ```powershell
   git remote set-url origin https://github.com/Rishiraj-Pathak-27/NEW_REPO_NAME.git
   git push -u origin main
   ```
4. **Delete the old compromised repository**
5. **Update your README with the new repository URL**

### Step 5: Verify the Fix

After force-pushing, verify the key is gone:

```powershell
# Search all commits for the old key
git log -p --all -S "AIzaSyDrp9uzRara99" --source --all

# Should return: no results
```

### Step 6: Test with New API Key

```powershell
# Verify your new key works
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('API Key loaded!' if os.getenv('GEMINI_API_KEY') else 'ERROR: No key found')"

# Run a test classification
python mainClassify.py --num-events 1
```

---

## 📋 POST-INCIDENT CHECKLIST

- [ ] Old API key revoked in Google AI Studio
- [ ] New API key generated
- [ ] `.env` file updated with new key
- [ ] Git history cleaned (force pushed)
- [ ] Verified old key no longer in repository
- [ ] Tested new key works with mainClassify.py
- [ ] Team members notified (if applicable)
- [ ] Reviewed commit process to prevent future incidents

---

## 🛡️ PREVENTION: Future Best Practices

### Before Every Commit:

1. **Check for secrets:**
   ```powershell
   git diff --cached | Select-String -Pattern "AIza", "sk-", "ghp_", "aws_"
   ```

2. **Use pre-commit hooks:**
   Install `git-secrets` or `detect-secrets`:
   ```powershell
   pip install detect-secrets
   detect-secrets scan
   ```

3. **Never use real secrets in documentation:**
   - ✅ Use: `GEMINI_API_KEY=your_api_key_here`
   - ❌ Avoid: `GEMINI_API_KEY=AIzaSy...actual_key...`

### Recommended Tools:

- **GitGuardian** (already detected this!) - https://www.gitguardian.com/
- **detect-secrets** - Pre-commit hook to prevent commits with secrets
- **git-secrets** - AWS tool to prevent committing secrets
- **gitleaks** - Scan repos for secrets

---

## 📞 Need Help?

If you're unsure about any step:

1. **Don't push any more commits** until the key is revoked
2. Revoke the old key immediately (Step 1)
3. Ask for help with Git history rewriting if needed
4. Remember: **The priority is revoking the old key**, cleaning Git history is secondary

---

## References

- Google AI Studio: https://makersuite.google.com/app/apikey
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- git-filter-repo: https://github.com/newren/git-filter-repo
- GitGuardian Docs: https://docs.gitguardian.com/
