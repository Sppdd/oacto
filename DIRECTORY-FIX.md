# ✅ Fixed: Missing ~/.n8n/custom Directory

## Problem
When trying to install the n8n nodes, you got this error:
```
cd: no such file or directory: /Users/etharo/.n8n/custom
```

## Why This Happens
The `~/.n8n/custom` directory doesn't exist by default. It's only created after n8n has been run at least once, or you need to create it manually when installing custom nodes.

## Solution

### Quick Fix (What We Just Did)
```bash
# Create the directory
mkdir -p ~/.n8n/custom

# Navigate to it
cd ~/.n8n/custom

# Link the package
npm link n8n-nodes-chrome-ai
```

### Verification
Check that the package is linked:
```bash
cd ~/.n8n/custom
npm list
```

Should show:
```
/Users/etharo/.n8n/custom
└── n8n-nodes-chrome-ai@1.0.0 -> ../../Desktop/Journal.dev/packages/n8n-nodes-chrome-ai
```

## Updated Installation Process

### Option 1: Use Installation Script
```bash
./install.sh
```
The script now automatically creates the directory.

### Option 2: Manual Steps
```bash
# 1. Build the package
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

# 2. Create n8n custom directory (if needed)
mkdir -p ~/.n8n/custom

# 3. Link in n8n
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# 4. Restart n8n
pkill n8n
n8n start
```

## What's Next?

Now that the package is linked, restart n8n to see the nodes:

```bash
# If n8n is running, restart it
pkill n8n
n8n start
```

Then:
1. Open n8n: http://localhost:5678
2. Create a new workflow
3. Click "+" to add a node
4. Search for "Chrome"
5. You should see all 7 Chrome AI nodes!

## Common Issues

### "Package still not showing in n8n"
```bash
# Make sure you're linking the built package
cd packages/n8n-nodes-chrome-ai
ls dist/  # Should show .js files

# If dist/ is empty, rebuild
npm run build

# Relink
npm link
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Restart n8n
pkill n8n
n8n start
```

### "n8n not found"
```bash
# Install n8n globally first
npm install -g n8n

# Then start it
n8n start
```

**The package is now successfully installed!** 🎉

