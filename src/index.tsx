import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import type { Bindings, Category, Question, Session } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))
app.use(renderer)

// CAT Algorithm helpers
function generateBlueprint(): Category[] {
  const categories: Category[] = []
  // Blood Bank: 17-22% (20 questions)
  for (let i = 0; i < 20; i++) categories.push('BloodBank')
  // Chemistry: 17-22% (20 questions)
  for (let i = 0; i < 20; i++) categories.push('Chemistry')
  // Hematology: 17-22% (20 questions)
  for (let i = 0; i < 20; i++) categories.push('Hematology')
  // Microbiology: 17-22% (20 questions)
  for (let i = 0; i < 20; i++) categories.push('Microbiology')
  // Urinalysis: 5-10% (8 questions)
  for (let i = 0; i < 8; i++) categories.push('Urinalysis')
  // Immunology: 5-10% (7 questions)
  for (let i = 0; i < 7; i++) categories.push('Immunology')
  // Lab Operations: 5-10% (5 questions)
  for (let i = 0; i < 5; i++) categories.push('LabOps')
  
  // Shuffle blueprint
  for (let i = categories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [categories[i], categories[j]] = [categories[j], categories[i]];
  }
  return categories
}

function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// API Routes
app.post('/api/session/start', async (c) => {
  const { env } = c
  
  const sessionId = generateSessionId()
  const blueprint = generateBlueprint()
  
  const session: Omit<Session, 'id'> = {
    started_at: new Date().toISOString(),
    status: 'active',
    current_difficulty: 3, // Start at medium difficulty
    item_index: 0,
    blueprint: blueprint
  }
  
  await env.DB.prepare(`
    INSERT INTO sessions (id, started_at, status, current_difficulty, item_index, blueprint)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    sessionId,
    session.started_at,
    session.status,
    session.current_difficulty,
    session.item_index,
    JSON.stringify(session.blueprint)
  ).run()
  
  return c.json({ sessionId, blueprint: session.blueprint })
})

app.get('/api/session/:id/question', async (c) => {
  const { env } = c
  const sessionId = c.req.param('id')
  
  // Get session
  const session = await env.DB.prepare(`
    SELECT * FROM sessions WHERE id = ?
  `).bind(sessionId).first() as any
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }
  
  if (session.status === 'completed' || session.item_index >= 100) {
    return c.json({ error: 'Session completed' }, 400)
  }
  
  const blueprint = JSON.parse(session.blueprint)
  const currentCategory = blueprint[session.item_index]
  
  // Get random question from category at current difficulty (±1)
  const minDiff = Math.max(1, session.current_difficulty - 1)
  const maxDiff = Math.min(5, session.current_difficulty + 1)
  
  const question = await env.DB.prepare(`
    SELECT * FROM questions 
    WHERE category = ? AND difficulty BETWEEN ? AND ?
    ORDER BY RANDOM() LIMIT 1
  `).bind(currentCategory, minDiff, maxDiff).first() as any
  
  if (!question) {
    return c.json({ error: 'No questions available' }, 500)
  }
  
  // Return question without correct answer
  return c.json({
    questionId: question.id,
    itemIndex: session.item_index + 1,
    totalItems: 100,
    category: question.category,
    difficulty: question.difficulty,
    stem: question.stem,
    options: JSON.parse(question.options)
  })
})

app.post('/api/session/:id/answer', async (c) => {
  const { env } = c
  const sessionId = c.req.param('id')
  const { questionId, selectedIndex } = await c.req.json()
  
  // Get session
  const session = await env.DB.prepare(`
    SELECT * FROM sessions WHERE id = ?
  `).bind(sessionId).first() as any
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }
  
  // Get question
  const question = await env.DB.prepare(`
    SELECT * FROM questions WHERE id = ?
  `).bind(questionId).first() as any
  
  if (!question) {
    return c.json({ error: 'Question not found' }, 404)
  }
  
  const isCorrect = selectedIndex === question.correct_index
  
  // CAT algorithm: adjust difficulty based on response
  let newDifficulty = session.current_difficulty
  if (isCorrect && newDifficulty < 5) {
    newDifficulty++
  } else if (!isCorrect && newDifficulty > 1) {
    newDifficulty--
  }
  
  const newItemIndex = session.item_index + 1
  const newStatus = newItemIndex >= 100 ? 'completed' : 'active'
  
  // Update session
  await env.DB.prepare(`
    UPDATE sessions 
    SET current_difficulty = ?, item_index = ?, status = ?
    WHERE id = ?
  `).bind(newDifficulty, newItemIndex, newStatus, sessionId).run()
  
  return c.json({
    correct: isCorrect,
    correctIndex: question.correct_index,
    explanation: question.explanation,
    newDifficulty,
    itemIndex: newItemIndex,
    completed: newStatus === 'completed'
  })
})

app.get('/api/session/:id/status', async (c) => {
  const { env } = c
  const sessionId = c.req.param('id')
  
  const session = await env.DB.prepare(`
    SELECT * FROM sessions WHERE id = ?
  `).bind(sessionId).first() as any
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }
  
  return c.json({
    id: session.id,
    startedAt: session.started_at,
    status: session.status,
    currentDifficulty: session.current_difficulty,
    itemIndex: session.item_index,
    progress: Math.round((session.item_index / 100) * 100)
  })
})

// Main page
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <i className="fas fa-microscope mr-3 text-blue-600"></i>
              ASCP(i) MLS Exam Simulator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Computer-Adaptive Testing (CAT) simulation with 100 questions across all major laboratory disciplines.
              Questions adapt in difficulty based on your performance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              <i className="fas fa-chart-pie mr-2 text-green-600"></i>
              Exam Content Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800">Blood Banking</h3>
                <p className="text-sm text-red-600">17-22% (~20 questions)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800">Clinical Chemistry</h3>
                <p className="text-sm text-blue-600">17-22% (~20 questions)</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800">Hematology</h3>
                <p className="text-sm text-purple-600">17-22% (~20 questions)</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800">Microbiology</h3>
                <p className="text-sm text-green-600">17-22% (~20 questions)</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800">Urinalysis</h3>
                <p className="text-sm text-yellow-600">5-10% (~8 questions)</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-800">Immunology</h3>
                <p className="text-sm text-indigo-600">5-10% (~7 questions)</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800">Laboratory Operations</h3>
              <p className="text-sm text-gray-600">5-10% (~5 questions)</p>
            </div>
          </div>

          <div className="text-center">
            <button 
              id="startExam" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
            >
              <i className="fas fa-play mr-2"></i>
              Start Practice Exam
            </button>
          </div>

          <div id="examArea" className="hidden mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span id="progressText" className="text-sm font-medium text-gray-600">0/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div id="progressBar" className="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
                </div>
              </div>
              
              <div id="questionArea">
                <div className="mb-4">
                  <span id="categoryBadge" className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"></span>
                  <span id="difficultyBadge" className="inline-block ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded"></span>
                </div>
                
                <h3 id="questionStem" className="text-lg font-medium mb-6 text-gray-800"></h3>
                
                <div id="optionsArea" className="space-y-3">
                  {/* Options will be populated here */}
                </div>
                
                <button id="submitAnswer" className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-300 disabled:opacity-50" disabled>
                  Submit Answer
                </button>
              </div>
              
              <div id="resultArea" className="hidden">
                <div id="answerFeedback" className="p-4 rounded-lg mb-4"></div>
                <button id="nextQuestion" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                  Next Question
                </button>
              </div>
              
              <div id="completionArea" className="hidden text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <i className="fas fa-trophy text-yellow-500 text-4xl mb-4"></i>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Exam Completed!</h3>
                  <p className="text-green-700 mb-4">You have completed all 100 questions.</p>
                  <button id="restartExam" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                    Start New Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default app
