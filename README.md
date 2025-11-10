# Todo AI App

A smart task management application that leverages AI to help users break down goals into actionable tasks, track progress, and maintain accountability through shared progress tracking.

## 🚀 Features

### Core Functionality
- **AI-Powered Task Breakdown**: Automatically break down goals into manageable tasks using OpenAI's GPT models
- **Task Management**: Create, update, delete, and track tasks with subtasks
- **Goal Tracking**: Set and monitor long-term goals with progress visualization
- **Priority System**: Intelligent task prioritization based on energy levels and deadlines
- **Subtask Support**: Break tasks into smaller, trackable subtasks

### User Experience
- **Cross-Platform Mobile App**: Built with React Native for iOS and Android
- **Intuitive Dashboard**: Clean, modern interface for daily task management
- **Real-time Updates**: Live synchronization between frontend and backend
- **Offline Support**: Core functionality works without internet connection

### Accountability & Social Features
- **Accountability Sharing**: Share progress with friends or mentors via email
- **Progress Tracking**: Monitor completion rates and streaks
- **Fail Tracking**: Background jobs track missed deadlines and send reminders

### Technical Features
- **Secure Authentication**: JWT-based user authentication with bcrypt password hashing
- **RESTful API**: Well-documented Express.js API with input validation
- **Database Integration**: MongoDB with Mongoose ODM
- **Email Notifications**: Automated accountability emails using Nodemailer
- **Background Processing**: Node-cron for scheduled tasks and reminders

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **AI Integration**: OpenAI API
- **Email**: Nodemailer
- **Validation**: Joi
- **Scheduling**: node-cron
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage for local persistence
- **UI Components**: Native components with custom styling

### DevOps & Tools
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Environment**: dotenv for configuration
- **Deployment**: Ready for Render/Heroku deployment

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager
- Expo CLI (for React Native development)
- OpenAI API key (optional, for AI features)

## 🔧 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/todo-ai
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   FRONTEND_URL=http://localhost:8081
   ```

4. **Start MongoDB**
   Make sure MongoDB is running locally or update MONGODB_URI for cloud instance.

5. **Run the backend**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../todo-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in `todo-frontend/src/api/auth.js` and `todo-frontend/src/context/TaskContext.js` if needed.

4. **Start the Expo development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📖 Usage

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/today` - Get today's prioritized tasks

#### Accountability
- `POST /api/accountability/share` - Generate accountability share link
- `GET /api/accountability/view/:token` - View shared accountability (public)

#### Health Check
- `GET /api/health` - API health status

### Mobile App Features

1. **Dashboard**: View and manage today's tasks
2. **Goals Screen**: See all tasks with expandable details
3. **Add Tasks**: Create new tasks with subtasks
4. **Authentication**: Login/register screens
5. **Accountability**: Share progress with others

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Manual Testing
- Use tools like Postman or Insomnia for API testing
- Test mobile app on various screen sizes
- Verify AI task breakdown functionality

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables in deployment platform
3. Deploy from main branch
4. Update CORS origins for production frontend URL

### Frontend Deployment
1. Build for production: `expo build:android` or `expo build:ios`
2. Submit to app stores or use Expo's hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI task breakdown functionality
- MongoDB for the robust database solution
- React Native and Expo for the excellent mobile development experience

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for productivity enthusiasts**
