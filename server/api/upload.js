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

    // Read body as raw buffer (multipart form-data)
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on("data", d => chunks.push(d));
      req.on("end", resolve);
      req.on("error", reject);
    });
    const ct = req.headers["content-type"] || "";
    const m = ct.match(/boundary=(.*)$/);
    if (!m) return res.status(400).json({ error: "boundary missing" });
    const boundary = m[1];
    const buffer = Buffer.concat(chunks);

    function parseMultipart(buffer, boundary) {
      const parts = buffer.toString("binary").split("--" + boundary);
      const data = {};
      for (const part of parts) {
        if (part.indexOf("Content-Disposition") === -1) continue;
        const nameMatch = part.match(/name="([^"]+)"/);
        if (!nameMatch) continue;
        const name = nameMatch[1];
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const start = part.indexOf("\r\n\r\n");
        const end = part.lastIndexOf("\r\n");
        const content = part.slice(start + 4, end);
        if (filenameMatch) {
          data[name] = {
            filename: filenameMatch[1] || "upload.bin",
            content: Buffer.from(content, "binary")
          };
        } else {
          data[name] = content.trim();
        }
      }
      return data;
    }

    const form = parseMultipart(buffer, boundary);
    if (!form.file) return res.status(400).json({ error: "file missing" });
    const kind = (form.kind || "misc").toString();
    const id = (form.id || "unknown").toString();
    const now = Date.now();
    const safeName = (form.file.filename || "image").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `images/${kind}/${id}/${now}_${safeName}`;

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
      owner: GITHUB_OWNER, repo: GITHUB_REPO, ref: `heads/${branch}`
    });

    const contentBase64 = form.file.content.toString("base64");
    const { data: up } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      message: `upload ${path}`,
      content: contentBase64,
      branch
    });

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${path}`;
    res.status(200).json({ url: rawUrl, path, sha: up.content?.sha || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "upload failed" });
  }
}
