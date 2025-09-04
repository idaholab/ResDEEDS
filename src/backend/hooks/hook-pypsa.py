# PyInstaller hook for PyPSA
# This hook ensures that PyPSA's data files are properly included in the bundle

from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Collect all data files from pypsa package using PyInstaller's built-in method
datas = collect_data_files('pypsa')

# Collect submodules to ensure all pypsa modules are included
hiddenimports = collect_submodules('pypsa')