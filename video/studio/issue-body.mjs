// Prints the body of an approval issue for a video script (docs/video.md §10).
// Used by the scheduled task "Video-publicatie": node video/studio/issue-body.mjs /tmp/v.json
import fs from 'node:fs';
import { issueBody, validate } from './youtube.mjs';

const video = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const errors = validate(video);
if (errors.length) { console.error(errors.join(' ')); process.exit(1); }
process.stdout.write(issueBody(video) + '\n');
