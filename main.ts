import {getExecOutput} from '@actions/exec';
import {addPath, getInput, setOutput} from '@actions/core';
import {find, cacheDir, extractZip, downloadTool} from '@actions/tool-cache';

import {validate, get_godot_url, get_godot_bin} from './index';

const version = getInput('version') || '4.0.3';
const release = getInput('release') || 'stable';
const architecture = getInput('architecture') || 'linux.x86_64';
const godot_parameters = {version, release, architecture};

const cache_godot_bin = 'godot';
// const cache_export_templates = 'godot-export-templates';

validate(godot_parameters);

let godot_bin = '';
let godot_path = find(cache_godot_bin, version, architecture);

if (!godot_path) {
    const archive_path = await downloadTool(get_godot_url(godot_parameters));
    const extracted_path = await extractZip(archive_path);
    await cacheDir(extracted_path, cache_godot_bin, version, architecture);
    godot_bin = get_godot_bin(extracted_path, godot_parameters);
} else {
    godot_bin = get_godot_bin(godot_path, godot_parameters);
}

const {stdout, stderr, exitCode} = await getExecOutput(godot_bin, ['--version', '--exit']);

if (exitCode !== 0) {
    throw new Error(`Godot bin exit code != 0: ${stderr}`);
}
if (!stdout.includes(version)) {
    throw new Error(`Godot bin version mismatch: ${stdout}, expected ${version}`);
}

// let godot_export_templates = find(cache_export_templates, version, architecture);

// if (!godot_export_templates) {
//     const archive_path = await downloadTool(get_godot_export_templates_url(godot_parameters));
//     const extracted_path = await extractZip(archive_path);
//     await cacheDir(extracted_path, cache_export_templates, version, architecture);
// }

// await cp(godot_export_templates, get_godot_export_templates_path(godot_parameters));

addPath(godot_bin);
setOutput('godot_executable', godot_bin);
