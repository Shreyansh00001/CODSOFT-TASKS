import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.sqlite');
console.log(`[Database] Connecting to SQLite database at ${dbPath}`);

const db = new DatabaseSync(dbPath);

// Initialize DB schema
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schemaSql);
  console.log('[Database] Schema initialized successfully.');
  
  // Seed database if empty
  seedDatabase();
}

function seedDatabase() {
  // Check if members already exist
  const membersCountStmt = db.prepare('SELECT COUNT(*) as count FROM members');
  const result = membersCountStmt.all();
  const count = result[0].count;
  
  if (count > 0) {
    console.log('[Database] Database already has data. Skipping seeding.');
    return;
  }
  
  console.log('[Database] Seeding initial database data...');
  
  // 1. Seed Members
  const insertMember = db.prepare(
    'INSERT INTO members (name, email, avatar_color) VALUES (?, ?, ?)'
  );
  insertMember.run('Shreyansh Kumar', 'shreyansh@example.com', '#4f46e5'); // Indigo
  insertMember.run('Aditi Sharma', 'aditi@example.com', '#0d9488'); // Teal
  insertMember.run('Rohan Verma', 'rohan@example.com', '#ea580c'); // Orange
  insertMember.run('Priya Nair', 'priya@example.com', '#db2777'); // Pink

  // 2. Seed Projects
  const insertProject = db.prepare(
    'INSERT INTO projects (title, description, status, priority, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  const p1 = insertProject.run(
    'E-Commerce Re-platforming',
    'Modernize the retail experience by building a high-speed, secure web storefront. Complete checkout visual redesign and payment flows.',
    'In Progress',
    'High',
    '2026-06-01',
    '2026-08-30'
  );
  
  const p2 = insertProject.run(
    'Mobile App Integration',
    'Companion iOS and Android apps for order tracking, rider logistics, and live chat notifications.',
    'Planning',
    'Medium',
    '2026-07-01',
    '2026-10-15'
  );
  
  const p3 = insertProject.run(
    'AI Support Chatbot',
    'Integrate large language model support into customer helpdesk web widget to decrease agent response wait time.',
    'Completed',
    'High',
    '2026-05-01',
    '2026-06-15'
  );
  
  const p4 = insertProject.run(
    'Security Audit & SOC2',
    'Perform system vulnerability assessment and gather operational evidence templates for impending SOC2 audit compliance.',
    'On Hold',
    'Low',
    '2026-04-10',
    '2026-07-20'
  );

  // 3. Seed Tasks
  const insertTask = db.prepare(
    'INSERT INTO tasks (project_id, assignee_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  
  // E-Commerce Re-platforming (p1.lastInsertRowid = 1)
  insertTask.run(1, 4, 'Redesign Checkout Flow UX', 'Create high fidelity wireframes and user-testing for simplified 1-click checkout experience.', 'Done', 'High', '2026-06-10');
  insertTask.run(1, 1, 'Setup DB Schemas & Indexes', 'Implement SQLite backend migrations, create query indexes to optimize paginated products list API.', 'Done', 'High', '2026-06-15');
  insertTask.run(1, 3, 'Integrate Stripe Payment Gateway', 'Implement secure backend endpoint webhook handles and frontend Stripe checkout interface.', 'In Progress', 'High', '2026-06-30');
  insertTask.run(1, 2, 'Build Shopping Cart Logic', 'Develop context state for persistent cart storage, coupons application, and quantity discount calculations.', 'In Progress', 'Medium', '2026-07-05');
  insertTask.run(1, 4, 'Deploy Cypress E2E Test Suite', 'Configure end-to-end integration automated testing for authentication and checkout workflows.', 'To Do', 'Medium', '2026-07-20');
  insertTask.run(1, 1, 'SEO Optimization & Static Assets', 'Add structured meta-tags, image compression pipelines, and configure CDN caching headers.', 'To Do', 'Low', '2026-08-15');

  // Mobile App Integration (p2.lastInsertRowid = 2)
  insertTask.run(2, 1, 'Define API Tracking Contracts', 'Establish request-response REST structures for logistics coordinates and courier statuses.', 'In Progress', 'High', '2026-07-10');
  insertTask.run(2, 3, 'Setup Expo React Native Boilerplate', 'Initialize application environment and integrate Redux Toolkit and React Navigation libs.', 'To Do', 'Medium', '2026-07-25');

  // AI Support Chatbot (p3.lastInsertRowid = 3)
  insertTask.run(3, 2, 'Evaluate LLM Providers & Costs', 'Benchmark responses and token pricing for Anthropic Claude vs OpenAI GPT-4 API endpoints.', 'Done', 'High', '2026-05-10');
  insertTask.run(3, 1, 'Fine-tune FAQ Knowledge Base', 'Upload help articles and training document lists to vector store with chunking/embeddings.', 'Done', 'High', '2026-05-30');
  insertTask.run(3, 4, 'Embed Chatbot Widget UI', 'Build a floating floating chat overlay widget in React and connect socket streams.', 'Done', 'High', '2026-06-12');

  // 4. Seed Activities
  const insertActivity = db.prepare(
    'INSERT INTO activities (project_id, task_id, message) VALUES (?, ?, ?)'
  );
  insertActivity.run(null, null, 'Database initialized with demo members and projects.');
  insertActivity.run(1, null, 'Project "E-Commerce Re-platforming" was created by Administrator.');
  insertActivity.run(3, 9, 'Aditi Sharma completed task "Evaluate LLM Providers & Costs".');
  insertActivity.run(1, 3, 'Rohan Verma started work on "Integrate Stripe Payment Gateway".');
  insertActivity.run(1, 2, 'Shreyansh Kumar completed task "Setup DB Schemas & Indexes".');
  
  console.log('[Database] Seeding finished successfully.');
}

// Initialize tables and seed
initDatabase();

export default db;
