import matplotlib.pyplot as plt
import numpy as np

# Data
models = ['GPT-5', 'OpenAI 03', 'GPT-4o']
with_thinking = [74.9, 69.1, 30.8]
without_thinking = [52.8, 0, 0]  # Assuming uninformed models get 0

bar_width = 0.35
x = np.arange(len(models))

# Creating the bar chart
fig, ax = plt.subplots()

bars1 = ax.bar(x - bar_width / 2, with_thinking, bar_width, label='With thinking', color='lightpink')
bars2 = ax.bar(x + bar_width / 2, without_thinking, bar_width, label='Without thinking', color='lightblue')

# Adding titles and labels
ax.set_title('SWE-bench Verified: Software Engineering')
ax.set_ylabel('Accuracy (%), pass @1')
ax.set_xticks(x)
ax.set_xticklabels(models)
ax.set_ylim(0, 100)

# Adding legend
ax.legend()

# Saving the chart
plt.tight_layout()
plt.savefig('fixed_chart.png')