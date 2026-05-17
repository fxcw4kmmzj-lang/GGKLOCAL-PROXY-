# 🎮 GGK Proxy - Minecraft Bedrock Edition

Ένα modern web-based proxy για Minecraft Bedrock Edition (MCPE) με Microsoft authentication και πλήρη λειτουργικότητα.

## 🌟 Features

- ✅ **Microsoft Login** - Πλήρης ενσωμάτωση με Xbox Live
- 🎯 **Tabs Navigation** - Home, Profile, Settings
- 🚀 **Proxy Server** - UDP proxy για Minecraft Bedrock
- 📊 **Server Management** - Προσθήκη και διαχείριση servers
- 💬 **Real-time Console** - Live updates μέσω WebSocket
- 📈 **Statistics** - Παρακολούθηση χρήσης και συνδέσεων
- 🎨 **Modern UI** - Clean και responsive design

## 📋 Απαιτήσεις

- **Node.js** v18.0.0 ή νεότερη
- **npm** (περιλαμβάνεται με το Node.js)
- Browser (Chrome, Firefox, Safari, Edge)

## 🚀 Εγκατάσταση

### 1. Κατέβασε τα αρχεία

Βεβαιώσου ότι έχεις όλα αυτά τα αρχεία:
- `index.html` - Το frontend
- `server.js` - Ο backend server
- `BedrockProxy.js` - Το proxy module
- `package.json` - Dependencies
- `README.md` - Αυτό το αρχείο

### 2. Εγκατάστασε τα dependencies

Άνοιξε terminal/command prompt στον φάκελο του project και τρέξε:

```bash
npm install
```

### 3. Ξεκίνα τον server

```bash
npm start
```

Θα δεις:
```
╔══════════════════════════════════════╗
║   🎮 GGK Proxy Server v1.0.0        ║
╠══════════════════════════════════════╣
║  🌐 HTTP: http://localhost:3000     ║
║  🔌 WebSocket: ws://localhost:3000  ║
║  🎯 Proxy Port: UDP 19132            ║
╚══════════════════════════════════════╝
```

### 4. Άνοιξε το browser

Πήγαινε στο: `http://localhost:3000`

## 📱 Χρήση

### Step 1: Microsoft Login
1. Πήγαινε στο **Profile** tab
2. Πάτα "Σύνδεση με Microsoft"
3. Συνδέσου με το Microsoft/Xbox account σου
4. Θα επιστρέψεις αυτόματα στην εφαρμογή

### Step 2: Προσθήκη Server
1. Πήγαινε στο **Home** tab
2. Βάλε τα στοιχεία του server:
   - **Όνομα**: π.χ. "Donut SMP"
   - **IP**: π.χ. "play.donutsmp.net"
   - **Port**: 19132 (default για Bedrock)
3. Πάτα **Προσθήκη**

### Step 3: Launch Proxy
1. Επίλεξε τον server από τη λίστα
2. Πάτα **🚀 LAUNCH PROXY**
3. Περίμενε να δεις "✅ Proxy ACTIVE!"

### Step 4: Σύνδεση από Minecraft
1. Άνοιξε **Minecraft Bedrock Edition**
2. Πήγαινε στο **Play** → **Servers** → **Add Server**
3. Βάλε τα εξής:
   - **Server Name**: `GGK` (ή όπως θες)
   - **Server Address**: `localhost` (ή η IP του PC σου αν παίζεις από άλλη συσκευή)
   - **Port**: `19132`
4. Πάτα **Save** και μετά **Join Server**
5. Θα συνδεθείς στον Donut SMP (ή όποιον server έχεις επιλέξει)!

## 🔧 Settings

Στο **Settings** tab μπορείς:
- ⚙️ Να ενεργοποιήσεις/απενεργοποιήσεις auto-reconnect
- 📺 Να εμφανίσεις/κρύψεις το console
- 🔌 Να αλλάξεις το local proxy port
- 🗑️ Να εκκαθαρίσεις όλα τα δεδομένα

## 🌐 Σύνδεση από άλλη συσκευή

Αν θέλεις να συνδεθείς από tablet/phone:

1. Βρες την IP του PC σου:
   - **Windows**: Άνοιξε CMD και γράψε `ipconfig`
   - **Mac/Linux**: Άνοιξε Terminal και γράψε `ifconfig` ή `ip addr`
   - Βρες την IP που αρχίζει με `192.168.x.x`

2. Στο Minecraft της άλλης συσκευής:
   - **Server Address**: `192.168.x.x` (η IP του PC σου)
   - **Port**: `19132`

## ❗ Troubleshooting

### "Proxy not running"
- Βεβαιώσου ότι ο server τρέχει (`npm start`)
- Έλεγξε ότι το port 19132 δεν χρησιμοποιείται από άλλη εφαρμογή

### "Microsoft login failed"
- Έλεγξε τη σύνδεση στο internet
- Δοκίμασε να ξανακάνεις login
- Βεβαιώσου ότι έχεις valid Microsoft/Xbox account

### "Server offline"
- Έλεγξε ότι η IP και το port είναι σωστά
- Βεβαιώσου ότι ο Minecraft server τρέχει
- Δοκίμασε να κάνεις ping τον server

### "Can't connect from Minecraft"
- Βεβαιώσου ότι το proxy τρέχει (status: CONNECTED)
- Έλεγξε ότι χρησιμοποιείς το σωστό port (19132)
- Για local: χρησιμοποίησε `localhost`
- Για remote: χρησιμοποίησε την IP του PC σου

## 🔒 Ασφάλεια

- Το Microsoft login γίνεται μέσω των επίσημων Xbox Live APIs
- Κανένα password δεν αποθηκεύεται τοπικά
- Όλα τα tokens διαχειρίζονται με ασφάλεια από το Microsoft

## 📊 Technical Details

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js + Express
- **WebSocket**: ws library για real-time updates
- **Proxy**: Custom UDP proxy για Bedrock protocol
- **Auth**: Microsoft OAuth 2.0 + Xbox Live API

## 🎯 Supported Servers

Λειτουργεί με όλους τους Minecraft Bedrock servers:
- ✅ Public servers (Donut SMP, Zeqa, κλπ)
- ✅ Private servers
- ✅ LAN servers
- ✅ Realms (με proxy workaround)

## 📝 Changelog

### v1.0.0 (Latest)
- ✨ Προσθήκη tabs (Home, Profile, Settings)
- 🔐 Βελτιωμένο Microsoft authentication
- 🎨 Modern UI redesign
- 📊 Statistics tracking
- 🚀 Improved proxy stability
- 💬 Real-time console με WebSocket

## 👨‍💻 Developer

Made with ❤️ by GGK

## 📄 License

MIT License - Free to use and modify

---

**Enjoy playing! 🎮**

Για οποιοδήποτε πρόβλημα, έλεγξε το console (F12 στο browser) για errors.