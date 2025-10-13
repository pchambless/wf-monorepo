import { Octokit } from '@octokit/rest';
import logger from '../utils/logger.js';

const codeName = '[githubController.js]';

const REPO_OWNER = 'pchambless';
const REPO_NAME = 'wf-monorepo';

let octokit = null;

const getOctokit = () => {
  if (!octokit) {
    if (!process.env.GITHUB_TOKEN) {
      logger.error(`${codeName} GITHUB_TOKEN not found in environment variables`);
      throw new Error('GITHUB_TOKEN not configured');
    }
    logger.debug(`${codeName} Initializing Octokit with token (length: ${process.env.GITHUB_TOKEN.length})`);
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }
  return octokit;
};

export const getLabels = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const client = getOctokit();
    const { data } = await client.rest.issues.listLabelsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME
    });

    logger.info(`${codeName} Retrieved ${data.length} labels`);

    res.json({
      success: true,
      labels: data
    });

  } catch (error) {
    logger.error(`${codeName} Error fetching labels:`, error);

    res.status(500).json({
      success: false,
      error: 'GITHUB_LABELS_FETCH_FAILED',
      message: error.message
    });
  }
};

export const listIssues = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { state = 'open', labels, sort = 'created', direction = 'desc' } = req.query;

  try {
    const client = getOctokit();
    const params = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state,
      sort,
      direction,
      per_page: 100
    };

    if (labels) {
      params.labels = labels;
    }

    const { data } = await client.rest.issues.listForRepo(params);

    logger.info(`${codeName} Retrieved ${data.length} issues`);

    res.json({
      success: true,
      issues: data
    });

  } catch (error) {
    logger.error(`${codeName} Error fetching issues:`, error);

    res.status(500).json({
      success: false,
      error: 'GITHUB_ISSUES_FETCH_FAILED',
      message: error.message
    });
  }
};

export const createIssue = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { title, body, labels } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_TITLE',
      message: 'Issue title is required'
    });
  }

  try {
    const client = getOctokit();
    const { data } = await client.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title,
      body: body || '',
      labels: labels || []
    });

    logger.info(`${codeName} Created issue #${data.number}: ${title}`);

    res.json({
      success: true,
      issue: data
    });

  } catch (error) {
    logger.error(`${codeName} Error creating issue:`, error);

    res.status(500).json({
      success: false,
      error: 'GITHUB_ISSUE_CREATE_FAILED',
      message: error.message
    });
  }
};

export const getIssueComments = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { issue_number } = req.params;

  if (!issue_number) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_ISSUE_NUMBER',
      message: 'Issue number is required'
    });
  }

  try {
    const client = getOctokit();
    const { data } = await client.rest.issues.listComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: parseInt(issue_number)
    });

    logger.info(`${codeName} Retrieved ${data.length} comments for issue #${issue_number}`);

    res.json({
      success: true,
      comments: data
    });

  } catch (error) {
    logger.error(`${codeName} Error fetching comments for issue #${issue_number}:`, error);

    res.status(500).json({
      success: false,
      error: 'GITHUB_COMMENTS_FETCH_FAILED',
      message: error.message
    });
  }
};

export const uploadImage = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { image, filename } = req.body;

  if (!image) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_IMAGE',
      message: 'Image data is required'
    });
  }

  try {
    // GitHub doesn't provide a direct image upload API for issue attachments
    // The user-attachments URLs are only available through the web UI
    // Workaround: Use imgur or similar service, OR store in repo as blob

    // For MVP: Store in a special folder in the repo
    const client = getOctokit();
    const imageBuffer = Buffer.from(image.split(',')[1] || image, 'base64');
    const timestamp = Date.now();
    const imageName = filename || `screenshot-${timestamp}.png`;
    const path = `.github/issue-images/${imageName}`;

    // Create or update file in repo
    const { data } = await client.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: path,
      message: `Upload image for issue: ${imageName}`,
      content: imageBuffer.toString('base64'),
      branch: 'master'
    });

    // Return raw GitHub URL
    const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/${path}`;

    logger.info(`${codeName} Uploaded image: ${imageName} to ${path}`);

    res.json({
      success: true,
      url: imageUrl,
      markdown: `![${imageName}](${imageUrl})`
    });

  } catch (error) {
    logger.error(`${codeName} Error uploading image:`, error);

    res.status(500).json({
      success: false,
      error: 'GITHUB_IMAGE_UPLOAD_FAILED',
      message: error.message
    });
  }
};

export default {
  getLabels,
  listIssues,
  createIssue,
  getIssueComments,
  uploadImage
};
