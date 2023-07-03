import {join} from 'path';

const mirror = 'https://github.com/godotengine/godot/releases/download';
const versions = ['4.0', '4.0.1', '4.0.2', '4.0.3'];
const architectures = ['win32.exe', 'win64.exe', 'linux.x86_32', 'linux.x86_64', 'macos.universal'];

interface Parameters {
    version: string;
    release: string;
    architecture: string;
}

export const validate = ({version, release, architecture}: Parameters) => {
    const runner_os = process.env.RUNNER_OS as 'macOS' | 'Linux' | 'Windows';

    if (!versions.includes(version)) {
        console.warn(`Godot version ${version} not supported`);
    }
    if (!architectures.includes(architecture)) {
        console.warn(`Godot architecture ${architecture} not supported`);
    }
    if (
        (runner_os === 'macOS' && !architecture.includes('macos')) ||
        (runner_os === 'Linux' && !architecture.includes('linux')) ||
        (runner_os === 'Windows' && !architecture.includes('win'))
    ) {
        console.warn(`Godot architecture ${architecture} won't run on this runner OS ${runner_os}`);
    }
    return true;
};

export const get_godot_bin = (godot_path: string, {version, release, architecture}: Parameters) => {
    if (architecture.startsWith('macos')) {
        return join(godot_path, `Godot.app/Contents/MacOS/Godot`);
    } else if (architecture.startsWith('linux')) {
        return join(godot_path, `Godot_v${version}-${release}_${architecture}`);
    }
    throw new Error(`get_godot_bin: godot binary not found at path ${godot_path} for version: ${version}, release: ${release}, architecture: ${architecture}`);
};

export const get_godot_url = ({version, release, architecture}: Parameters) => {
    return `${mirror}/${version}-${release}/Godot_v${version}-${release}_${architecture}.zip`;
};

export const get_godot_export_templates_url = ({version, release}: Parameters) => {
    return `${mirror}/${version}-${release}/Godot_v${version}-${release}_export_templates.tpz`;
};

export const get_godot_export_templates_path = ({version, release, architecture}: Parameters) => {
    if (architecture.startsWith('macos')) {
        return `/Users/runner/Library/Application Support/Godot/export_templates/${version}.${release}`;
    } else if (architecture.startsWith('linux')) {
        return `/home/runner/.local/share/godot/templates/${version}.${release}`;
    }
    throw new Error(`get_godot_export_templates_path: not found, version: ${version}, release: ${release}, architecture: ${architecture}`);
};
