#!/usr/bin/env python3

import os
import pathlib
import argparse
import subprocess

def parse_arguments():
    usage = "./build_conda.py"

    parser = argparse.ArgumentParser(usage, description="Build conda package")
    o_hlp = "Folder for output files (will be created if doesn't exist)"

    parser.add_argument("-b", "--binary_path",
                        required=True,
                        help="Path to binary file you want to build package for")
    return parser.parse_args()

ROOT_PATH = str(pathlib.Path(os.path.dirname(os.path.realpath(__file__))))
BINARY_FOLDER_PATH = os.path.join(ROOT_PATH, 'conda', 'binary')

def main():
    args = parse_arguments()

    subprocess.call(f"rm -rf {BINARY_FOLDER_PATH}/*", shell=True)

    command = f"cp -vR {args.binary_path} {BINARY_FOLDER_PATH}"
    ex_code = subprocess.call(command, shell=True)

    if (ex_code != 0):
        print(f"{command} \n returned status {ex_code}")
        exit(1)

    subprocess.call('conda build conda/', shell=True)


if __name__ == '__main__':
    main()
