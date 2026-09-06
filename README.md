# 🎬 ReelDrop — Authorized Instagram Reel & Media Downloader

ReelDrop is a production-ready web application that enables creators and authorized users to retrieve and download high-definition Instagram Reels, Posts, and Videos strictly through official, supported Meta/Instagram APIs.

---

## 🌟 Key Features

* **⚡ Modern SaaS Interface**: Glassmorphism aesthetic, subtle Instagram sunset gradient accents, smooth loading states, and dark mode.
* **🛡️ Official Meta Graph API Integration**: Integrates directly with Instagram Basic Display and Meta Graph API OAuth 2.0.
* **🔒 Strict Security & SSRF Protection**: Validates Instagram hostnames, blocks private/loopback/cloud metadata IP ranges, and sanitizes all inputs.
* **⏱️ Sliding-Window Rate Limiting**: In-memory rate limiting per IP address to safeguard quotas and protect against abuse.
* **📦 Lossless HD Media Streaming Proxy**: Server-side proxy with proper `Content-Disposition: attachment` headers ensuring direct file downloads without token leakage.
* **✨ Instant Clipboard Detection**: One-click "Paste Link" and smart shortcode recognition for Reels, Posts, IGTV, and Carousels.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* **Node.js** 18.17+ or 20.x+
* **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
# Clone or navigate to the repository directory
cd reeldrop

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Meta / Instagram Developer Credentials
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_APP_SECRET=your_meta_app_secret

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_WINDOW_MS=60000

# Developer Mock Mode (Set to true to preview media downloads locally without Meta keys)
ENABLE_MOCK_FIXTURES=true
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Configuring Meta / Instagram Authentication

To retrieve media directly from your live Instagram account, set up a Meta Developer App:

1. **Create a Meta Developer Account**:
   * Go to [Meta for Developers](https://developers.facebook.com/) and register or sign in.
2. **Create an App**:
   * Click **My Apps** > **Create App**.
   * Select **Consumer** or **Business** as the app type.
3. **Add Instagram Basic Display or Instagram Graph API**:
   * In the App Dashboard, find **Instagram Basic Display** and click **Set Up**.
   * Scroll down and click **Create New App**.
4. **Configure OAuth Redirect URIs**:
   * In the Instagram Basic Display settings, add your Redirect URIs:
     * **Valid OAuth Redirect URIs**: `http://localhost:3000/api/auth/callback` (for production: `https://yourdomain.com/api/auth/callback`)
     * **Deauthorize Callback URL**: `https://yourdomain.com/api/auth/disconnect`
     * **Data Deletion Request URL**: `https://yourdomain.com/api/auth/disconnect`
5. **Add Test Users**:
   * In the **Roles** > **Instagram Testers** section, add your Instagram account username.
   * On your Instagram mobile app or web profile, go to **Settings > Apps and Websites > Tester Invites** and accept the invite.
6. **Copy App ID & Secret**:
   * Copy **Instagram App ID** and **Instagram App Secret** into your `.env.local` file.

---

## 🏗️ Production Build & Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploying to Vercel
1. Push your code to a Git repository (GitHub / GitLab).
2. Import the project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   * `INSTAGRAM_APP_ID`
   * `INSTAGRAM_APP_SECRET`
   * `RATE_LIMIT_MAX_REQUESTS` = `20`
   * `RATE_LIMIT_WINDOW_MS` = `60000`
   * `ENABLE_MOCK_FIXTURES` = `false`
4. Deploy. Update your Meta Developer App with the live production OAuth Redirect URI (`https://your-domain.vercel.app/api/auth/callback`).

---

## 🛡️ Security & Compliance Policy

* **SSRF Shield**: The backend strictly validates domains (`instagram.com`, `graph.instagram.com`, `cdninstagram.com`, `fbcdn.net`) and rejects private IPv4/IPv6 address blocks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.1, 169.254.169.254).
* **Token Isolation**: User tokens are encrypted and placed exclusively in `httpOnly`, `SameSite=lax` cookies.
* **Content Ownership**: ReelDrop only retrieves content authorized by Meta Graph API. It does not bypass paywalls, private account privacy settings, or Instagram DRM.

---

## 📄 License
MIT License. Created for authorized content creators and social media managers.
