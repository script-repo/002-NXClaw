import { copyFileSync, mkdirSync } from 'fs';
import { existsSync } from 'fs';
const dist = 'dist';
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
['styles.css', 'components.css'].forEach((f) => copyFileSync(`src/${f}`, `${dist}/${f}`));
