const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const SERVER = {
  host: '194.156.65.125',
  port: 22,
  username: 'root',
  password: 'YnteGRK=pz$_Ws',
  remotePath: '/var/www/nadya',
  readyTimeout: 15000
};

const skipFiles = ['britvology.mp4'];

const files = [
  { local: 'index.html', remote: 'index.html' },
  { local: 'another.html', remote: 'another.html' },
  { local: 'recommend.html', remote: 'recommend.html' },
  { local: 'style.css', remote: 'style.css' },
  { local: 'script.js', remote: 'script.js' },
  { local: 'img', remote: 'img', isDir: true },
];

function execCmd(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => out += d);
      stream.stderr.on('data', d => out += d);
      stream.on('close', () => resolve(out));
    });
  });
}

function sftpStat(sftp, remotePath) {
  return new Promise((resolve) => {
    sftp.stat(remotePath, (err, stats) => {
      if (err) resolve(null);
      else resolve(stats);
    });
  });
}

function sftpUpload(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(localPath);
    sftp.writeFile(remotePath, content, (err) => {
      if (err) return reject(err);
      console.log(`  ${remotePath} (${(content.length/1024).toFixed(0)} KB)`);
      resolve();
    });
  });
}

async function uploadDir(conn, sftp, localDir, remoteDir) {
  await execCmd(conn, `mkdir -p ${remoteDir}`);
  const entries = fs.readdirSync(localDir).filter(e => !skipFiles.includes(e));
  let uploaded = 0, skipped = 0;

  for (const entry of entries) {
    const localEntryPath = path.join(localDir, entry);
    const remoteEntryPath = `${remoteDir}/${entry}`;
    const stat = fs.statSync(localEntryPath);

    if (stat.isDirectory()) {
      const sub = await uploadDir(conn, sftp, localEntryPath, remoteEntryPath);
      uploaded += sub.uploaded;
      skipped += sub.skipped;
    } else {
      const remoteStat = await sftpStat(sftp, remoteEntryPath);
      if (remoteStat && remoteStat.size === stat.size) {
        skipped++;
        continue;
      }
      await sftpUpload(sftp, localEntryPath, remoteEntryPath);
      uploaded++;
    }
  }
  return { uploaded, skipped };
}

const conn = new Client();

conn.on('ready', async () => {
  console.log('Connected!');

  try {
    await execCmd(conn, `mkdir -p ${SERVER.remotePath}`);

    conn.sftp(async (err, sftp) => {
      if (err) { console.error('SFTP error:', err); conn.end(); return; }

      let totalUploaded = 0, totalSkipped = 0;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const localPath = path.resolve(__dirname, f.local);
        const remotePath = `${SERVER.remotePath}/${f.remote}`;

        if (!fs.existsSync(localPath)) {
          console.warn(`[SKIP] ${f.local} not found`);
          continue;
        }

        const stat = fs.statSync(localPath);
        if (stat.isDirectory()) {
          console.log(`[${i+1}/${files.length}] Checking dir: ${f.local}/`);
          const result = await uploadDir(conn, sftp, localPath, remotePath);
          totalUploaded += result.uploaded;
          totalSkipped += result.skipped;
        } else {
          const remoteStat = await sftpStat(sftp, remotePath);
          if (remoteStat && remoteStat.size === stat.size) {
            console.log(`[${i+1}/${files.length}] ${f.local} — unchanged`);
            totalSkipped++;
            continue;
          }
          console.log(`[${i+1}/${files.length}] Uploading: ${f.local}`);
          await sftpUpload(sftp, localPath, remotePath);
          totalUploaded++;
        }
      }

      console.log(`Done! Uploaded: ${totalUploaded}, Skipped: ${totalSkipped}`);
      conn.end();

      // Push to GitHub
      console.log('\nPushing to GitHub...');
      const { execSync } = require('child_process');
      try {
        execSync('git add -A && git status --short', { stdio: 'inherit' });
        const status = execSync('git status --porcelain').toString().trim();
        if (status) {
          const msg = `deploy: ${new Date().toLocaleString('ru-RU')}`;
          execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
        }
        execSync('git push origin master', { stdio: 'inherit' });
        console.log('GitHub push done!');
      } catch (err) {
        console.error('GitHub push error:', err.message);
      }
    });
  } catch (err) {
    console.error('Error:', err);
    conn.end();
  }
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect(SERVER);