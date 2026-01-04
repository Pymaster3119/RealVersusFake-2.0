"""Deepfake video detector using HuggingFace video-classification models."""

from typing import Dict, List

import numpy as np
import torch
from transformers import pipeline


VIDEO = "Dictators_-_Kim_Jong-Un_by_RepresentUs.webm.720p.vp9.mp4"
MODELS = [
	"shylhy/videomae-large-finetuned-deepfake-subset",
	"mhamza-007/cvit_deepfake_detection",
	"Ammar2k/videomae-base-finetuned-deepfake-subset",
	"thugCodeNinja/DeepFakeDetect",
]
THRESHOLD = 0.5


def fake_probability(predictions: List[Dict]) -> float:
	scores = {p["label"].lower(): p["score"] for p in predictions}
	fake_score = scores.get("fake", 0.0) or scores.get("deepfake", 0.0)
	real_score = scores.get("real", 0.0) or scores.get("live", 0.0)
	norm = fake_score + real_score
	return fake_score / norm if norm > 0 else fake_score


def main() -> None:
	device = 0 if torch.cuda.is_available() else "cpu"
	results = []
	errors = []

	for model_id in MODELS:
		try:
			clf = pipeline("video-classification", model=model_id, device=device)
			preds = clf(VIDEO)
			prob = fake_probability(preds)
			decision = "fake" if prob >= THRESHOLD else "real"
			results.append({"model": model_id, "prob": prob, "decision": decision})
		except Exception as exc:
			errors.append(f"{model_id}: {exc}")

	if not results:
		print("[error] All models failed:", "; ".join(errors))
		return

	probs = [r["prob"] for r in results]
	ensemble_prob = float(np.mean(probs))
	ensemble_decision = "fake" if ensemble_prob >= THRESHOLD else "real"

	print(f"=== Deepfake detection: {VIDEO} ===")
	for r in results:
		print(f"- {r['model']}: {r['prob']:.3f} → {r['decision']}")
	if errors:
		print("Skipped:", "; ".join(errors))
	print(f"\nEnsemble: {ensemble_prob:.3f} → {ensemble_decision}")


if __name__ == "__main__":
	main()
