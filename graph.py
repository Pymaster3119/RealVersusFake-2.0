import matplotlib.pyplot as plt
import numpy as np

# Data
models = ["GPT-5", "OpenAI o3", "GPT-4o"]
without_thinking = [52.8, 69.1, 30.8]
with_thinking_extra = [74.9 - 52.8, 0, 0]  # Only GPT-5 has "with thinking" extra

# Bar positions
x = np.arange(len(models))

# Bar width
bar_width = 0.6

# Colors
without_color = "#f4a3c3"  # light pink
with_color = "#d06aa4"     # darker pink

# Plot bars
plt.bar(x, without_thinking, bar_width, label="Without thinking", color=without_color)
plt.bar(x, with_thinking_extra, bar_width, bottom=without_thinking, label="With thinking", color=with_color)

# Add text labels
for i, v in enumerate(without_thinking):
    plt.text(i, v/2, str(v), ha='center', va='center', fontsize=10, color="black")
for i, (w, extra) in enumerate(zip(without_thinking, with_thinking_extra)):
    if extra > 0:
        plt.text(i, w + extra/2, str(w+extra), ha='center', va='center', fontsize=10, color="black")

# Labels and title
plt.xticks(x, models)
plt.ylabel("Accuracy (%), pass@1")
plt.title("SWE-bench Verified\nSoftware engineering")
plt.legend()

# Layout
plt.tight_layout()
plt.show()