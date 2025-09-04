#!/usr/bin/env python3
"""
Build script for ResDEEDS FastAPI backend using PyInstaller.

This script automates the process of creating a standalone executable
from the FastAPI backend that can run without Python installed.
"""

import os
import sys
import shutil
import subprocess
import platform
from pathlib import Path
import argparse
import json


def get_platform_info():
    """Get platform-specific information for the build."""
    system = platform.system().lower()
    machine = platform.machine().lower()
    
    platform_map = {
        'windows': 'win',
        'darwin': 'mac',
        'linux': 'linux'
    }
    
    arch_map = {
        'x86_64': 'x64',
        'amd64': 'x64',
        'arm64': 'arm64',
        'aarch64': 'arm64'
    }
    
    platform_name = platform_map.get(system, system)
    arch_name = arch_map.get(machine, machine)
    
    return {
        'system': system,
        'platform': platform_name,
        'arch': arch_name,
        'full_name': f"{platform_name}-{arch_name}"
    }


def check_dependencies():
    """Check if required build dependencies are available."""
    try:
        import PyInstaller
        print(f"✓ PyInstaller {PyInstaller.__version__} found")
    except ImportError:
        print("✗ PyInstaller not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✓ PyInstaller installed")
    
    # Check if uv is available for dependency management
    uv_available = shutil.which('uv') is not None
    if uv_available:
        print("✓ uv found - using for dependency management")
    else:
        print("✓ Using pip for dependency management")
    
    return uv_available


def install_dependencies(use_uv=False):
    """Install dependencies for the backend."""
    print("Installing backend dependencies...")
    
    if use_uv:
        # Use uv for faster dependency installation
        subprocess.check_call(["uv", "sync"])
    else:
        # Install from requirements.txt if it exists, otherwise from pyproject.toml
        if Path("requirements.txt").exists():
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        else:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-e", "."])
    
    print("✓ Dependencies installed")


def clean_build_artifacts():
    """Clean previous build artifacts."""
    artifacts = ['build', 'dist', '__pycache__', '*.spec.bak']
    
    for artifact in artifacts:
        if '*' in artifact:
            # Handle glob patterns
            import glob
            for path in glob.glob(artifact):
                if os.path.isfile(path):
                    os.remove(path)
                    print(f"✓ Removed {path}")
        else:
            path = Path(artifact)
            if path.exists():
                if path.is_dir():
                    shutil.rmtree(path)
                    print(f"✓ Removed directory {path}")
                else:
                    path.unlink()
                    print(f"✓ Removed file {path}")


def build_executable(platform_info, debug=False, clean=True):
    """Build the executable using PyInstaller."""
    if clean:
        print("Cleaning previous build artifacts...")
        clean_build_artifacts()
    
    print(f"Building executable for {platform_info['full_name']}...")
    
    # PyInstaller command
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "resdeeds-backend.spec",
        "--noconfirm",  # Overwrite output directory
    ]
    
    # Note: Console/windowed settings are defined in the .spec file
    # Cannot use --windowed when a .spec file is provided
    
    # Run PyInstaller
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✓ PyInstaller build completed successfully")
        if result.stdout:
            print("Build output:", result.stdout)
    except subprocess.CalledProcessError as e:
        print("✗ PyInstaller build failed")
        print("Error output:", e.stderr)
        sys.exit(1)
    
    return True


def verify_build(platform_info):
    """Verify that the build was successful."""
    system = platform_info['system']
    
    if system == 'windows':
        exe_name = 'resdeeds-backend.exe'
    else:
        exe_name = 'resdeeds-backend'
    
    exe_path = Path('dist') / exe_name
    
    if not exe_path.exists():
        print(f"✗ Executable not found at {exe_path}")
        return False
    
    # Check file size (should be substantial for a PyPSA bundle)
    file_size = exe_path.stat().st_size
    size_mb = file_size / (1024 * 1024)
    
    if size_mb < 10:  # Expect at least 10MB for a PyPSA bundle
        print(f"⚠ Warning: Executable size is only {size_mb:.1f}MB, which seems small")
    else:
        print(f"✓ Executable created: {exe_path} ({size_mb:.1f}MB)")
    
    # Make executable on Unix systems
    if system != 'windows':
        exe_path.chmod(0o755)
        print("✓ Executable permissions set")
    
    return True


def create_version_file(platform_info):
    """Create a version file for the build."""
    version_info = {
        'version': '0.1.0',
        'build_platform': platform_info['full_name'],
        'build_time': str(subprocess.check_output(['date'], text=True).strip()),
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
    }
    
    # Try to get git commit info
    try:
        git_hash = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], text=True).strip()
        version_info['git_commit'] = git_hash
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    version_file = Path('dist') / 'version.json'
    with open(version_file, 'w') as f:
        json.dump(version_info, f, indent=2)
    
    print(f"✓ Version file created: {version_file}")


def main():
    """Main build function."""
    parser = argparse.ArgumentParser(description='Build ResDEEDS backend executable')
    parser.add_argument('--debug', action='store_true', help='Build with debug information')
    parser.add_argument('--no-clean', action='store_true', help='Skip cleaning build artifacts')
    parser.add_argument('--no-deps', action='store_true', help='Skip dependency installation')
    parser.add_argument('--verify-only', action='store_true', help='Only verify existing build')
    
    args = parser.parse_args()
    
    # Change to the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("ResDEEDS Backend Build Script")
    print("=" * 40)
    
    platform_info = get_platform_info()
    print(f"Platform: {platform_info['full_name']}")
    print(f"Python: {sys.version}")
    print()
    
    if args.verify_only:
        success = verify_build(platform_info)
        sys.exit(0 if success else 1)
    
    # Check and install dependencies
    if not args.no_deps:
        use_uv = check_dependencies()
        install_dependencies(use_uv)
        print()
    
    # Build the executable
    success = build_executable(
        platform_info, 
        debug=args.debug, 
        clean=not args.no_clean
    )
    
    if success:
        # Verify the build
        verify_success = verify_build(platform_info)
        
        if verify_success:
            # Create version file
            create_version_file(platform_info)
            print()
            print("🎉 Backend build completed successfully!")
            print(f"Executable available in: {Path('dist').absolute()}")
        else:
            print("✗ Build verification failed")
            sys.exit(1)
    else:
        print("✗ Build failed")
        sys.exit(1)


if __name__ == '__main__':
    main()