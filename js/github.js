
export const GithubUpload = {
  base: window.UPLOAD_ENDPOINT || null,
  async upload(kind, id, file){
    if (!this.base) throw new Error("UPLOAD_ENDPOINT not configured");
    const form = new FormData();
    form.append("kind", kind); form.append("id", id); form.append("file", file);
    const res = await fetch(this.base + "/upload", { method:"POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json();
  },
  async remove(path, sha){
    if (!this.base) throw new Error("UPLOAD_ENDPOINT not configured");
    const res = await fetch(this.base + "/delete", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ path, sha })
    });
    if (!res.ok) throw new Error("Delete failed");
    return await res.json();
  }
};
window.GithubUpload = GithubUpload; // expose
