# Copyright 2023, Battelle Energy Alliance, LLC
from typing import List, Set
from spinetoolbox.headless import headless_main
from spinetoolbox.main import _make_argument_parser
from multiprocessing import Process, Manager
from PySide6.QtCore import QCoreApplication
from io import StringIO
import sys
import logging


def run_spine(spine_dir, import_system):
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
    logging.debug('Starting Spine Toolbox with arguments %s.', str(args))
    spineproc = headless_main(args)
    logging.debug('Spine Toolbox workflow exited with code %d.', spineproc)
    QCoreApplication.exit()

class SpineToolbox:
    # PYTHON_PATH = 'spine/Spine-Toolbox/.venv/Scripts/python'
    # TOOLBOX_PATH = 'spine/Spine-Toolbox/spinetoolbox.py'

    def __init__(self, spine_dir: str):
        self.spine_dir = spine_dir

    def import_system(self) -> str:
        return self.run(import_system=True)

    def run(self, import_system: bool = False):
        p = Process(target=run_spine, args=(self.spine_dir, import_system, None))
        p.start()
        p.join()

        return []
    