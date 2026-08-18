# SanjeevaniAI — Machine Learning & Biomedical NER Specification

## 1. Local Neural Architecture

SanjeevaniAI utilizes a dedicated local transformer model for biomedical token classification:

- **Base Architecture**: `roberta-large` (24 layers, 16 attention heads, 1024 hidden dimensions, 355 Million parameters).
- **Fine-Tuning Dataset**: BioCreative V Chemical Disease Relation dataset (BC5CDR).
- **Local Model Path**: `D:\SanjeevaniAI\models\bc5cdr-ner` (1.4 GB model weights).
- **Classification Head**: `RobertaForTokenClassification` with linear projection layer mapping hidden states to BIO label space.
- **Hardware Acceleration**: Automatically prioritizes `CUDA:0` when an NVIDIA GPU is present; gracefully falls back to multithreaded CPU inference.

---

## 2. Label Taxonomy & BIO Tag Normalization

The model is trained on standard IOB2 tagging for biomedical literature:

| Label ID | Raw Tag | Standard Entity Class | Description |
| :--- | :--- | :--- | :--- |
| 0 | `O` | Outside | Non-biomedical token |
| 1 | `B-Chemical` | `CHEMICAL` | Beginning of a chemical/drug entity |
| 2 | `B-Disease` | `DISEASE` | Beginning of a disease/condition entity |
| 3 | `I-Chemical` | `CHEMICAL` | Inside/continuation of a chemical entity |
| 4 | `I-Disease` | `DISEASE` | Inside/continuation of a disease entity |

### Sub-word Token Span Reconstruction
Because RoBERTa uses Byte-Pair Encoding (BPE), sub-word tokens starting with `Ġ` or raw fragments must be mapped back to original text character offsets:
1. Model generates predictions for all tokens.
2. `BC5CDRNERModel` aggregates sequential `B-` and `I-` tokens of matching entity types.
3. Whitespace and sub-word boundary artifacts are resolved using character index tracking `[start_offset, end_offset]`.
4. Extracted text is sliced from original input: `text[start_offset:end_offset]`.

---

## 3. Confidence Calibration & Post-Processing

- Softmax is applied to model output logits $z$:
  $$P(y_i = c) = \frac{e^{z_{i, c}}}{\sum_{j} e^{z_{i, j}}}$$
- Confidence for an entity span $E = (t_1, t_2, \dots, t_k)$ is calculated as the mean token probability:
  $$\text{Confidence}(E) = \frac{1}{k} \sum_{i=1}^k P(y_i = \hat{y}_i)$$
- **Default Confidence Filter**: $\tau = 0.85$. Entities below this threshold are discarded to prevent false positive hallucinations.

---

## 4. Inference Performance Benchmarks

| Hardware Platform | Average Latency (100-word text) | Peak Memory Usage |
| :--- | :--- | :--- |
| NVIDIA GeForce RTX 3050 Laptop GPU (CUDA) | **14.2 ms** | 1,480 MB VRAM |
| Intel Core i7-13700H (CPU Multithreading) | **82.4 ms** | 1,520 MB RAM |

---

## 5. Conversational LLM Architecture (Provider Abstraction)

SanjeevaniAI decouples reasoning from specific LLM vendors via `BaseLLMProvider`:

1. **`GeminiProvider`**: Calls Google Gemini 1.5 Pro / Flash via `google-genai` SDK with healthcare decision-support system prompts, structured JSON schema outputs, and safety settings blocking diagnostic assertions.
2. **`MockLLMProvider`**: High-availability offline fallback providing deterministic, evidence-grounded educational answers for diabetes, hypertension, cardiology, and pharmacology.
3. **Emergency Red-Flag Heuristic Triage**: Runs synchronously prior to LLM inference to identify acute life-threatening presentations (e.g., crushing chest pain, dyspnea, acute neurological deficits) and output emergency escalation notices.
