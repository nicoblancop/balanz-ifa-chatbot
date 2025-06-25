const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { knowledgeBase, queryLogs, queryFrequency, queryClusters } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'nicoblancop'; // Replace with your GitHub username
    const REPO_NAME = 'balanz-ifa-chatbot';
    const DATABASE_PATH = 'database.json';

    try {
        // Get file SHA
        const getFileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATABASE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        let sha;
        if (getFileResponse.status === 404) {
            // File doesn't exist, will create it
        } else if (!getFileResponse.ok) {
            throw new Error(`HTTP ${getFileResponse.status}: Failed to fetch SHA`);
        } else {
            const fileData = await getFileResponse.json();
            sha = fileData.sha;
        }

        // Update or create file
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATABASE_PATH}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Update database.json ${new Date().toISOString()}`,
                content: Buffer.from(JSON.stringify({ knowledgeBase, queryLogs, queryFrequency, queryClusters }, null, 2)).toString('base64'),
                sha: sha || undefined
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`HTTP ${updateResponse.status}: Failed to update database`);
        }
        res.status(200).json({ message: 'Database updated' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
