import sudo from "sudo-prompt";
import fs from "node:fs";
import path from "node:path";
import {INSTALLATION_PATH} from "../index";
import {exec} from "child_process";

export const retrievePartitions = async () => {
    return new Promise((resolve, reject) => {
        sudo.exec("parted -lms", { name: "Partition Manager" }, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }

            const partitions = parsePartedOutput(stdout).filter(partition => partition.flags.includes("boot")
                || partition.flags.includes("esp"));

            resolve(partitions);
        });
    });
}
const parsePartedOutput = (input) => {
    const sections = input.split('BYT;\n').filter(section => section.trim() !== '');
    let partitions = [];
    sections.forEach(section => {
        const lines = section.split('\n').filter(line => line.trim() !== '');
        const diskInfo = lines[0].split(':');
        const disk = diskInfo[0].trim();
        const diskName = diskInfo[6].trim();

        for (let i = 1; i < lines.length; i++) {
            const partitionInfo = lines[i].split(':');
            const partition = parseInt(partitionInfo[0].trim());
            const start = partitionInfo[1].trim();
            const end = partitionInfo[2].trim();
            const size = partitionInfo[3].trim();
            const filesystem = partitionInfo[4].trim();
            const flags = partitionInfo[6].trim().replace(";","").split(",").map(flag => flag.trim());

            partitions.push({disk, name: diskName, partition, start, end, size, filesystem, flags});
        }
    });

    return partitions;
}

export const retrieveBootloaderMount = async () => {
    if (fs.existsSync(path.join(INSTALLATION_PATH, 'bootloader_installed'))) {
        return fs.readFileSync(path.join(INSTALLATION_PATH, 'bootloader_installed'), 'utf8');
    }

    return null;
}

export const retrieveEFIEntries = async () => {
    const bashCommand = '#!/bin/bash\n' +
        'json_array="["\n' +
        'while IFS= read -r line; do\n' +
        '    if [[ $line =~ Boot[0-9A-Fa-f]{4} ]]; then\n' +
        '        name=$(echo "$line" | grep -oP \'(?<=Boot[0-9A-Fa-f]{4}\\* )[^\\s]+\' | sed \'s/\\\\/\\\\\\\\/g\')\n' +
        '        uid=$(echo "$line" | grep -oP \'(?<=,GPT,)[0-9a-fA-F-]+\')\n' +
        '        path=$(echo "$line" | grep -oP \'(?<=File\\().*(?=\\))\' | sed \'s/\\\\/\\\\\\\\/g\')\n' +
        '        json_array+="{\\"name\\":\\"$name\\",\\"uid\\":\\"$uid\\",\\"path\\":\\"$path\\"},"\n' +
        '    fi\n' +
        'done < <(efibootmgr -v)\n' +
        'json_array="${json_array%,}]"\n' +
        'echo "$json_array"';

    fs.writeFileSync(path.join(INSTALLATION_PATH, 'efi_entries.sh'), bashCommand);

    return new Promise((resolve, reject) => {
        exec(`bash ${path.join(INSTALLATION_PATH, 'efi_entries.sh')}`, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }


            resolve(JSON.parse(stdout).map(entry => ({...entry, uid: entry.uid.toUpperCase()}))
                .filter(entry => entry.path.startsWith("\\EFI\\") && !entry.name.includes("Clover")));
        });
    });
}