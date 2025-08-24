# ASCP(i) MLS Exam Simulator

## Project Overview
- **Name**: ASCP(i) MLS Exam Simulator
- **Goal**: Computer-Adaptive Testing (CAT) simulation for Medical Laboratory Science certification exam
- **Features**: 
  - 100-question adaptive exam simulation
  - Questions from all 7 major laboratory disciplines
  - Real-time difficulty adjustment based on performance
  - Progress tracking and detailed explanations

## URLs
- **Development**: https://3000-i7m40xvy86e7hgbpfdf4j-6532622b.e2b.dev
- **GitHub**: https://github.com/drsmolina/ascpi-simulator

## Data Architecture
- **Data Models**: 
  - Questions (id, category, difficulty, stem, options, correct_index, explanation)
  - Sessions (id, started_at, status, current_difficulty, item_index, blueprint)
- **Storage Services**: Cloudflare D1 (SQLite database)
- **Data Flow**: Session creation → Blueprint generation → Adaptive question selection → CAT algorithm

## Exam Content Areas
The simulator follows the official ASCP content outline:

1. **Blood Banking (Immunohematology)** - 17-22% (~20 questions)
2. **Clinical Chemistry** - 17-22% (~20 questions)  
3. **Hematology (including Hemostasis)** - 17-22% (~20 questions)
4. **Microbiology** - 17-22% (~20 questions)
5. **Urinalysis and Other Body Fluids** - 5-10% (~8 questions)
6. **Immunology/Serology** - 5-10% (~7 questions)
7. **Laboratory Operations** - 5-10% (~5 questions)

## CAT Algorithm Features
- Starts at medium difficulty (level 3)
- Adjusts difficulty based on correct/incorrect responses
- Difficulty range: 1 (easiest) to 5 (hardest)
- Random question selection within category and difficulty range
- Blueprint ensures proper content distribution across all domains

## User Guide
1. **Start Exam**: Click "Start Practice Exam" to begin a new session
2. **Answer Questions**: Select one of four multiple-choice options
3. **Submit Answer**: Click "Submit Answer" to see results and explanation
4. **Progress**: Track your progress through all 100 questions
5. **Adaptive Difficulty**: Questions get harder/easier based on your performance
6. **Completion**: Review your performance after completing all questions

## API Endpoints
- `POST /api/session/start` - Create new exam session
- `GET /api/session/:id/question` - Get next adaptive question
- `POST /api/session/:id/answer` - Submit answer and get feedback
- `GET /api/session/:id/status` - Get session progress and status

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Development)
- **Tech Stack**: Hono + TypeScript + TailwindCSS + D1 Database
- **Database**: Local SQLite (development), D1 (production)
- **Last Updated**: August 24, 2025

## Development Commands
```bash
npm run build              # Build for production
npm run dev:sandbox        # Start development server
npm run db:migrate:local   # Apply database migrations
npm run db:seed           # Seed database with sample questions
npm run db:reset          # Reset local database
```

## Future Enhancements
- [ ] Expanded question database (currently has sample questions)
- [ ] Performance analytics and scoring
- [ ] Study mode with explanations
- [ ] Category-specific practice modes
- [ ] Timer functionality (2.5 hour limit)
- [ ] Detailed score reporting
- [ ] Question bookmarking for review