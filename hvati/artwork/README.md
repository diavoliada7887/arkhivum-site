# Launcher artwork

The supplied hand/share illustration was separated from its dark plaque with the built-in image tool (background-extraction). Prompt: remove only the dark background, rounded plaque, outline and glow; retain the white/lavender share mark, peach hand and two action strokes unchanged, centered on transparency. Source output: `launcher-foreground-source.png`.

Launcher export uses a 108dp transparent foreground canvas. Visible artwork is centered and fitted inside a radius of 32dp (Android safe circle: 33dp). The adaptive background is the solid dark color `#10121e`. The central 72dp viewport is also exported as legacy 48/72/96/144/192px PNGs, with a separate circular legacy variant. Android owns the adaptive mask; no baked-in white frame or inset plaque is used.
