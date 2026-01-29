import https from 'https';
import { writeFileSync } from 'fs';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function getOgImage(owner, repo) {
  try {
    const res = await fetch(`https://github.com/${owner}/${repo}`);
    const match = res.data.match(/<meta property="og:image" content="([^"]+)"/);
    return match ? match[1] : null;
  } catch { return null; }
}

async function main() {
  console.log('Fetching repos from GitHub API...');
  const res = await fetch('https://api.github.com/users/unboxedjs/repos?per_page=100');
  const repos = JSON.parse(res.data);

  const filtered = repos.filter(r =>
    r.name !== 'unboxedjs.github.io' &&
    r.description &&
    r.description.includes('|')
  );

  console.log(`Found ${filtered.length} repos with "|" in description`);

  const results = [];
  for (const repo of filtered) {
    console.log(`Processing ${repo.name}...`);
    const [name, desc] = repo.description.split('|').map(s => s.trim());
    const image = await getOgImage('unboxedjs', repo.name);
    results.push({
      slug: repo.name,
      name,
      description: desc,
      language: repo.language,
      topics: repo.topics || [],
      updated: repo.updated_at,
      image
    });
  }

  writeFileSync('public/gh-blogs.json', JSON.stringify(results, null, 2));
  console.log('Written to public/gh-blogs.json:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
