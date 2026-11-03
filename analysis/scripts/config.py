import os
import sys
import tempfile
import matplotlib as mpl
import matplotlib.pyplot as plt
import seaborn as sns

# Set writable Matplotlib config directory
os.environ['MPLCONFIGDIR'] = os.path.join(tempfile.gettempdir(), 'matplotlib_northair')
os.makedirs(os.environ['MPLCONFIGDIR'], exist_ok=True)

# Base Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'processed')
REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
CHARTS_DIR = os.path.join(REPORTS_DIR, 'charts')
VIS_STATIC_DIR = os.path.join(BASE_DIR, 'visualizations', 'static')
VIS_INTERACTIVE_DIR = os.path.join(BASE_DIR, 'visualizations', 'interactive')
VIS_EXPORTS_DIR = os.path.join(BASE_DIR, 'visualizations', 'exports')
ANALYTICS_OUTPUT_DIR = os.path.join(DATA_DIR, 'analytics')

# Color Palette: NorthAir Alpine Cleanroom & CPCB Statutory Palette
COLORS = {
    'primary': '#055237',       # Forest Green
    'primary_dark': '#033b27',
    'primary_light': '#286b4e',
    'secondary': '#BA6828',     # Warm Ochre
    'accent_amber': '#D97706',
    'accent_blue': '#2563EB',
    'accent_purple': '#7C3AED',
    'accent_teal': '#0D9488',
    'dark_text': '#202521',
    'muted_text': '#737B75',
    'border': '#E9EDE9',
    'bg_surface': '#FAFAF8',
    'white': '#FFFFFF',
    # Official CPCB AQI Category Colors
    'good': '#10B981',          # 0-50
    'satisfactory': '#059669',  # 51-100
    'moderate': '#EAB308',      # 101-200
    'poor': '#F97316',          # 201-300
    'very_poor': '#EF4444',     # 301-400
    'severe': '#7F1D1D',        # 401-500
    # State Colors
    'states': {
        'Delhi': '#DC2626',
        'Haryana': '#D97706',
        'Punjab': '#055237',
        'Chandigarh': '#2563EB',
        'Rajasthan': '#7C3AED'
    }
}

def set_scientific_style():
    """Configure matplotlib & seaborn for research-grade, publication-quality figures."""
    plt.style.use('default')
    mpl.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
    mpl.rcParams['font.family'] = 'sans-serif'
    mpl.rcParams['font.size'] = 10
    mpl.rcParams['axes.titlesize'] = 12
    mpl.rcParams['axes.titleweight'] = 'bold'
    mpl.rcParams['axes.labelsize'] = 10
    mpl.rcParams['axes.labelweight'] = 'medium'
    mpl.rcParams['xtick.labelsize'] = 9
    mpl.rcParams['ytick.labelsize'] = 9
    mpl.rcParams['legend.fontsize'] = 9
    mpl.rcParams['figure.titlesize'] = 14
    mpl.rcParams['figure.titleweight'] = 'bold'
    mpl.rcParams['axes.facecolor'] = '#FFFFFF'
    mpl.rcParams['figure.facecolor'] = '#FFFFFF'
    mpl.rcParams['axes.edgecolor'] = '#D1D5DB'
    mpl.rcParams['axes.linewidth'] = 0.8
    mpl.rcParams['grid.color'] = '#F3F4F6'
    mpl.rcParams['grid.linestyle'] = '--'
    mpl.rcParams['grid.linewidth'] = 0.6
    mpl.rcParams['axes.grid'] = True
    mpl.rcParams['axes.spines.top'] = False
    mpl.rcParams['axes.spines.right'] = False
    mpl.rcParams['savefig.dpi'] = 300
    mpl.rcParams['savefig.bbox'] = 'tight'
    mpl.rcParams['savefig.pad_inches'] = 0.2

def save_multiformat(fig, category_subfolder, base_filename, plotly_fig=None):
    """
    Save figure as high-res 300 DPI PNG, vector SVG, and interactive Plotly HTML.
    Returns dictionary of generated file paths.
    """
    category_dir = os.path.join(CHARTS_DIR, category_subfolder)
    os.makedirs(category_dir, exist_ok=True)
    os.makedirs(VIS_STATIC_DIR, exist_ok=True)
    os.makedirs(VIS_INTERACTIVE_DIR, exist_ok=True)
    os.makedirs(os.path.join(CHARTS_DIR, 'interactive'), exist_ok=True)

    # 1. 300 DPI PNG in reports/charts/<category>/
    png_path = os.path.join(category_dir, f"{base_filename}.png")
    fig.savefig(png_path, dpi=300, bbox_inches='tight')

    # Copy to visualizations/static/
    vis_png_path = os.path.join(VIS_STATIC_DIR, f"{base_filename}.png")
    fig.savefig(vis_png_path, dpi=300, bbox_inches='tight')

    # 2. Vector SVG
    svg_path = os.path.join(category_dir, f"{base_filename}.svg")
    fig.savefig(svg_path, format='svg', bbox_inches='tight')

    # 3. Interactive Plotly HTML if supplied
    html_path = None
    if plotly_fig is not None:
        html_path = os.path.join(CHARTS_DIR, 'interactive', f"{base_filename}.html")
        plotly_fig.write_html(html_path, include_plotlyjs='cdn')
        # Also copy to visualizations/interactive/
        vis_html_path = os.path.join(VIS_INTERACTIVE_DIR, f"{base_filename}.html")
        plotly_fig.write_html(vis_html_path, include_plotlyjs='cdn')

    plt.close(fig)
    return {
        'png': png_path,
        'svg': svg_path,
        'html': html_path
    }

def add_research_metadata(fig, title, question, source="Central Pollution Control Board (CPCB) CAAQMS Telemetry", note=""):
    """Adds uniform research attribution, research question and metadata headers to matplotlib figures."""
    fig.suptitle(title, fontsize=12, fontweight='bold', color=COLORS['dark_text'], y=0.98)
    # Subtitle with research question
    plt.figtext(0.5, 0.93, f"Research Question: {question}", ha='center', fontsize=9, style='italic', color=COLORS['muted_text'])
    # Footer with data source and methodological note
    footer_text = f"Data Source: {source}"
    if note:
        footer_text += f" | Note: {note}"
    plt.figtext(0.5, 0.01, footer_text, ha='center', fontsize=7.5, color=COLORS['muted_text'])

