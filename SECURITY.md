# Security Guidelines

## 🔐 Critical: Never Commit These Files

These files contain sensitive information and are **strictly ignored** by git:

```
# Private Keys & Credentials
flow.json              # Contains testnet private key
.env                   # Environment variables
.env.local             # Local configuration
oracle/.env            # Oracle worker secrets

# Runtime Data
data/                  # Local vault storage
*.json.backup          # Backup files

# Generated Files
.next/                 # Next.js build
node_modules/          # Dependencies
DEPLOYMENT_SUCCESS.md  # Deployment record
```

See [.gitignore](.gitignore) for the complete list.

---

## ✅ What TO Commit

**Always safe to commit:**
- ✅ `*.example` files (templates)
- ✅ Smart contract source code (`.cdc`)
- ✅ Source code (`.ts`, `.tsx`, `.js`)
- ✅ Configuration examples
- ✅ Documentation (`.md`)
- ✅ Tests

---

## 🛡️ Setup Instructions

### 1. Before First Use

```bash
# Web app
cp web/.env.example web/.env.local

# Oracle worker
cp oracle/.env.example oracle/.env

# Flow config
cp flow.json.example flow.json
```

### 2. Update with Your Secrets

Edit these files with your actual values:

**`flow.json`** - Add your testnet credentials:
```json
{
  "accounts": {
    "testnet-account": {
      "address": "0xYOUR_ADDRESS",
      "key": {
        "privateKey": "YOUR_PRIVATE_KEY_HEX"
      }
    }
  }
}
```

**`web/.env.local`** - Add contract addresses:
```env
NEXT_PUBLIC_DISASTER_VAULT_ADDRESS=0xcb6448da23dc7fa5
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
```

**`oracle/.env`** - Add API keys:
```env
OPENAI_API_KEY=sk-your-key-here
FLOW_NETWORK=testnet
```

### 3. Verify Before Committing

```bash
# Check what will be committed
git status

# Verify sensitive files are NOT listed
git ls-files | grep -E "flow.json|\.env|data/"

# Should return nothing (0 results)
```

---

## 🚨 If You Accidentally Commit Secrets

**IMMEDIATELY:**

1. **Revoke the compromised key** (testnet):
   ```bash
   flow keys revoke [KEY_INDEX] --network testnet
   ```

2. **Generate a new keypair**:
   ```bash
   flow keys generate --sig-algo ECDSA_P256
   ```

3. **Create new testnet account** with new keys

4. **Force push** (if on personal repo):
   ```bash
   # DANGER: Only do this if no one else is using the repo
   git push --force-with-lease
   ```

5. **Purge from Git history** (nuclear option):
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo

   # Remove file completely
   git filter-repo --path flow.json --invert-paths
   ```

---

## 🔒 Best Practices

### Environment Variables

✅ **DO:**
- Store sensitive data in `.env` files
- Reference in code: `process.env.VARIABLE_NAME`
- Use `NEXT_PUBLIC_` prefix only for public values
- Keep secrets in `.gitignore`

❌ **DON'T:**
- Hardcode API keys or private keys
- Commit `.env` files
- Use secrets as `NEXT_PUBLIC_` variables
- Log sensitive data

### Private Keys

✅ **DO:**
- Keep in `flow.json` (gitignored)
- Use key rotation regularly
- Separate keys per environment (emulator, testnet, mainnet)
- Use read-only file permissions: `chmod 600 flow.json`

❌ **DON'T:**
- Share private keys in Slack, email, or GitHub
- Use same key across environments
- Commit keys to any branch
- Post in code comments

### Testing with Secrets

```bash
# ✅ Safe: Use example files
cp oracle/.env.example oracle/.env.test

# ✅ Safe: Point to test credentials
export FLOW_NETWORK=emulator

# ❌ Unsafe: Commit real credentials
# Don't do this!
```

---

## 🔑 Key Rotation

### When to Rotate

- After accidental exposure
- Before public launch
- Every 6 months (best practice)
- If you suspect compromise

### How to Rotate

1. **Generate new keypair**:
   ```bash
   flow keys generate --sig-algo ECDSA_P256
   ```

2. **Save new keys safely**:
   ```bash
   cp flow.json flow.json.old
   # Update with new private key
   ```

3. **Revoke old key** (testnet):
   ```bash
   flow keys revoke 0 --network testnet
   ```

4. **Delete old files**:
   ```bash
   shred -vfz flow.json.old  # Securely delete
   ```

---

## 📋 Pre-Deployment Checklist

Before pushing to GitHub or deploying:

- [ ] All sensitive files in `.gitignore`
- [ ] No hardcoded API keys or private keys
- [ ] `.env.example` files created for reference
- [ ] `flow.json.example` created (without secrets)
- [ ] Git status shows no sensitive files
- [ ] Verified: `git ls-files` doesn't include `.env`, `flow.json`, `data/`
- [ ] Committed: `.gitignore` changes
- [ ] Documented: Which environment files are needed

---

## 🚀 GitHub Repository Setup

### Initial Setup

```bash
# Initialize with clean history (no secrets)
git init
git add .

# Verify before first commit
git status | grep -E "flow.json|\.env|data/"

# First commit
git commit -m "Initial commit"
```

### Secrets Scanner

Add GitHub secret scanning:
1. Go to Settings → Security & Analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

---

## 📚 Additional Resources

- [GitHub Docs: Secrets Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Flow CLI Docs: Keys & Security](https://developers.flow.com/tools/flow-cli/keys)

---

## ✋ Questions?

If you're unsure whether something should be committed:

**Ask yourself:**
1. Does it contain passwords, API keys, or private keys? → NO
2. Is it system/environment specific? → NO
3. Is it generated at build time? → NO
4. Is it runtime data? → NO

If you answered YES to any of the above, **DON'T COMMIT IT**.

---

**Last Updated:** 2025-11-01
**Severity:** 🔴 CRITICAL
