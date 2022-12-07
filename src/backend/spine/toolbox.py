import subprocess
from typing import List, Set

class SpineToolbox:
    PYTHON_PATH = 'spine/Spine-Toolbox/.venv/Scripts/python'
    TOOLBOX_PATH = 'spine/Spine-Toolbox/spinetoolbox.py'

    def __init__(self, spine_dir: str):
        self.spine_dir = spine_dir

    def import_system(self) -> str:
        return self.run(import_system=True)

    def run(self, import_system: bool = False) -> str:
        if not import_system:
            deselect = ['--deselect', 'import_system', 'merge_miracl', 'apply_hazards']
            select = []
        else:
            deselect = []
            select = ['--select', 'import_system', 'merge_miracl', 'apply_hazards']

        spine_cmd = [self.PYTHON_PATH, self.TOOLBOX_PATH, '--execute-only', self.spine_dir]
        spine_cmd.extend(deselect)
        spine_cmd.extend(select)
        print(f'Running Spine command {spine_cmd}')
        completed = subprocess.run(spine_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        return completed.stdout.decode().split('\n')