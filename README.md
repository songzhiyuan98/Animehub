# AnimeHub

AnimeHub is a comprehensive platform for anime enthusiasts, offering features such as anime search, rating, commenting, community interaction, and personalized recommendations. The project aims to create an active anime community where users can easily explore, share, and discuss their favorite anime works.

## Project Features

1. Anime Search and Browsing

   - Supports multiple filtering conditions (type, status, rating, etc.)
   - Detailed anime information display, including synopsis, ratings, trailers, etc.
   - Supports Chinese and English search with automatic query translation

2. User Rating System

   - Anime rating functionality
   - Multi-level nested comment system
   - Comment liking feature

3. Personalized Recommendations

   - Recommendation algorithm based on user browsing and favorite history
   - Daily recommendation feature

4. Community Interaction

   - Users can publish, edit, and delete posts
   - Supports rich text editor for inserting images and formatting text
   - Post tagging system for easy categorization and search
   - Post commenting and reply functionality

5. Favorites Feature

   - Users can favorite anime and posts
   - Favorites list management

6. Multi-language Support

   - Supports Chinese, English, and Japanese
   - Expandable internationalization framework

7. Real-time Notification System

   - WebSocket-based real-time notifications
   - Supports various notification types such as anime comments and post replies
   - Notification center for centralized management of all notifications

8. User Center

   - Personal profile management
   - View and manage own posts, comments, and favorites

9. Responsive Design
   - Interface adapted for desktop and mobile devices

## Technology Stack

### Frontend

- React 18
- Redux & Redux Toolkit
- Material-UI (MUI) 5
- Axios
- i18next
- React Router 6
- Socket.io-client
- React Quill (Rich Text Editor)
- React Infinite Scroll Component

### Backend

- Node.js
- Express
- MongoDB & Mongoose
- JWT Authentication
- Socket.io
- Bcrypt (Password Encryption)
- Nodemailer (Email Sending)
- Multer (File Upload)
- Node-cache (Server-side Caching)

## Core Functionality Implementation

1. User Authentication System

   - JWT token-based authentication
   - Refresh token mechanism
   - Password encryption storage

   Related code:

   ```javascript:animehub-backend/controllers/authController.js
   // User login function
   exports.login = async (req, res) => {
     const { username, password } = req.body;
     try {
       const user = await User.findOne({ username });
       if (!user) {
         return res.status(401).json({ message: "Incorrect username or password" });
       }
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         return res.status(401).json({ message: "Incorrect username or password" });
       }
       const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
       const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
       res.json({ accessToken, refreshToken, user: { id: user._id, username: user.username, email: user.email } });
     } catch (error) {
       res.status(500).json({ message: "Login failed", error: error.message });
     }
   };
   ```

2. Anime Information Retrieval and Caching

   - Use external API (Jikan API) to fetch anime data
   - Implement server-side caching to improve performance

   Related code:

   ```javascript:animehub-backend/controllers/animeController.js
   const NodeCache = require("node-cache");
   const animeCache = new NodeCache({ stdTTL: 3600 });

   exports.getAnimeById = async (req, res) => {
     const { id } = req.params;
     try {
       let animeData = animeCache.get(id);
       if (!animeData) {
         const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`);
         animeData = response.data.data;
         animeCache.set(id, animeData);
       }
       res.json(animeData);
     } catch (error) {
       res.status(500).json({ message: "Failed to fetch anime information", error: error.message });
     }
   };
   ```

3. Post System

   - Supports creating, editing, and deleting posts
   - Rich text editor integration
   - Post tagging system
   - Paginated loading

   Related code:

   ```javascript:animehub-frontend/src/components/PostEditor.js
   const PostEditor = ({ onSubmit, onClose }) => {
     const [title, setTitle] = useState("");
     const [content, setContent] = useState("");
     const [selectedTags, setSelectedTags] = useState([]);
     const [newTags, setNewTags] = useState([]);

     const handleSubmit = async () => {
       try {
         for (const newTag of newTags) {
           await axiosInstance.post("/tags", { name: newTag });
         }
         const formData = new FormData();
         formData.append("title", title);
         formData.append("content", content);
         formData.append("tags", JSON.stringify(selectedTags.map(tag => tag.slice(1))));
         await onSubmit(formData);
         setNewTags([]);
       } catch (error) {
         console.error("Failed to publish post:", error);
       }
     };

     // ... other code ...
   };
   ```

4. Real-time Notification System

   - Implement real-time notifications using Socket.io
   - Support various notification types
   - Persistent storage of notifications

   Related code:

   ```javascript:animehub-backend/utils/notificationService.js
   class NotificationService {
     static async createNotification(data) {
       const notification = new Notification(data);
       await notification.save();
       const io = getIO();
       io.to(data.recipient.toString()).emit('newNotification', notification);
       return notification;
     }

     static async getUserNotifications(userId) {
       try {
         const notifications = await Notification.find({ recipient: userId })
           .sort({ createdAt: -1 })
           .populate("sender", "nickname avatar")
           .populate("commentId", "content");
         return notifications;
       } catch (error) {
         console.error("Error fetching user notifications:", error);
         throw error;
       }
     }

     // ... other methods ...
   }
   ```

5. Internationalization Implementation

   - Use i18next for multi-language support
   - Support dynamic language switching

   Related code:

   ```javascript:animehub-frontend/src/i18n.js
   import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import Backend from 'i18next-http-backend';
   import LanguageDetector from 'i18next-browser-languagedetector';

   i18n
     .use(Backend)
     .use(LanguageDetector)
     .use(initReactI18next)
     .init({
       fallbackLng: 'en',
       debug: true,
       interpolation: {
         escapeValue: false,
       }
     });

   export default i18n;
   ```

## Installation and Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/animehub.git
   cd animehub
   ```

2. Install dependencies:

   ```bash
   # Backend dependencies
   cd animehub-backend
   npm install

   # Frontend dependencies
   cd ../animehub-frontend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `animehub-backend` directory and add the necessary environment variables:

   ```
   MONGO_URI=mongodb://localhost:27017/animehub
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   PORT=5000
   MJ_APIKEY_PUBLIC=your_mailjet_public_key
   MJ_APIKEY_PRIVATE=your_mailjet_private_key
   MJ_SENDER_EMAIL=your_sender_email
   ```

4. Start the application:

   ```bash
   # Start the backend
   cd animehub-backend
   npm start

   # Start the frontend
   cd ../animehub-frontend
   npm start
   ```

   frontend will run on http://localhost:3001, and the backend will run on http://localhost:3000.

## 项目结构

```
AnimeHub/
├── animehub-backend/        # Backend code
│   ├── config/              # Configuration files
│   ├── controllers/         # Controllers
│   ├── models/              # Data models
│   ├── routes/              # Routes
│   ├── utils/               # Utility functions
│   └── server.js            # Server entry file
├── animehub-frontend/       # Frontend code
│   ├── public/              # Static resources
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── redux/           # Redux related files
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Entry file
│   └── package.json
├── package.json
└── README.md
```

## Contributing

We welcome and appreciate any contributions! If you would like to contribute to AnimeHub, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure to update tests (if applicable).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project maintainer: Zhiyuan - songzhiyuan98@gmail.com
