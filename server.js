require('dotenv').config();
const express = require('express');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const isBinaryPath = require('is-binary-path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// --- SWAGGER IMPORTS ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/securityscanner';
// --- UI CONFIGURATION (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// --- SWAGGER ROUTE ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ==========================================
// 0. MONGODB SETUP & MODELS
// ==========================================

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const clientSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true }
});
const Client = mongoose.model('Client', clientSchema);

const scanResultSchema = new mongoose.Schema({
    scanId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    repository: { type: String, required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    totalIssues: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    details: { type: Array, default: [] }, 
    error: { type: String }
});
const ScanResult = mongoose.model('ScanResult', scanResultSchema);

// ... [Keep validateAuth, LIBRARY_PATTERNS, scanContent, getFiles functions exactly as before] ...
// (Omitting helper functions for brevity, assume they are here)

const validateAuth = async (req, res, next) => {
    try {
        const { apiKey, productName } = req.body;
        if (!apiKey || !productName) return res.status(400).json({ error: 'Authentication failed.' });
        const validClient = await Client.findOne({ apiKey, productName });
        if (!validClient) return res.status(401).json({ error: 'Invalid credentials.' });
        next();
    } catch (error) { res.status(500).json({ error: 'Internal Server Error' }); }
};

// ... [Keep Pattern Definitions and scanContent/getFiles logic] ...

// RE-ADD PATTERNS AND HELPERS FOR CONTEXT IF COPY-PASTING THE WHOLE FILE
const LIBRARY_PATTERNS = [
    { type: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
    { type: 'AWS Secret Key', regex: /aws_secret_access_key.{0,20}[0-9a-zA-Z\/+]{40}/i }, 
    { type: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
    { type: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/ },
    { type: 'Private Key', regex: /-----BEGIN [A-Z]+ PRIVATE KEY-----/ },
    { type: 'Stripe API Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
    { type: 'GitHub Token', regex: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/ }
];
const SUSPICIOUS_KEYWORDS = ['pass', 'pwd', 'passwd', 'secret', 'token', 'api_key', 'auth'];
const HEURISTIC_REGEX = new RegExp(`\\b(${SUSPICIOUS_KEYWORDS.join('|')})\\s*[:=]\\s*['"](.+?)['"]`, 'gi');
const IGNORED_FILES = ['package-lock.json', 'yarn.lock', '.DS_Store'];
const IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build', 'vendor'];

function scanContent(content, filePath) {
    const findings = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmedLine = line.trim();
        if (trimmedLine.length > 300) return; 
        LIBRARY_PATTERNS.forEach(pattern => {
            if (pattern.regex.test(line)) findings.push({ type: pattern.type, line: lineNum, snippet: trimmedLine });
        });
        const heuristicMatches = [...line.matchAll(HEURISTIC_REGEX)];
        heuristicMatches.forEach(match => findings.push({ type: 'Smart Heuristic Match', line: lineNum, description: `Suspicious assignment to variable '${match[1]}'`, snippet: trimmedLine }));
    });
    return findings;
}

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        if (IGNORED_DIRS.some(ignored => res.includes(path.sep + ignored))) return [];
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

// ==========================================
// 3. UI ROUTES (DASHBOARD)
// ==========================================

// (Keep Dashboard Routes as is)
app.get('/dashboard', async (req, res) => {
    // ... [Copy logic from previous response] ...
    try {
        const monthlyData = await ScanResult.aggregate([
            { $group: { _id: { year: { $year: "$timestamp" }, month: { $month: "$timestamp" } }, scanCount: { $sum: 1 }, issueCount: { $sum: "$totalIssues" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const productStats = await ScanResult.aggregate([
            { $group: { _id: "$productName", totalScans: { $sum: 1 }, totalIssues: { $sum: "$totalIssues" }, lastScan: { $max: "$timestamp" } } },
            { $sort: { totalIssues: -1 } }
        ]);
        const totalScans = productStats.reduce((acc, curr) => acc + curr.totalScans, 0);
        const totalIssues = productStats.reduce((acc, curr) => acc + curr.totalIssues, 0);
        const vulnerableProducts = productStats.filter(p => p.totalIssues > 0).length;

        res.render('dashboard', { stats: productStats, monthlyData, global: { totalScans, totalIssues, vulnerableProducts } });
    } catch (error) { res.status(500).send(error.message); }
});

app.get('/dashboard/view/:productName', async (req, res) => {
    try {
        const { productName } = req.params;
        const scans = await ScanResult.find({ productName }).sort({ timestamp: -1 });
        res.render('product_detail', { productName, scans });
    } catch (error) { res.status(500).send("Error loading product details"); }
});

// ==========================================
// 4. API ROUTES (WITH SWAGGER DOCS)
// ==========================================

/**
 * @swagger
 * /api/scan:
 * post:
 * summary: Scan a GitHub repository for secrets
 * tags: [Scanner]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ScanRequest'
 * responses:
 * 200:
 * description: The scan was successful
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * example: success
 * total_issues:
 * type: integer
 * example: 5
 * 400:
 * description: Missing parameters
 * 401:
 * description: Unauthorized
 */
app.post('/api/scan', validateAuth, async (req, res) => {
    // ... [Keep existing scan logic] ...
    const { repoUrl, productName } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });
    const scanId = uuidv4();
    const tempDir = path.join(__dirname, 'temp_clones', scanId);
    
    try {
        await fs.ensureDir(tempDir);
        const git = simpleGit();
        await git.clone(repoUrl, tempDir);
        const allFiles = await getFiles(tempDir);
        const results = [];
        let totalIssues = 0;
        await Promise.all(allFiles.map(async (filePath) => {
            const relativePath = path.relative(tempDir, filePath);
            if (IGNORED_FILES.includes(path.basename(filePath))) return;
            if (isBinaryPath(filePath)) return;
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const findings = scanContent(content, filePath);
                if (findings.length > 0) {
                    results.push({ file: relativePath, findings });
                    totalIssues += findings.length;
                }
            } catch (e) { }
        }));
        const report = new ScanResult({ scanId, productName, repository: repoUrl, status: 'Success', totalIssues, details: results });
        await report.save();
        res.json({ status: 'success', scanId, productName, repository: repoUrl, timestamp: report.timestamp, total_issues: totalIssues, details: results });
    } catch (error) {
        const failedReport = new ScanResult({ scanId, productName, repository: repoUrl, status: 'Failed', error: error.message });
        await failedReport.save();
        res.status(500).json({ error: error.message });
    } finally {
        await fs.remove(tempDir);
    }
});

/**
 * @swagger
 * /api/register-product:
 * post:
 * summary: Register a new product/user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/RegisterRequest'
 * responses:
 * 200:
 * description: Product registered successfully
 * 400:
 * description: Error creating product
 */
app.post('/api/register-product', async (req, res) => {
    try {
        const { productName, apiKey } = req.body;
        const newClient = new Client({ productName, apiKey });
        await newClient.save();
        res.json({ message: 'Product registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/history/{productName}:
 * get:
 * summary: Get scan history for a product
 * tags: [History]
 * parameters:
 * - in: path
 * name: productName
 * schema:
 * type: string
 * required: true
 * description: Name of the product
 * responses:
 * 200:
 * description: List of past scans
 */
app.get('/api/history/:productName', async (req, res) => {
    try {
        const history = await ScanResult.find({ productName: req.params.productName }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Scanner running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
    console.log(`📑 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
});