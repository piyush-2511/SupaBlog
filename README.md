# 📘 SupaBlog

**SupaBlog** is a full-stack blogging platform built with **React (JavaScript)**, **Redux** for state management, and **Supabase** as the backend. It enables users to write, manage, and share blog posts while connecting with other bloggers.

---

## 🚀 Features

### 🔐 Authentication

* Sign up and log in securely using Supabase Auth.
* Protected routes and personalized dashboard.

### 👤 User Profile

* Create and edit your profile with:

  * Profile picture
  * Username
  * Date of birth
  * Bio

### ✍️ Blogging

* Create blog posts and save them as:

  * **Drafts** — Only visible to the author.
  * **Published** — Publicly visible to all users.
* Edit and update existing blog posts.
* Delete blogs with confirmation prompts.

### 🌐 Explore

* Read blogs posted by other users.
* Search for other bloggers by username.

---

## 💠 Tech Stack

| Frontend | State Management | Backend  |
| -------- | ---------------- | -------- |
| React JS | Redux Toolkit    | Supabase |

---

## 📂 Folder Structure (Basic Overview)

```
src/
│
├── components/       # Reusable UI components
├── pages/            # Page components (Home, Blog, Profile, etc.)
├── Feature/            # Redux slices and store
├── supabase/         # Supabase service functions
└── hooks/            # Custom React hooks
```

---

## 🧪 How to Run Locally

1. **Clone the repo**

```bash
git clone https://github.com/your-username/SupaBlog.git
cd SupaBlog
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

* Create a project at [https://supabase.com](https://supabase.com)
* Enable **Authentication** and **Storage**
* Create necessary tables (users, blogs, etc.)
* Copy your project URL and anon key.

4. **Add environment variables**

Create a `.env` file and add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. **Start the app**

```bash
npm run dev
```

---

## 🤝 Contributions

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## ✨ Credits

Made with ❤️ by Piyush
