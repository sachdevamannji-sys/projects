# Crop Trading System - Windows Setup Guide

## Prerequisites for Windows

### 1. Install Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended for most users)
3. Run the installer and follow the setup wizard
4. **Important:** Check "Add to PATH" during installation
5. Restart your computer after installation

### 2. Verify Installation
Open **Command Prompt** or **PowerShell** and run:
```cmd
node --version
npm --version
```
You should see version numbers (like v18.17.0 or higher).

## Download and Setup Application

### 1. Get the Application Files
- Download all project files to a folder like `C:\crop-trading-system\`
- Or use Git: `git clone <repository-url>`

### 2. Install Dependencies
1. Open **Command Prompt** as Administrator
2. Navigate to your project folder:
   ```cmd
   cd C:\crop-trading-system
   ```
3. Install required packages:
   ```cmd
   npm install
   ```

### 3. Initialize Database
Create the local database with admin user:
```cmd
npx tsx scripts/init-db.ts
```

You should see:
```
Initializing SQLite database...
Tables created successfully!
Admin user created!
Login credentials:
Email: admin@example.com
Password: admin123
Database initialization complete!
```

## Running the Application

### 1. Start the Server
In Command Prompt, run:
```cmd
npm run dev
```

You'll see:
```
[express] serving on port 5000
```

### 2. Access the Application
1. Open your web browser
2. Go to: `http://localhost:5000`
3. Login with:
   - **Email:** admin@example.com
   - **Password:** admin123

## Windows-Specific Notes

### File Locations
- **Database:** `C:\crop-trading-system\local-database.db`
- **Logs:** Check Command Prompt window for any errors
- **Backups:** Copy the `.db` file to backup your data

### Firewall Settings
Windows might ask for firewall permission when you first run the app:
- Click **"Allow access"** for Node.js
- This allows the web server to run on your computer

### Running as Windows Service (Optional)
To run the app automatically when Windows starts:

1. Install PM2 globally:
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

2. Setup service:
   ```cmd
   pm2-service-install
   pm2 start npm --name "crop-trading" -- run dev
   pm2 save
   ```

### Common Windows Issues & Solutions

**Issue:** "npm not recognized"
- **Solution:** Restart Command Prompt or reinstall Node.js with PATH option

**Issue:** Permission denied errors
- **Solution:** Run Command Prompt as Administrator

**Issue:** Port 5000 already in use
- **Solution:** Close other applications or restart Windows

**Issue:** Database file locked
- **Solution:** Close the application completely and restart

## Daily Usage on Windows

### Starting the Application
1. Open Command Prompt
2. Navigate to project folder: `cd C:\crop-trading-system`
3. Run: `npm run dev`
4. Open browser to `http://localhost:5000`

### Stopping the Application
- Press `Ctrl + C` in Command Prompt
- Or simply close the Command Prompt window

### Backing Up Your Data
1. Close the application
2. Copy `local-database.db` to a backup location
3. Example: Copy to `C:\Backups\crop-trading-backup-2025-07-14.db`

## Folder Structure
```
C:\crop-trading-system\
├── local-database.db          ← Your business data
├── client\                    ← Web interface files
├── server\                    ← Application logic
├── shared\                    ← Common code
├── scripts\                   ← Database tools
├── package.json               ← Project configuration
└── WINDOWS_SETUP.md          ← This guide
```

## Network Access (Optional)
To access from other computers on your network:

1. Find your computer's IP address:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (like 192.168.1.100)

2. Other computers can access at:
   `http://192.168.1.100:5000`

3. **Security Note:** Only do this on trusted networks

## Troubleshooting

### Application Won't Start
1. Check Node.js is installed: `node --version`
2. Reinstall dependencies: `npm install`
3. Check for error messages in Command Prompt

### Can't Access Website
1. Verify app is running (should show "serving on port 5000")
2. Try `http://127.0.0.1:5000` instead
3. Disable Windows Firewall temporarily to test

### Database Issues
1. Delete `local-database.db` file
2. Run `npx tsx scripts/init-db.ts` again
3. This will create a fresh database with admin user

## Performance Tips for Windows

1. **Exclude from Antivirus:** Add project folder to Windows Defender exclusions
2. **SSD Storage:** Place project on SSD drive for better performance  
3. **Regular Backups:** Set up automatic backup of the database file
4. **Keep Updated:** Update Node.js occasionally for security and performance

Your crop trading system is now ready to run on Windows!