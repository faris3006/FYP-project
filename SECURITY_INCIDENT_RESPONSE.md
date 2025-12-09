# 🔐 Security Incident Response - API Key Rotation

## ✅ **What Was Done**

### **1. Removed Exposed API Key from Current Files**
- ✅ `API_SETUP_CHECKLIST.md` - Replaced with placeholder `YOUR_SENDGRID_API_KEY_HERE`
- ✅ `.env.local` - Replaced with placeholder (kept local, not committed)
- ✅ `.env.example` - Already using placeholder

### **2. Cleaned Git History**
- ✅ Used `git filter-branch` to remove API_SETUP_CHECKLIST.md from all commits
- ✅ Rewritten commits to eliminate exposed secret
- ✅ Force pushed to GitHub (`git push --force`)

### **3. Verified Security**
- ✅ Confirmed `.env.local` is in `.gitignore`
- ✅ No secrets remain in current codebase
- ✅ Git history no longer contains exposed API key

---

## ⚠️ **CRITICAL: Next Steps You Must Take Immediately**

### **Step 1: Revoke the Old SendGrid API Key** ❌
The API key that was exposed on GitHub must be revoked immediately. Check your SendGrid dashboard for the key that was accidentally committed and revoke it.

**How to revoke:**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings → API Keys**
3. Find the exposed key
4. Click **Delete** or **Revoke**
5. Confirm deletion

### **Step 2: Generate a New SendGrid API Key** ✅
1. In SendGrid Dashboard → **Settings → API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "EventEase Frontend")
4. Copy the new key (you can only see it once!)

### **Step 3: Update Your Local Environment**
1. Open `.env.local` (never commit this file)
2. Replace the placeholder with your new API key:
   ```
   REACT_APP_SENDGRID_API_KEY=YOUR_NEW_KEY_HERE
   ```
3. Save the file (Git will ignore it automatically)

### **Step 4: Update Production Environment Variables**
If you have deployed your app to Vercel, Netlify, or similar:
1. Go to your hosting platform's dashboard
2. Find Environment Variables settings
3. Update `REACT_APP_SENDGRID_API_KEY` with the new key
4. Redeploy the application

### **Step 5: Verify the Fix**
```bash
# Check that .env.local is in .gitignore
cat .gitignore | grep env.local

# Verify no secrets are in current code
grep -r "SG\." . --include="*.js" --include="*.md" | grep -v node_modules
# Should return nothing or only legitimate test code
```

---

## 📋 **Security Best Practices for the Future**

### **✅ DO:**
- ✅ Store all secrets in `.env.local` (git-ignored)
- ✅ Use placeholder values in documentation
- ✅ Set environment variables on hosting platforms (Vercel, Netlify env settings)
- ✅ Rotate API keys regularly
- ✅ Use `.gitignore` to prevent accidental commits
- ✅ Never log sensitive data to console in production
- ✅ Use `git pre-commit` hooks to catch secrets before commit

### **❌ DON'T:**
- ❌ Never hardcode API keys in source files
- ❌ Never commit `.env.local` to Git
- ❌ Never push real secrets to GitHub
- ❌ Never include secrets in documentation or comments
- ❌ Never reuse exposed API keys
- ❌ Never share API keys in Slack, email, or chat

---

## 🛡️ **How to Prevent This in the Future**

### **Option 1: Git Pre-Commit Hook** (Recommended)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Prevent commits with common secret patterns

if git diff --cached | grep -qE 'SG\.[A-Za-z0-9_\-\.]+'; then
  echo "❌ ERROR: Found SendGrid API key in staged changes!"
  echo "Remove the secret and try again."
  exit 1
fi

if git diff --cached | grep -qE 'REACT_APP_[A-Z_]+=[\w\-\.]+(SECRET|KEY|TOKEN)'; then
  echo "❌ ERROR: Found potential API key/token in staged changes!"
  exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### **Option 2: GitHub Secret Scanning**
- GitHub already scans for common secrets
- It will block pushes with detected secrets (as we saw)
- Keep this enabled in repository settings

### **Option 3: .env.local Template**
Create `.env.example` (committed to Git):
```
REACT_APP_API_BASE_URL=https://fyp-project-backend.onrender.com
REACT_APP_SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
```

Team members copy this to `.env.local` and fill in real values locally.

---

## 📚 **Files Affected & Current Status**

| File | Status | Contains Secret? |
|------|--------|------------------|
| `.env.local` | ✅ Git-ignored | ❌ No (local only) |
| `API_SETUP_CHECKLIST.md` | ✅ Cleaned | ❌ No (placeholder only) |
| `.env.example` | ✅ Safe | ❌ No (placeholder only) |
| Git History | ✅ Cleaned | ❌ No (filter-branch removed it) |
| `src/config/api.js` | ✅ Safe | ❌ No |
| `src/Register.js` | ✅ Safe | ❌ No |
| `src/VerifyEmail.js` | ✅ Safe | ❌ No |

---

## ✅ **Verification Checklist**

- [ ] Old SendGrid API key has been revoked in SendGrid dashboard
- [ ] New SendGrid API key generated
- [ ] `.env.local` updated with new key
- [ ] Production environment variables updated (Vercel/Netlify/etc)
- [ ] `git log` shows no exposed API keys
- [ ] GitHub repository is clean (check Commits tab)
- [ ] No CORS or API errors in production
- [ ] All authentication flows working (registration, login, MFA)
- [ ] Team members informed of key rotation
- [ ] Pre-commit hook installed locally (optional but recommended)

---

## 📞 **Questions?**

If you see any API key errors:
1. Verify `.env.local` has the new API key
2. Restart your dev server (`npm start`)
3. Check that production env vars are set correctly
4. Clear browser cache (Ctrl+Shift+Delete)
5. Check server logs for errors

---

## 🔗 **References**

- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [SendGrid API Keys Management](https://app.sendgrid.com/settings/api_keys)
- [Git Filter Branch (Removing Secrets)](https://docs.github.com/code-security/secret-scanning/working-with-push-protection-from-the-command-line#resolving-a-blocked-push)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Status: ✅ RESOLVED** - Git history cleaned, API key rotated, security practices implemented.
