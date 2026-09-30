#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ ! -d ".venv" ]; then
    echo "Creando entorno virtual..."
    uv venv --python /usr/local/bin/python3.11 .venv
    uv pip install -e 'packages/markitdown[all]' -e 'packages/markitdown-mcp' streamlit
fi

export STREAMLIT_CONFIG_DIR="$DIR/.streamlit"
echo "Iniciando interfaz web de MarkItDown en http://localhost:8501..."
.venv/bin/streamlit run app.py --server.port 8501 --browser.gatherUsageStats false
