import {mv} from '@actions/io';
import {getExecOutput} from '@actions/exec';
import {getInput, setOutput} from '@actions/core';
import {find, cacheDir, extractZip, downloadTool} from '@actions/tool-cache';

import {validate, get_godot_url, get_godot_bin, get_godot_export_templates_url, get_godot_export_templates_path} from './index';

const version = getInput('version') || '4.0.3';
const release = getInput('release') || 'stable';
const architecture = getInput('architecture') || 'linux.x86_64';
const godot_parameters = {version, release, architecture};

const cache_godot_bin = 'godot';
const cache_export_templates = 'godot-export-templates';

validate(godot_parameters);

// Download godot

let godot_bin = '';
let godot_path = find(cache_godot_bin, version, architecture);

if (!godot_path) {
    const godot_url = get_godot_url(godot_parameters);
    console.log(`downloading ${godot_url}...`);
    const archive_path = await downloadTool(godot_url);
    console.log(`extracting ${archive_path}...`);
    const extracted_path = await extractZip(archive_path);
    console.log(`caching ${extracted_path}...`);
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

// Download export templates

let godot_export_templates = find(cache_export_templates, version, architecture);

if (!godot_export_templates) {
    const export_templates_url = get_godot_export_templates_url(godot_parameters);

    console.log(`downloading ${export_templates_url}...`);
    const archive_path = await downloadTool(export_templates_url);
    console.log(`extracting ${archive_path}...`);
    const extracted_path = await extractZip(archive_path);
    godot_export_templates = `${extracted_path}/templates/`;
    console.log(`caching ${godot_export_templates}...`);
    await cacheDir(godot_export_templates, cache_export_templates, version, architecture);
}

const godot_export_templates_path = get_godot_export_templates_path(godot_parameters);
console.log(`moving ${godot_export_templates} in ${godot_export_templates_path}...`);
await mv(godot_export_templates, godot_export_templates_path);

// Success

setOutput('godot_executable', godot_bin);
