import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.figure(figsize=(12, 6))
ax = plt.gca()
ax.set_xlim(0, 14)
ax.set_ylim(0, 6)
ax.axis("off")

# --- Helper function to draw labeled boxes ---
def add_box(x, y, w, h, label, color="#D9EAD3", text_color="black", fontsize=11):
    rect = patches.FancyBboxPatch((x, y), w, h,
                                  boxstyle="round,pad=0.02",
                                  fc=color, ec="black", lw=1.2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, label, color=text_color, ha="center", va="center", fontsize=fontsize)

# --- Input and Encoder ---
add_box(0.5, 2.2, 1.5, 1, "Input Image\n(128×128 Radio Map)", "#FFF2CC")
add_box(2.5, 2.2, 1.8, 1, "Conv Block\n(Conv + BN + ReLU)", "#F4B183")
add_box(4.6, 2.2, 1.8, 1, "Residual Block", "#F4B183")
add_box(6.7, 2.2, 1.8, 1, "Attention Block", "#F4B183")
add_box(8.8, 2.2, 1.8, 1, "Flatten + Dense", "#F4B183")

# --- Latent space ---
add_box(11, 2.2, 1.5, 1, "Latent Space (z)\nMean & Variance", "#EAD1DC")

# --- Decoder ---
add_box(8.8, 0.5, 1.8, 1, "Dense + Reshape", "#9DC3E6")
add_box(6.7, 0.5, 1.8, 1, "Deconv + BN + ReLU", "#9DC3E6")
add_box(4.6, 0.5, 1.8, 1, "Residual Block", "#9DC3E6")
add_box(2.5, 0.5, 1.8, 1, "Output Layer\n(Sigmoid/Tanh)", "#9DC3E6")
add_box(0.5, 0.5, 1.5, 1, "Reconstructed Image", "#C9DAF8")

# --- Arrows for Encoder ---
arrow_props = dict(arrowstyle="->", lw=1.8, color="black")
ax.annotate("", xy=(2.5, 2.7), xytext=(2.0, 2.7), arrowprops=arrow_props)
ax.annotate("", xy=(4.6, 2.7), xytext=(4.3, 2.7), arrowprops=arrow_props)
ax.annotate("", xy=(6.7, 2.7), xytext=(6.4, 2.7), arrowprops=arrow_props)
ax.annotate("", xy=(8.8, 2.7), xytext=(8.5, 2.7), arrowprops=arrow_props)
ax.annotate("", xy=(11, 2.7), xytext=(10.6, 2.7), arrowprops=arrow_props)

# --- Arrows for Decoder ---
ax.annotate("", xy=(8.8, 1.0), xytext=(11, 1.0), arrowprops=arrow_props)
ax.annotate("", xy=(6.7, 1.0), xytext=(8.5, 1.0), arrowprops=arrow_props)
ax.annotate("", xy=(4.6, 1.0), xytext=(6.4, 1.0), arrowprops=arrow_props)
ax.annotate("", xy=(2.5, 1.0), xytext=(4.3, 1.0), arrowprops=arrow_props)
ax.annotate("", xy=(0.5, 1.0), xytext=(2.0, 1.0), arrowprops=arrow_props)

# --- VAE bottleneck arrows ---
ax.annotate("Sampling\n(z ~ N(μ,σ²))", xy=(10.2, 1.8), xytext=(10.3, 1.3),
            fontsize=10, ha="center", arrowprops=dict(arrowstyle="-|>", lw=1.5))

# --- Section labels ---
ax.text(1.2, 3.6, "Encoder", fontsize=13, fontweight="bold", color="#C55A11")
ax.text(9.8, 3.6, "Latent Representation", fontsize=13, fontweight="bold", color="#843C0C")
ax.text(5.5, 0.2, "Decoder", fontsize=13, fontweight="bold", color="#2E75B6")

plt.tight_layout()
plt.savefig("vae_architecture_poster.png", dpi=300, bbox_inches="tight")
plt.show()