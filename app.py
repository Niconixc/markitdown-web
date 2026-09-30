import os
import tempfile
import time
import traceback
from pathlib import Path
import streamlit as st
from markitdown import MarkItDown

st.set_page_config(
    page_title="MarkItDown Web UI",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("📝 MarkItDown Web UI")
st.caption("Convierte fácilmente documentos, audios, imágenes y páginas web a Markdown estructurado.")

# Sidebar Settings
st.sidebar.header("⚙️ Configuración")
enable_plugins = st.sidebar.checkbox("Habilitar plugins de terceros", value=False)

# Optional LLM integration
st.sidebar.subheader("🤖 Soporte LLM (Opcional)")
use_llm = st.sidebar.checkbox("Usar LLM para OCR / descripciones", value=False)
openai_api_key = ""
llm_model = "gpt-4o"

if use_llm:
    openai_api_key = st.sidebar.text_input(
        "OpenAI API Key",
        type="password",
        value=os.getenv("OPENAI_API_KEY", ""),
        help="Clave para extraer texto de imágenes y describir contenido visual",
    )
    llm_model = st.sidebar.selectbox("Modelo LLM", ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"])

st.sidebar.markdown("---")
st.sidebar.markdown("""
### 📌 Formatos soportados:
- **Documentos:** PDF, DOCX, PPTX, XLSX, XLS
- **Texto / Datos:** TXT, CSV, JSON, XML, HTML
- **Multimedia:** Imágenes (JPG, PNG con EXIF/OCR), Audio (WAV, MP3)
- **Comprimidos:** ZIP
- **Web:** Enlaces HTTP/HTTPS, Wikipedia, YouTube
""")

# Initialize MarkItDown engine
@st.cache_resource
def get_markitdown_instance(plugins_enabled: bool, api_key: str, model: str):
    llm_client = None
    if api_key:
        try:
            from openai import OpenAI
            llm_client = OpenAI(api_key=api_key)
        except Exception as e:
            st.sidebar.error(f"Error al inicializar cliente OpenAI: {e}")

    return MarkItDown(
        enable_plugins=plugins_enabled,
        llm_client=llm_client,
        llm_model=model if llm_client else None,
    )

md = get_markitdown_instance(
    plugins_enabled=enable_plugins,
    api_key=openai_api_key if use_llm else "",
    model=llm_model,
)

tab_file, tab_url = st.tabs(["📁 Subir Archivo", "🌐 Convertir desde URL"])

# Tab 1: Subir Archivo
with tab_file:
    uploaded_files = st.file_uploader(
        "Arrastra o selecciona uno o más archivos",
        accept_multiple_files=True,
        help="Soporta PDF, Word, Excel, PowerPoint, imágenes, audio, etc.",
    )

    if uploaded_files:
        for idx, uploaded_file in enumerate(uploaded_files):
            file_name = uploaded_file.name
            file_suffix = Path(file_name).suffix
            
            with st.expander(f"📄 Archivo: {file_name}", expanded=(idx == 0)):
                col_btn, col_info = st.columns([1, 4])
                
                with col_info:
                    st.write(f"**Tamaño:** {uploaded_file.size / 1024:.1f} KB")

                # Perform conversion
                with st.spinner(f"Convirtiendo {file_name}..."):
                    start_time = time.time()
                    tmp_path = None
                    try:
                        upload_dir = Path(__file__).parent / ".tmp"
                        upload_dir.mkdir(parents=True, exist_ok=True)

                        with tempfile.NamedTemporaryFile(dir=upload_dir, delete=False, suffix=file_suffix) as tmp_file:
                            tmp_file.write(uploaded_file.getvalue())
                            tmp_path = tmp_file.name

                        result = md.convert(tmp_path)
                        elapsed = time.time() - start_time

                        markdown_content = result.markdown
                        
                        if result.title:
                            st.subheader(f"Título detectado: {result.title}")

                        st.success(f"Conversión completada en {elapsed:.2f} s ({len(markdown_content)} caracteres)")

                        preview_col, raw_col = st.tabs(["👁️ Vista Previa", "💻 Código Markdown"])

                        with preview_col:
                            st.markdown(markdown_content)

                        with raw_col:
                            st.code(markdown_content, language="markdown")

                        st.download_button(
                            label=f"⬇️ Descargar {Path(file_name).stem}.md",
                            data=markdown_content,
                            file_name=f"{Path(file_name).stem}.md",
                            mime="text/markdown",
                            key=f"download_{file_name}_{idx}",
                        )

                    except Exception as ex:
                        st.error(f"Error al procesar el archivo: {ex}")
                        with st.expander("Detalles del error"):
                            st.code(traceback.format_exc())
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            try:
                                os.remove(tmp_path)
                            except Exception:
                                pass

# Tab 2: Convertir desde URL
with tab_url:
    url_input = st.text_input(
        "Ingresa una URL válida (web, artículo, video de YouTube, etc.)",
        placeholder="https://en.wikipedia.org/wiki/Markdown",
    )
    if st.button("Convertir URL", type="primary"):
        if not url_input.strip():
            st.warning("Por favor ingresa una URL.")
        else:
            with st.spinner("Descargando y convirtiendo contenido..."):
                start_time = time.time()
                try:
                    result = md.convert(url_input.strip())
                    elapsed = time.time() - start_time
                    markdown_content = result.markdown

                    if result.title:
                        st.subheader(f"Título: {result.title}")

                    st.success(f"Conversión completada en {elapsed:.2f} s")

                    preview_col, raw_col = st.tabs(["👁️ Vista Previa", "💻 Código Markdown"])

                    with preview_col:
                        st.markdown(markdown_content)

                    with raw_col:
                        st.code(markdown_content, language="markdown")

                    st.download_button(
                        label="⬇️ Descargar resultado.md",
                        data=markdown_content,
                        file_name="url_converted.md",
                        mime="text/markdown",
                    )
                except Exception as ex:
                    st.error(f"Error al convertir la URL: {ex}")
