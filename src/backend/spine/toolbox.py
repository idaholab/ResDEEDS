from typing import List, Set
from spinetoolbox.headless import headless_main
from spinetoolbox.main import _make_argument_parser
from multiprocessing import Process, Manager
from PySide6.QtCore import QCoreApplication
from io import StringIO
import sys


def run_spine(spine_dir, import_system, manager):
    saved_stdout, saved_stderr = StringIO(), StringIO()
    sys.stdout, sys.stderr, saved_stdout, saved_stderr = saved_stdout, saved_stderr, sys.stdout, sys.stderr
    if not import_system:
        deselect = ['--deselect', 'import_system', 'merge_miracl', 'apply_hazards']
        select = []
    else:
        deselect = []
        select = ['--select', 'import_system', 'merge_miracl', 'apply_hazards']
    
    spine_cmd = ['--execute-only', spine_dir]

    spine_cmd.extend(deselect)
    spine_cmd.extend(select)
    parser = _make_argument_parser()
    args = parser.parse_args(spine_cmd)
    spineproc = headless_main(args)
    sys.stdout, sys.stderr, saved_stdout, saved_stderr = saved_stdout, saved_stderr, sys.stdout, sys.stderr
    manager.extend(saved_stdout.getvalue().split('\n'))
    QCoreApplication.exit()

class SpineToolbox:
    # PYTHON_PATH = 'spine/Spine-Toolbox/.venv/Scripts/python'
    # TOOLBOX_PATH = 'spine/Spine-Toolbox/spinetoolbox.py'

    def __init__(self, spine_dir: str):
        self.spine_dir = spine_dir

    def import_system(self) -> str:
        return self.run(import_system=True)

    def run(self, import_system: bool = False) -> str:
        with Manager() as manager:
            m = manager.list()
            p = Process(target=run_spine, args=(self.spine_dir, import_system, m))
            p.start()
            p.join()
            
            print(f'Running Spine command')
            return list(m)

            # completed = subprocess.run(spine_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            # return completed.stdout.decode().split('\n')