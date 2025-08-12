import { Octokit } from "octokit";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({ error: "Server not configured" });
    }
    const branch = GITHUB_BRANCH || "main";
    const { path, sha } = req.body || {};
    if (!path) return res.status(400).json({ error: "path missing" });

    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const message = `delete ${path}`;
    await octokit.rest.repos.deleteFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      message,
      sha: sha || undefined,
      branch
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "delete failed" });
  }
}
