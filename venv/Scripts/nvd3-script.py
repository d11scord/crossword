#!C:\Users\������\Desktop\crossword\venv\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'python-nvd3==0.14.2','console_scripts','nvd3'
__requires__ = 'python-nvd3==0.14.2'
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('python-nvd3==0.14.2', 'console_scripts', 'nvd3')()
    )
