# HealthSync AI

A comprehensive health report management system with AI-powered insights and emergency features.

## Project Structure

```
healthsync-ai/
├── frontend/          # React App (UI)
├── backend/           # Node + Express API
├── ai-service/        # ML Model Service (Optional)
├── .env               # Environment variables
└── README.md
```

## Features

- **User Authentication**: Secure login and registration
- **Report Management**: Upload and store health reports
- **OCR Processing**: Extract text from medical documents
- **AI Analysis**: Get insights from health reports
- **QR Code Generation**: Share reports securely
- **Emergency View**: Quick access to critical health information

## Prerequisites

- Node.js v14+
- MongoDB v4.4+
- Python 3.8+ (for AI service)
- npm or yarn

## Installation & Setup

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will run on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:5000`

### AI Service Setup (Optional)

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/upload` - Upload a report
- `GET /api/reports/:id` - Get report details
- `DELETE /api/reports/:id` - Delete report

### AI Analysis
- `POST /api/ai/analyze` - Analyze report with AI
- `GET /api/ai/insights/:reportId` - Get AI insights

## Environment Variables

See `.env` file for all configuration options.

## Development

- Frontend: React with Context API for state management
- Backend: Express.js with MongoDB
- AI: Python ML service (optional)

## Deployment

- Frontend: Deploy to Vercel or Netlify
- Backend: Deploy to Heroku, AWS, or DigitalOcean
- Database: MongoDB Atlas
- AI Service: AWS Lambda or Google Cloud Functions

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
