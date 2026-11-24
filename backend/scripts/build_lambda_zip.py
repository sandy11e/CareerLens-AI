#!/usr/bin/env python3
"""Build a deterministic, Linux-compatible AWS Lambda ZIP for CareerLens-AI."""

from __future__ import annotations

import argparse
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
MAX_UNZIPPED_BYTES = 250 * 1024 * 1024
MAX_COMPRESSED_BYTES = 250 * 1024 * 1024


def copy_runtime_source(stage: Path) -> None:
    for item in BACKEND.iterdir():
        if item.is_file() and item.suffix == ".py" and not is_test_file(item.name):
            shutil.copy2(item, stage / item.name)
        elif item.is_dir() and item.name == "services":
            copy_python_tree(item, stage / item.name)


def is_test_file(name: str) -> bool:
    return name.startswith("test_") or name.endswith("_test.py")


def copy_python_tree(source: Path, destination: Path) -> None:
    for item in source.rglob("*"):
        if any(part in {"__pycache__", "tests", "test"} for part in item.parts):
            continue
        if item.is_file() and item.suffix == ".py" and not is_test_file(item.name):
            target = destination / item.relative_to(source)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)


def install_dependencies(stage: Path) -> None:
    command = [
        sys.executable,
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "--only-binary=:all:",
        "--target",
        str(stage),
        "-r",
        str(BACKEND / "requirements.txt"),
    ]
    subprocess.run(command, check=True)


def validate_staged_package(stage: Path) -> None:
    required = {
        "main.py",
        "config.py",
        "database.py",
        "worker.py",
        "services/s3_storage.py",
        "services/evaluation_queue.py",
    }
    missing = sorted(path for path in required if not (stage / path).is_file())
    if missing:
        raise RuntimeError(f"Required Lambda application files are missing: {', '.join(missing)}")

    # -S excludes the runner's site-packages so this checks that dependencies really
    # exist in the deployment staging directory. No application secrets are inherited.
    smoke_env = {
        "PATH": os.environ.get("PATH", ""),
        "PYTHONPATH": str(stage),
        "APP_ENV": "development",
        "AWS_REGION": "ap-southeast-2",
        "S3_RESUME_BUCKET": "careerlens-ai-resumes-unique-suffix",
    }
    for module in ("main", "worker"):
        subprocess.run(
            [
                sys.executable,
                "-S",
                "-c",
                f"import {module} as imported; assert callable(imported.handler)",
            ],
            cwd=stage,
            env=smoke_env,
            check=True,
        )


def create_zip(stage: Path, output: Path) -> int:
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(stage.rglob("*"), key=lambda p: p.relative_to(stage).as_posix()):
            if not path.is_file():
                continue
            relative = path.relative_to(stage)
            if any(part in {"__pycache__", "tests", "test", "bin"} for part in relative.parts):
                continue
            if path.suffix in {".pyc", ".pyo", ".backup"} or path.name.startswith(".env"):
                continue
            if is_test_file(path.name):
                continue
            info = zipfile.ZipInfo(relative.as_posix(), date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(info, path.read_bytes())

    with zipfile.ZipFile(output, "r") as archive:
        names = set(archive.namelist())
        missing = {"main.py", "config.py", "database.py", "worker.py", "services/s3_storage.py", "services/evaluation_queue.py"} - names
        if missing:
            raise RuntimeError(f"ZIP is missing required files: {', '.join(sorted(missing))}")
        forbidden = [
            name for name in names
            if name.startswith(("test_", "tests/", "__pycache__/"))
            or ".env" in Path(name).name
            or name.endswith((".pyc", ".pyo", ".backup"))
        ]
        if forbidden:
            raise RuntimeError(f"ZIP contains excluded development files: {', '.join(sorted(forbidden)[:10])}")
        uncompressed = sum(info.file_size for info in archive.infolist())
    if uncompressed > MAX_UNZIPPED_BYTES:
        raise RuntimeError(
            f"Uncompressed ZIP contents are {uncompressed} bytes; Lambda limit is {MAX_UNZIPPED_BYTES}."
        )
    compressed = output.stat().st_size
    if compressed > MAX_COMPRESSED_BYTES:
        raise RuntimeError(
            f"Compressed ZIP is {compressed} bytes; S3-backed Lambda package limit is {MAX_COMPRESSED_BYTES}."
        )
    return compressed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path, help="Destination ZIP path (use runner temp storage in CI).")
    args = parser.parse_args()

    if sys.version_info[:2] != (3, 12):
        raise SystemExit(f"Python 3.12 is required; running {sys.version.split()[0]}.")
    if not sys.platform.startswith("linux"):
        raise SystemExit("Lambda ZIP packaging must run on a Linux host to select Lambda-compatible native wheels.")
    if not (BACKEND / "requirements.txt").is_file():
        raise SystemExit(f"Backend requirements not found at {BACKEND / 'requirements.txt'}.")

    temp_parent = os.environ.get("RUNNER_TEMP")
    with tempfile.TemporaryDirectory(prefix="careerlens-lambda-", dir=temp_parent) as temporary:
        stage = Path(temporary) / "package"
        stage.mkdir()
        install_dependencies(stage)
        copy_runtime_source(stage)
        validate_staged_package(stage)
        size = create_zip(stage, args.output.resolve())

    print(f"Lambda ZIP: {args.output.resolve()}")
    print(f"Compressed size: {size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
