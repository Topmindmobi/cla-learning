#!/usr/bin/env ruby
# Push project files to GitHub via API using curl.
# Usage: GITHUB_TOKEN=ghp_xxx ruby scripts/push-github.rb
#    or: GITHUB_TOKEN_FILE=/tmp/cla-gh-token ruby scripts/push-github.rb

require "json"
require "base64"
require "pathname"
require "tmpdir"
require "open3"

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

root = Pathname.new(__dir__).join("..").expand_path
token = ENV["GITHUB_TOKEN"].to_s
if token.empty? && ENV["GITHUB_TOKEN_FILE"]
  token = File.read(ENV["GITHUB_TOKEN_FILE"]).strip
end
owner = ENV.fetch("GITHUB_OWNER", "Topmindmobi")
repo = ENV.fetch("GITHUB_REPO", "cla-learning")
branch = ENV.fetch("GITHUB_BRANCH", "main")
message = ENV.fetch(
  "COMMIT_MESSAGE",
  "Fix super-admin routing, account UI, and admin role handling",
)

abort "Set GITHUB_TOKEN or GITHUB_TOKEN_FILE first (repo scope)." if token.empty?

SKIP_DIRS = %w[node_modules .next .git .vercel].freeze
SKIP_FILES = %w[.env.local .DS_Store].freeze
TEXT_EXT = %w[
  .ts .tsx .js .jsx .mjs .cjs .json .css .md .html .svg .txt .yml .yaml .toml
  .sql .example .gitignore .node-version
].freeze

def walk(dir, files = [])
  Dir.children(dir).sort.each do |name|
    next if SKIP_DIRS.include?(name)
    next if SKIP_FILES.include?(name)
    next if name.end_with?(".zip")
    full = File.join(dir, name)
    if File.directory?(full)
      walk(full, files)
    else
      files << full
    end
  end
  files
end

def text_file?(path)
  name = File.basename(path)
  return true if name == "README" || name.start_with?(".")
  TEXT_EXT.any? { |ext| name.end_with?(ext) }
end

def gh(token, path, method: "GET", body: nil, retries: 6)
  uri = "https://api.github.com#{path}"
  attempt = 0
  loop do
    attempt += 1
    body_file = nil
    cmd = [
      "curl", "-sS",
      "-X", method,
      "-H", "Authorization: Bearer #{token}",
      "-H", "Accept: application/vnd.github+json",
      "-H", "X-GitHub-Api-Version: 2022-11-28",
      "-H", "Content-Type: application/json",
      "-w", "\n__HTTP__:%{http_code}",
    ]
    if body
      body_file = File.join(Dir.tmpdir, "cla-gh-body-#{Process.pid}-#{attempt}.json")
      File.write(body_file, JSON.generate(body))
      cmd += ["--data-binary", "@#{body_file}"]
    end
    cmd << uri
    out, err, status = Open3.capture3(*cmd)
    File.delete(body_file) if body_file && File.exist?(body_file)
    out = out.to_s.force_encoding("UTF-8").scrub
    err = err.to_s.force_encoding("UTF-8").scrub

    http = out[/__HTTP__:(\d+)\z/, 1].to_i
    payload = out.sub(/\n__HTTP__:\d+\z/, "")
    data = begin
      payload.empty? ? {} : JSON.parse(payload)
    rescue StandardError
      { "raw" => payload[0, 400] }
    end

    return data if status.success? && http.between?(200, 299)

    retriable = [408, 429, 500, 502, 503, 504].include?(http) ||
                http == 400 ||
                err.to_s.match?(/Connection refused|timed out|TLS|SSL|curl: \(7\)|curl: \(28\)|curl: \(35\)/i)
    detail = data.is_a?(Hash) ? (data["message"] || data["raw"] || data) : data
    if attempt >= retries || !retriable
      raise "GitHub API failed #{method} #{path} HTTP #{http}: #{detail} #{err}"
    end
    sleep(1.2 * attempt)
  end
end

files = walk(root.to_s)
puts "Uploading #{files.length} files to #{owner}/#{repo}…"

blobs = []
files.each_with_index do |file, i|
  path = Pathname.new(file).relative_path_from(root).to_s
  raw = File.binread(file)
  body = if text_file?(file)
           { content: raw.force_encoding("UTF-8"), encoding: "utf-8" }
         else
           { content: Base64.strict_encode64(raw), encoding: "base64" }
         end
  blob = gh(token, "/repos/#{owner}/#{repo}/git/blobs", method: "POST", body: body)
  blobs << { path: path, sha: blob["sha"], mode: "100644", type: "blob" }
  puts format("  [%3d/%3d] %s", i + 1, files.length, path)
rescue StandardError => e
  raise "#{e.message} (while uploading #{path})"
end

parent_sha = begin
  ref = gh(token, "/repos/#{owner}/#{repo}/git/ref/heads/#{branch}")
  ref.dig("object", "sha")
rescue StandardError => e
  warn "No existing #{branch} ref (#{e.message}); creating new history."
  nil
end

base_tree = nil
if parent_sha
  parent = gh(token, "/repos/#{owner}/#{repo}/git/commits/#{parent_sha}")
  base_tree = parent.dig("tree", "sha")
end

tree_body = { tree: blobs }
tree_body[:base_tree] = base_tree if base_tree
tree = gh(token, "/repos/#{owner}/#{repo}/git/trees", method: "POST", body: tree_body)

commit_body = { message: message, tree: tree["sha"] }
commit_body[:parents] = [parent_sha] if parent_sha
commit = gh(token, "/repos/#{owner}/#{repo}/git/commits", method: "POST", body: commit_body)

if parent_sha
  gh(token, "/repos/#{owner}/#{repo}/git/refs/heads/#{branch}", method: "PATCH", body: { sha: commit["sha"] })
else
  gh(token, "/repos/#{owner}/#{repo}/git/refs", method: "POST", body: {
    ref: "refs/heads/#{branch}",
    sha: commit["sha"],
  })
end

puts "\n✓ Pushed to https://github.com/#{owner}/#{repo}"
puts "  commit #{commit['sha']}"
puts "  https://github.com/#{owner}/#{repo}/commit/#{commit['sha']}"
