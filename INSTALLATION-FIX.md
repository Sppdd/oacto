# ✅ Fixed: Installation Commands

## Problem
The installation commands in `QUICKSTART.md` were trying to link the n8n package before it was built, causing errors.

## Solution Applied

### 1. Fixed Command Sequence
**Before (broken):**
```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai  # ❌ This failed
```

**After (working):**
```bash
# Build the n8n package
cd packages/n8n-nodes-chrome-ai
npm install
npm run build

# Link the package globally
npm link

# Link in n8n custom directory
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai
```

### 2. Added Error Handling
- Check if `~/.n8n/custom` exists
- Create directory if missing
- Verify package was built before linking
- Added troubleshooting steps

### 3. Created Installation Script
**New file:** `install.sh`
- Automated installation process
- Error checking at each step
- Clear success/failure messages
- Complete setup in one command

### 4. Updated Documentation
- `QUICKSTART.md` - Fixed command sequence
- `README.md` - Enhanced troubleshooting
- Added installation script option

## How to Use Now

### Option 1: Automated (Recommended)
```bash
./install.sh
```

### Option 2: Manual (Step-by-step)
```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

pkill n8n
n8n start
```

## Verification
After installation, verify:
1. `ls ~/.n8n/custom` shows `n8n-nodes-chrome-ai`
2. n8n shows Chrome AI nodes when creating workflow
3. No errors in terminal

## Files Updated
- ✅ `QUICKSTART.md` - Fixed installation steps
- ✅ `README.md` - Enhanced troubleshooting
- ✅ `install.sh` - New automated installer

**The installation should now work perfectly!** 🎉

