"""AI resume tailoring service: generates tailored resume sections using OpenAI/Claude."""

import json

from app.config import settings


async def tailor_resume(
    job_description: str,
    job_title: str,
    company_name: str,
    requirements: dict | None,
    resume_sections: dict,
    model: str | None = None,
) -> dict:
    """Generate a tailored resume for a specific job posting.

    Returns dict with:
        - tailored_sections: the full tailored resume as structured JSON
        - diff_summary: per-section changes with rationale
        - model_used: which AI model was used
        - prompt_tokens: token usage
        - completion_tokens: token usage
    """
    model = model or settings.default_ai_model
    prompt = _build_prompt(job_description, job_title, company_name, requirements, resume_sections)

    if model.startswith("claude"):
        return await _call_anthropic(prompt, model)
    else:
        return await _call_openai(prompt, model)


def _build_prompt(
    job_description: str,
    job_title: str,
    company_name: str,
    requirements: dict | None,
    resume_sections: dict,
) -> str:
    reqs_text = json.dumps(requirements, indent=2) if requirements else "Not parsed"
    sections_text = json.dumps(resume_sections, indent=2)

    return f"""## Job Posting
Title: {job_title} at {company_name}
Description:
{job_description}

Requirements:
{reqs_text}

## Current Resume
{sections_text}

## Instructions
For each resume section, provide:
1. The tailored version
2. A brief rationale explaining what changed and why

Focus on:
- Rewriting the summary to mirror the job's key requirements
- Reordering and rewording experience bullets to emphasize relevant skills
- Highlighting matching skills, deprioritizing irrelevant ones
- Matching the job's terminology where your experience supports it
- NEVER fabricate experience. Only reframe, reorder, and emphasize existing content.

Return valid JSON matching this schema:
{{
  "tailored_sections": {{
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "certifications": [...],
    "projects": [...]
  }},
  "diff_summary": [
    {{
      "section": "summary",
      "original": "original text...",
      "suggested": "tailored text...",
      "rationale": "why this change was made"
    }}
  ]
}}"""


SYSTEM_PROMPT = (
    "You are an expert resume tailor. You modify resumes to better match "
    "specific job postings while maintaining truthfulness. Never fabricate "
    "experience. Only reframe, reorder, and emphasize existing experience. "
    "Always respond with valid JSON only."
)


async def _call_anthropic(prompt: str, model: str) -> dict:
    """Call the Anthropic Claude API."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    response = await client.messages.create(
        model=model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text
    result = json.loads(content)
    result["model_used"] = model
    result["prompt_tokens"] = response.usage.input_tokens
    result["completion_tokens"] = response.usage.output_tokens
    return result


async def _call_openai(prompt: str, model: str) -> dict:
    """Call the OpenAI API."""
    import openai

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    content = response.choices[0].message.content
    result = json.loads(content)
    result["model_used"] = model
    result["prompt_tokens"] = response.usage.prompt_tokens
    result["completion_tokens"] = response.usage.completion_tokens
    return result
