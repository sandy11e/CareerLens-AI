import json
import logging
import requests
from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger("careerlens.groq")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

def is_groq_configured() -> bool:
    return bool(GROQ_API_KEY and GROQ_API_KEY.strip() and GROQ_API_KEY != "your_groq_api_key_here")

def call_groq_chat(messages: list, response_format_json: bool = False, temperature: float = 0.2, model: str = None) -> str:
    """
    Calls the Groq API via direct REST with robust error handling and timeout.
    """
    if not is_groq_configured():
        raise ValueError("GROQ_API_KEY is not configured in backend/.env. Please add your free key from https://console.groq.com/keys")

    active_model = model or GROQ_MODEL or "openai/gpt-oss-120b"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": active_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4096
    }

    if response_format_json:
        payload["response_format"] = {"type": "json_object"}

    try:
        response = requests.post(GROQ_ENDPOINT, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            error_msg = f"Groq API Error ({response.status_code}): {response.text}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return content.strip()
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error communicating with Groq: {e}")
        raise RuntimeError(f"Network error calling Groq API: {str(e)}")

def generate_structured_json(prompt: str, system_prompt: str = "", model: str = None) -> dict:
    """
    Guarantees structured JSON output from Groq.
    """
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    else:
        messages.append({"role": "system", "content": "You are an expert AI. You must respond ONLY with valid JSON."})

    messages.append({"role": "user", "content": prompt})

    raw_content = call_groq_chat(messages, response_format_json=True, temperature=0.1, model=model)
    
    try:
        return json.loads(raw_content)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from Groq: {raw_content[:200]}")
        # Try finding JSON substring if any wrapper slipped through
        start = raw_content.find("{")
        end = raw_content.rfind("}")
        if start != -1 and end != -1:
            return json.loads(raw_content[start:end+1])
        raise ValueError(f"Model did not return valid JSON: {str(e)}")

def generate_text_response(prompt: str, system_prompt: str = "", model: str = None) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    return call_groq_chat(messages, response_format_json=False, temperature=0.3, model=model)
